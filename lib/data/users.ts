import { prisma } from "@/lib/db";

// Type for userTeam with team relation
interface UserTeamWithTeam {
  role: string;
  team: {
    id: string;
    name: string;
  };
}

// Type for user with userTeams relation
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

// Server-side function to fetch all users
export async function getUsers(): Promise<User[]> {
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

    // Transform the data
    return (users as UserWithTeams[]).map((user) => {
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
        status: "Active", // TODO: Add status field to User model
      };
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Server-side function to fetch a single user
export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userTeams: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!user) return null;

    const typedUser = user as UserWithTeams;
    const roles = typedUser.userTeams.map((ut: UserTeamWithTeam) => ut.role);
    return {
      id: typedUser.id,
      stackAuthId: typedUser.stackAuthId,
      name: typedUser.displayName || typedUser.email.split("@")[0],
      email: typedUser.email,
      avatarUrl: typedUser.avatarUrl,
      createdAt: typedUser.createdAt,
      updatedAt: typedUser.updatedAt,
      role: getHighestRole(roles),
      teams: typedUser.userTeams.map((ut: UserTeamWithTeam) => ({
        id: ut.team.id,
        name: ut.team.name,
        role: ut.role,
      })),
      status: "Active",
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Type for user stats
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingInvites: number;
}

// Server-side function to get user statistics
export async function getUserStats(): Promise<UserStats> {
  try {
    const totalUsers = await prisma.user.count();
    
    // TODO: Add status field to User model for proper active/pending tracking
    // For now, all users are considered active
    return {
      totalUsers,
      activeUsers: totalUsers,
      pendingInvites: 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      pendingInvites: 0,
    };
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
