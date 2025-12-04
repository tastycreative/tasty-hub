import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/stack/server";

interface UserTeamWithTeam {
  role: string;
  team: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    plan: string;
    _count: {
      userTeams: number;
    };
  };
}

// GET /api/teams/my - Get teams for the current user
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in our database
    const dbUser = await prisma.user.findUnique({
      where: { stackAuthId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's teams with their role
    const userTeams = await prisma.userTeam.findMany({
      where: { userId: dbUser.id },
      include: {
        team: {
          include: {
            _count: {
              select: { userTeams: true },
            },
          },
        },
      },
      orderBy: {
        team: {
          name: "asc",
        },
      },
    });

    // Transform the data
    const teams = (userTeams as UserTeamWithTeam[]).map((ut) => ({
      id: ut.team.id,
      name: ut.team.name,
      slug: ut.team.slug,
      logo: ut.team.logo,
      plan: ut.team.plan,
      role: ut.role,
      memberCount: ut.team._count.userTeams,
    }));

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
