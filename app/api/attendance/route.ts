import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/stack/server";
import { DateTime } from "luxon";

// Break types matching the Prisma enum
type BreakType = "SHORT" | "LUNCH" | "PERSONAL" | "OTHER";

// Break interface for type safety
interface BreakRecord {
  id: string;
  attendanceId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  type: BreakType;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Get today's date for a specific timezone
// This returns a Date object representing the LOCAL date (not UTC midnight)
// For example, Dec 4 in PHT will be stored as Dec 4, regardless of UTC offset
function getTodayDate(timezone: string) {
  const now = DateTime.now().setZone(timezone);
  // Create a date using the local date components
  // This ensures Dec 4 in PHT is stored as Dec 4, not Dec 3
  const year = now.year;
  const month = now.month;
  const day = now.day;
  
  // Create a UTC date with the local date values (treating them as UTC)
  // This way, Dec 4 in any timezone is stored as Dec 4 00:00:00 UTC
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
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

    // PRIORITY 1: Check for any ACTIVE attendance (CLOCKED_IN or ON_BREAK) regardless of date
    // This ensures the timer continues even after midnight
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: dbUser.id,
        status: {
          in: ["CLOCKED_IN", "ON_BREAK"],
        },
      },
      include: {
        breaks: {
          orderBy: { startTime: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // PRIORITY 2: If no active attendance, get the most recent one for TODAY (even if CLOCKED_OUT)
    const attendance = activeAttendance || await prisma.attendance.findFirst({
      where: {
        userId: dbUser.id,
        date: today,
      },
      include: {
        breaks: {
          orderBy: { startTime: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check if there's an active break (no endTime)
    const activeBreak = attendance?.breaks.find((b: BreakRecord) => !b.endTime);

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
    const { action, timezone: bodyTimezone, breakType, useNextDay } = body;

    // Get timezone from body, header, or default to UTC
    const timezone =
      bodyTimezone ||
      request.headers.get("x-timezone") ||
      "UTC";

    // Determine the date to use (today or next day)
    const targetDate = useNextDay
      ? getTodayDate(timezone).getTime() + (24 * 60 * 60 * 1000) // Add 1 day in milliseconds
      : getTodayDate(timezone).getTime();
    const date = new Date(targetDate);

    const today = getTodayDate(timezone);
    const now = DateTime.now().setZone(timezone);
    const nowJS = now.toJSDate();

    // Find the most recent active attendance record (regardless of date)
    // This ensures actions like start_break, end_break, clock_out work even after midnight
    let attendance = await prisma.attendance.findFirst({
      where: {
        userId: dbUser.id,
        status: {
          in: ["CLOCKED_IN", "ON_BREAK"],
        },
      },
      include: {
        breaks: {
          orderBy: { startTime: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Find active break (no endTime)
    const activeBreak = attendance?.breaks.find((b: BreakRecord) => !b.endTime);

    switch (action) {
      case "clock_in": {
        if (attendance?.status === "CLOCKED_IN" || attendance?.status === "ON_BREAK") {
          return NextResponse.json(
            { error: "Already clocked in" },
            { status: 400 }
          );
        }

        // Create a new attendance record (allows multiple per day)
        attendance = await prisma.attendance.create({
          data: {
            userId: dbUser.id,
            date: today,
            timezone: timezone,
            clockIn: nowJS,
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
        
        // Calculate net work minutes (duration minus breaks)
        const netWorkMinutes = duration - (attendance.totalBreak || 0);
        
        // Calculate total hours as a decimal (e.g., 8.5 for 8 hours 30 minutes)
        const totalHours = parseFloat((netWorkMinutes / 60).toFixed(2));

        // Update attendance with clock out
        // If useNextDay is true, also update the date field
        attendance = await prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            ...(useNextDay ? { date } : {}), // Update date to next day if requested
            clockOut: nowJS,
            duration: duration, // Store total elapsed time (not subtracting breaks)
            totalHours: totalHours, // Store net work hours (duration - breaks)
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
    const newActiveBreak = attendance?.breaks.find((b: BreakRecord) => !b.endTime);

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
