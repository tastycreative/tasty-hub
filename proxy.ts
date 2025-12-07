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

  // Get the selected team slug from cookie
  const selectedTeamCookie = request.cookies.get("selected-team");
  const selectedTeamSlug = selectedTeamCookie?.value;

  // Check if the current path is a team-specific route
  const isAdminRoute = pathname.startsWith("/admin");
  const isHrRoute = pathname.startsWith("/hr");
  const isViewerRoute = pathname.startsWith("/viewer");

  // Allow access to /dashboard without cookie (let the page handle routing)
  if (pathname === "/dashboard") {
    return NextResponse.next();
  }

  // Allow access to viewer routes without redirect
  if (isViewerRoute) {
    return NextResponse.next();
  }

  // If no team cookie is set, let the app routes handle it
  // (dashboard page will create user and redirect appropriately)
  if (!selectedTeamSlug) {
    return NextResponse.next();
  }

  // Check if user is accessing the correct route for their selected team
  // Admin team: should be on /admin
  if (selectedTeamSlug === "admin" && !isAdminRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  // HR team: should be on /hr
  if (selectedTeamSlug === "hr" && !isHrRoute) {
    return NextResponse.redirect(new URL("/hr", request.url));
  }
  // Viewer: should be on /viewer
  if (selectedTeamSlug === "viewer" && !isViewerRoute) {
    return NextResponse.redirect(new URL("/viewer", request.url));
  }
  // Regular team: should be on /team/[slug]
  if (selectedTeamSlug !== "admin" && selectedTeamSlug !== "hr" && selectedTeamSlug !== "viewer") {
    const expectedPath = `/team/${selectedTeamSlug}`;
    if (!pathname.startsWith(expectedPath)) {
      return NextResponse.redirect(new URL(expectedPath, request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and auth routes
    "/((?!_next/static|_next/image|favicon.ico|api|handler|sign-in|sign-up|forgot-password).*)",
  ],
};
