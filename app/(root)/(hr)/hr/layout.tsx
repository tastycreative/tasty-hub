import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { stackServerApp } from "@/stack/server";

interface HRLayoutProps {
  children: React.ReactNode;
}

export default async function HRLayout({ children }: HRLayoutProps) {
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
        where: {
          team: {
            slug: "hr",
          },
        },
      },
    },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  // Check if user has access to HR team and is not a VIEWER
  if (dbUser.userTeams.length === 0) {
    // No HR access - redirect to home
    redirect("/");
  }

  // Check if user is a VIEWER - viewers should only access /viewer routes
  if (dbUser.userTeams[0].role === "VIEWER") {
    redirect("/viewer");
  }

  // User has HR access with appropriate role - render children
  return <>{children}</>;
}
