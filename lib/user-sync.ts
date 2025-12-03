import prisma from "@/lib/db";

interface StackAuthUser {
  id: string;
  primaryEmail: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
}

/**
 * Syncs a Stack Auth user to the local database
 * Call this after a user signs up or signs in
 */
export async function syncUserFromStackAuth(stackUser: StackAuthUser) {
  if (!stackUser.primaryEmail) {
    throw new Error("User must have an email");
  }

  const user = await prisma.user.upsert({
    where: { stackAuthId: stackUser.id },
    update: {
      email: stackUser.primaryEmail,
      displayName: stackUser.displayName,
      avatarUrl: stackUser.profileImageUrl,
    },
    create: {
      stackAuthId: stackUser.id,
      email: stackUser.primaryEmail,
      displayName: stackUser.displayName,
      avatarUrl: stackUser.profileImageUrl,
    },
  });

  return user;
}

/**
 * Gets the local user record for a Stack Auth user
 * Creates or updates the user if needed
 */
export async function getOrCreateUser(stackUser: StackAuthUser) {
  if (!stackUser.primaryEmail) {
    throw new Error("User must have an email");
  }

  // Use upsert to handle both create and update cases
  const user = await prisma.user.upsert({
    where: { stackAuthId: stackUser.id },
    update: {
      email: stackUser.primaryEmail,
      displayName: stackUser.displayName,
      avatarUrl: stackUser.profileImageUrl,
    },
    create: {
      stackAuthId: stackUser.id,
      email: stackUser.primaryEmail,
      displayName: stackUser.displayName,
      avatarUrl: stackUser.profileImageUrl,
    },
    include: {
      userTeams: {
        include: {
          team: true,
        },
      },
    },
  });

  return user;
}

/**
 * Gets all teams for a user
 */
export async function getUserTeams(userId: string) {
  const userTeams = await prisma.userTeam.findMany({
    where: { userId },
    include: {
      team: true,
    },
  });

  return userTeams;
}

/**
 * Creates a new team and adds the user as owner
 */
export async function createTeam(
  userId: string,
  data: { name: string; slug: string; logo?: string }
) {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      ownerId: userId,
      userTeams: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: {
      userTeams: true,
    },
  });

  return team;
}
