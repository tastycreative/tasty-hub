import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/stack/server";

interface TeamLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TeamLayout({ children, params }: TeamLayoutProps) {
  const { slug } = await params;

  // Check if user is authenticated
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Find the team by slug
  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      userTeams: {
        where: {
          user: {
            stackAuthId: user.id,
          },
        },
      },
    },
  });

  // If team doesn't exist, show 404
  if (!team) {
    notFound();
  }

  // Check if user is a member of this team
  if (team.userTeams.length === 0) {
    // User is not a member of this team - redirect to their default team or show error
    redirect("/");
  }

  // Check if user is a VIEWER - viewers should only access /viewer routes
  const userTeamRole = team.userTeams[0].role;
  if (userTeamRole === "VIEWER") {
    redirect("/viewer");
  }

  // Team exists and user has access - render children
  return <>{children}</>;
}
