import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { z } from "zod";

// GET /api/teams - Get all teams
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: { userTeams: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// Validation schema for creating a team
const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  logo: z.string().refine((val) => !val || /^https?:\/\/.+/.test(val), "Must be a valid URL").optional().nullable(),
});

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database with their teams
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is admin or HR
    const isAdminOrHr = dbUser.userTeams.some(
      (ut: { team: { slug: string } }) => ut.team.slug === "admin" || ut.team.slug === "hr"
    );

    if (!isAdminOrHr) {
      return NextResponse.json(
        { error: "Only admin and HR users can create teams" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    // Check if slug is already taken
    const existingTeam = await prisma.team.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "Team slug already exists" },
        { status: 409 }
      );
    }

    // Create team with owner and user-team relationship in a transaction
    const team = await prisma.$transaction(async (tx) => {
      // Create the team
      const newTeam = await tx.team.create({
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          logo: validatedData.logo,
          plan: "free", // Default plan
          ownerId: dbUser.id,
        },
      });

      // Create UserTeam relationship with OWNER role
      await tx.userTeam.create({
        data: {
          userId: dbUser.id,
          teamId: newTeam.id,
          role: "OWNER",
        },
      });

      return newTeam;
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
