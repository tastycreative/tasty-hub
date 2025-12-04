import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/[id]/roles - Get user's team roles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const userTeams = await prisma.userTeam.findMany({
      where: { userId: id },
      include: {
        team: true,
      },
    });

    return NextResponse.json(userTeams);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id]/roles - Update user's role in a team
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { teamId, role } = body;

    // Validate role
    const validRoles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, ADMIN, MEMBER, or VIEWER" },
        { status: 400 }
      );
    }

    // Find the userTeam record
    const userTeam = await prisma.userTeam.findUnique({
      where: {
        userId_teamId: {
          userId: id,
          teamId: teamId,
        },
      },
    });

    if (!userTeam) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 404 }
      );
    }

    // Update the role
    const updatedUserTeam = await prisma.userTeam.update({
      where: {
        userId_teamId: {
          userId: id,
          teamId: teamId,
        },
      },
      data: {
        role: role,
      },
      include: {
        team: true,
        user: true,
      },
    });

    return NextResponse.json(updatedUserTeam);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/roles - Add user to a team with a role
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { teamId, role = "MEMBER" } = body;

    // Validate role
    const validRoles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, ADMIN, MEMBER, or VIEWER" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Create userTeam record
    const userTeam = await prisma.userTeam.create({
      data: {
        userId: id,
        teamId: teamId,
        role: role,
      },
      include: {
        team: true,
        user: true,
      },
    });

    return NextResponse.json(userTeam, { status: 201 });
  } catch (error: unknown) {
    // Check for unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 409 }
      );
    }

    console.error("Error adding user to team:", error);
    return NextResponse.json(
      { error: "Failed to add user to team" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/roles - Remove user from a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "teamId is required" },
        { status: 400 }
      );
    }

    await prisma.userTeam.delete({
      where: {
        userId_teamId: {
          userId: id,
          teamId: teamId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing user from team:", error);
    return NextResponse.json(
      { error: "Failed to remove user from team" },
      { status: 500 }
    );
  }
}
