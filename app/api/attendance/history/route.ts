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

    // Find current user in database
    const dbUser = await prisma.user.findUnique({
      where: { stackAuthId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");

    // Determine which user's attendance to fetch
    // If userId is provided and not equal to current user, check if current user has HR permissions
    let targetUserId = dbUser.id;

    if (userIdParam && userIdParam !== dbUser.id) {
      // TODO: Add permission check here - only HR should be able to view other users' attendance
      // For now, we'll allow it (will be restricted by route protection)
      targetUserId = userIdParam;
    }

    // Build where clause
    const where: any = {
      userId: targetUserId,
    };

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
