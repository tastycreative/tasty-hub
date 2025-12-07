import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/stack/server";

interface ViewerLayoutProps {
  children: React.ReactNode;
}

export default async function ViewerLayout({ children }: ViewerLayoutProps) {
  // Check if user is authenticated
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Find user in database
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
    redirect("/sign-in");
  }

  // If user has no teams at all, allow them to see viewer page (pending assignment)
  if (dbUser.userTeams.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any VIEWER roles
  const hasViewerRole = dbUser.userTeams.some((ut) => ut.role === "VIEWER");

  // If user has no viewer role (all upgraded), redirect to their first team
  if (!hasViewerRole) {
    const firstTeam = dbUser.userTeams[0].team;
    // Redirect to appropriate dashboard based on team slug
    if (firstTeam.slug === "admin") {
      redirect("/admin");
    } else if (firstTeam.slug === "hr") {
      redirect("/hr");
    } else {
      redirect(`/team/${firstTeam.slug}`);
    }
  }

  // User is a viewer - allow access to viewer pages
  return <>{children}</>;
}
