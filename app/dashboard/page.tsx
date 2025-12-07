import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/stack/server";

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Find user in database with their teams
  let dbUser = await prisma.user.findUnique({
    where: { stackAuthId: user.id },
    include: {
      userTeams: {
        include: {
          team: true,
        },
        orderBy: {
          createdAt: "asc", // Get oldest team first (likely their primary team)
        },
      },
    },
  });

  // If user doesn't exist in our database yet, create them
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        stackAuthId: user.id,
        email: user.primaryEmail || "",
        displayName: user.displayName,
        avatarUrl: user.profileImageUrl,
      },
      include: {
        userTeams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  // If user has no teams, redirect to viewer (pending team assignment)
  if (dbUser.userTeams.length === 0) {
    redirect("/viewer");
  }

  // Get the first team
  const firstUserTeam = dbUser.userTeams[0];
  const team = firstUserTeam.team;
  const role = firstUserTeam.role;

  // If user is a VIEWER on any team, redirect to viewer page
  if (role === "VIEWER") {
    redirect("/viewer");
  }

  // Redirect based on team slug
  switch (team.slug) {
    case "admin":
      redirect("/admin");
    case "hr":
      redirect("/hr");
    default:
      // Regular team - redirect to team dashboard with slug
      redirect(`/team/${team.slug}`);
  }
}
