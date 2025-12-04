import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/teams - Get all teams
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: { userTeams: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
