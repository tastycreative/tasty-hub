import { prisma } from "@/lib/db";

export interface TeamWithMemberCount {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  memberCount: number;
}

interface PrismaTeamWithCount {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  _count: {
    userTeams: number;
  };
}

interface PrismaUserTeamWithTeam {
  team: PrismaTeamWithCount;
}

// Server-side function to fetch all teams
export async function getTeams(): Promise<TeamWithMemberCount[]> {
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

    return (teams as PrismaTeamWithCount[]).map((team) => ({
      id: team.id,
      name: team.name,
      slug: team.slug,
      logo: team.logo,
      plan: team.plan,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      ownerId: team.ownerId,
      memberCount: team._count.userTeams,
    }));
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

// Server-side function to fetch teams for a specific user
export async function getTeamsForUser(userId: string): Promise<TeamWithMemberCount[]> {
  try {
    const userTeams = await prisma.userTeam.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: {
              select: { userTeams: true },
            },
          },
        },
      },
    });

    return (userTeams as PrismaUserTeamWithTeam[]).map((ut) => ({
      id: ut.team.id,
      name: ut.team.name,
      slug: ut.team.slug,
      logo: ut.team.logo,
      plan: ut.team.plan,
      createdAt: ut.team.createdAt,
      updatedAt: ut.team.updatedAt,
      ownerId: ut.team.ownerId,
      memberCount: ut.team._count.userTeams,
    }));
  } catch (error) {
    console.error("Error fetching teams for user:", error);
    return [];
  }
}

// Get a single team by slug
export async function getTeamBySlug(slug: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { slug },
      include: {
        owner: true,
        _count: {
          select: { userTeams: true },
        },
      },
    });

    if (!team) return null;

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      logo: team.logo,
      plan: team.plan,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      owner: {
        id: team.owner.id,
        name: team.owner.displayName || team.owner.email,
        email: team.owner.email,
      },
      memberCount: team._count.userTeams,
    };
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
}
