import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/stack/server";
import { DateTime } from "luxon";

// Break types matching the Prisma enum
type BreakType = "SHORT" | "LUNCH" | "PERSONAL" | "OTHER";

// Get today's date at midnight for a specific timezone
function getTodayDate(timezone: string) {
  const now = DateTime.now().setZone(timezone);
  // Return as a Date object at midnight UTC for that local date
  return now.startOf("day").toUTC().toJSDate();
}

// GET - Get current attendance status for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get timezone from header or query param, default to UTC
    const timezone =
      request.headers.get("x-timezone") ||
      request.nextUrl.searchParams.get("timezone") ||
      "UTC";

    // Find user in our database
    const dbUser = await prisma.user.findUnique({
      where: { stackAuthId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = getTodayDate(timezone);

    // Get today's attendance record with breaks
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: dbUser.id,
          date: today,
        },
      },
      include: {
        breaks: {
          orderBy: { startTime: "desc" },
        },
      },
    });

    // Check if there's an active break (no endTime)
    const activeBreak = attendance?.breaks.find((b) => !b.endTime);

    // Get current server time in user's timezone
    const serverTime = DateTime.now().setZone(timezone).toISO();

    return NextResponse.json({
      attendance: attendance || null,
      activeBreak: activeBreak || null,
      serverTime,
      timezone,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST - Clock in/out or manage breaks
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackAuthId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action, timezone: bodyTimezone, breakType } = body;

    // Get timezone from body, header, or default to UTC
    const timezone =
      bodyTimezone ||
      request.headers.get("x-timezone") ||
      "UTC";

    const today = getTodayDate(timezone);
    const now = DateTime.now().setZone(timezone);
    const nowJS = now.toJSDate();

    // Get or create today's attendance record with breaks
    let attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: dbUser.id,
          date: today,
        },
      },
      include: {
        breaks: {
          orderBy: { startTime: "desc" },
        },
      },
    });

    // Find active break (no endTime)
    const activeBreak = attendance?.breaks.find((b) => !b.endTime);

    switch (action) {
      case "clock_in": {
        if (attendance?.status === "CLOCKED_IN" || attendance?.status === "ON_BREAK") {
          return NextResponse.json(
            { error: "Already clocked in" },
            { status: 400 }
          );
        }

        attendance = await prisma.attendance.upsert({
          where: {
            userId_date: {
              userId: dbUser.id,
              date: today,
            },
          },
          create: {
            userId: dbUser.id,
            date: today,
            timezone: timezone,
            clockIn: nowJS,
            status: "CLOCKED_IN",
          },
          update: {
            clockIn: nowJS,
            clockOut: null,
            duration: null,
            totalBreak: 0,
            status: "CLOCKED_IN",
          },
          include: {
            breaks: true,
          },
        });
        break;
      }

      case "clock_out": {
        if (!attendance || (attendance.status !== "CLOCKED_IN" && attendance.status !== "ON_BREAK")) {
          return NextResponse.json(
            { error: "Not clocked in" },
            { status: 400 }
          );
        }

        // If on break, end it first
        if (activeBreak) {
          const breakStart = DateTime.fromJSDate(activeBreak.startTime);
          const breakDuration = Math.round(now.diff(breakStart, "minutes").minutes);
          
          await prisma.break.update({
            where: { id: activeBreak.id },
            data: {
              endTime: nowJS,
              duration: breakDuration,
            },
          });
          
          // Update total break time
          attendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
              totalBreak: (attendance.totalBreak || 0) + breakDuration,
            },
            include: { breaks: true },
          });
        }

        // Calculate duration in minutes using Luxon
        const clockInTime = DateTime.fromJSDate(attendance.clockIn!);
        const duration = Math.round(now.diff(clockInTime, "minutes").minutes);

        attendance = await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            clockOut: nowJS,
            duration: duration - (attendance.totalBreak || 0),
            status: "CLOCKED_OUT",
          },
          include: {
            breaks: true,
          },
        });
        break;
      }

      case "start_break": {
        if (!attendance || attendance.status !== "CLOCKED_IN") {
          return NextResponse.json(
            { error: "Must be clocked in to start break" },
            { status: 400 }
          );
        }

        if (activeBreak) {
          return NextResponse.json(
            { error: "Already on break" },
            { status: 400 }
          );
        }

        // Create a new break record
        await prisma.break.create({
          data: {
            attendanceId: attendance.id,
            startTime: nowJS,
            type: (breakType as BreakType) || "SHORT",
          },
        });

        attendance = await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            status: "ON_BREAK",
          },
          include: {
            breaks: {
              orderBy: { startTime: "desc" },
            },
          },
        });
        break;
      }

      case "end_break": {
        if (!attendance || attendance.status !== "ON_BREAK" || !activeBreak) {
          return NextResponse.json(
            { error: "Not on break" },
            { status: 400 }
          );
        }

        // Calculate break duration using Luxon
        const breakStart = DateTime.fromJSDate(activeBreak.startTime);
        const breakDuration = Math.round(now.diff(breakStart, "minutes").minutes);

        // Update the break record
        await prisma.break.update({
          where: { id: activeBreak.id },
          data: {
            endTime: nowJS,
            duration: breakDuration,
          },
        });

        attendance = await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            totalBreak: (attendance.totalBreak || 0) + breakDuration,
            status: "CLOCKED_IN",
          },
          include: {
            breaks: {
              orderBy: { startTime: "desc" },
            },
          },
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Get the new active break if any
    const newActiveBreak = attendance?.breaks.find((b) => !b.endTime);

    return NextResponse.json({
      attendance,
      activeBreak: newActiveBreak || null,
      serverTime: now.toISO(),
      timezone,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

// PATCH - Update attendance with shift report
export async function PATCH(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackAuthId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { attendanceId, shiftReport, timezone: bodyTimezone } = body;

    if (!attendanceId) {
      return NextResponse.json(
        { error: "Attendance ID is required" },
        { status: 400 }
      );
    }

    // Get timezone from body, header, or default to UTC
    const timezone =
      bodyTimezone ||
      request.headers.get("x-timezone") ||
      "UTC";

    const now = DateTime.now().setZone(timezone);
    const nowJS = now.toJSDate();

    // Find the attendance record
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        breaks: {
          orderBy: { startTime: "desc" },
        },
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    // Verify the attendance belongs to this user
    if (attendance.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update the attendance with the shift report
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        shiftReport: shiftReport || null,
        reportedAt: shiftReport ? nowJS : null,
      },
      include: {
        breaks: {
          orderBy: { startTime: "desc" },
        },
      },
    });

    return NextResponse.json({
      attendance: updatedAttendance,
      serverTime: now.toISO(),
      timezone,
    });
  } catch (error) {
    console.error("Error updating shift report:", error);
    return NextResponse.json(
      { error: "Failed to update shift report" },
      { status: 500 }
    );
  }
}
