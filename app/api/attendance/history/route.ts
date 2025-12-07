import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/stack/server";

/**
 * GET /api/attendance/history
 * Fetch attendance history for timesheet view
 * Query params:
 * - userId: (optional) Filter by user ID - if not provided, returns current user's attendance
 * - startDate: (optional) Filter from this date
 * - endDate: (optional) Filter until this date
 * - limit: (optional) Limit number of results
 */
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find current user in database with their teams
    const dbUser = await prisma.user.findUnique({
      where: { stackAuthId: user.id },
      include: {
        userTeams: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is HR or Admin
    const isHrOrAdmin = dbUser.userTeams.some(
      (ut: { team: { slug: string } }) => ut.team.slug === "hr" || ut.team.slug === "admin"
    );

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");

    // Determine which user's attendance to fetch
    let targetUserId: string | undefined;

    if (userIdParam) {
      // If userId is explicitly provided, use it (requires HR/Admin permission if different from current user)
      if (userIdParam !== dbUser.id && !isHrOrAdmin) {
        return NextResponse.json(
          { error: "Unauthorized to view other users' attendance" },
          { status: 403 }
        );
      }
      targetUserId = userIdParam;
    } else {
      // If no userId provided:
      // - HR/Admin: show all users (don't filter by userId)
      // - Regular users: show only their own
      if (!isHrOrAdmin) {
        targetUserId = dbUser.id;
      }
      // If HR/Admin and no userId, leave targetUserId undefined to fetch all users
    }

    // Build where clause
    const where: any = {};

    // Only filter by userId if targetUserId is set
    if (targetUserId) {
      where.userId = targetUserId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Fetch attendance records
    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        breaks: {
          orderBy: { startTime: "asc" },
        },
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      attendance,
      count: attendance.length,
    });
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance history" },
      { status: 500 }
    );
  }
}
