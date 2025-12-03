import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes belong to which team type
const TEAM_ROUTES: Record<string, string[]> = {
  admin: ["/admin"],
  hr: ["/hr"],
  team: ["/team"],
};

// Routes that are accessible by all authenticated users
const SHARED_ROUTES = ["/dashboard", "/profile", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the selected team from cookie
  const selectedTeamCookie = request.cookies.get("selected-team");
  const selectedTeam = selectedTeamCookie?.value || "admin"; // Default to admin

  // Check if the current path is a team-specific route
  const isAdminRoute = pathname.startsWith("/admin");
  const isHrRoute = pathname.startsWith("/hr");
  const isTeamRoute = pathname.startsWith("/team");

  // Determine required team for current route
  let requiredTeam: string | null = null;
  if (isAdminRoute) requiredTeam = "admin";
  if (isHrRoute) requiredTeam = "hr";
  if (isTeamRoute) requiredTeam = "team";

  // If accessing a team-specific route with wrong team selected
  if (requiredTeam && requiredTeam !== selectedTeam) {
    // Redirect to the dashboard of the selected team
    const redirectUrl = getTeamDashboardUrl(selectedTeam);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // If accessing /dashboard, redirect to team-specific dashboard
  if (pathname === "/dashboard") {
    const redirectUrl = getTeamDashboardUrl(selectedTeam);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

function getTeamDashboardUrl(teamType: string): string {
  switch (teamType) {
    case "admin":
      return "/admin";
    case "hr":
      return "/hr";
    case "team":
      return "/team";
    default:
      return "/admin";
  }
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and auth routes
    "/((?!_next/static|_next/image|favicon.ico|api|handler|sign-in|sign-up|forgot-password).*)",
  ],
};
