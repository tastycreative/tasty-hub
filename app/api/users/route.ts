import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Define types manually based on schema
interface UserTeamWithTeam {
  role: string;
  team: {
    id: string;
    name: string;
  };
}

interface UserWithTeams {
  id: string;
  stackAuthId: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  userTeams: UserTeamWithTeam[];
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        userTeams: {
          include: {
            team: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include team and role info
    const transformedUsers = (users as UserWithTeams[]).map((user) => {
      const roles = user.userTeams.map((ut) => ut.role);
      return {
        id: user.id,
        stackAuthId: user.stackAuthId,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: getHighestRole(roles),
        teams: user.userTeams.map((ut) => ({
          id: ut.team.id,
          name: ut.team.name,
          role: ut.role,
        })),
        status: "Active",
      };
    });

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Helper to get highest role
function getHighestRole(roles: string[]): string {
  const roleOrder = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
  for (const role of roleOrder) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return "VIEWER";
}
