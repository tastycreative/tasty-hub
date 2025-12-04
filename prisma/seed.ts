import "dotenv/config";
import { prisma } from "../lib/db";

const roles = [
  {
    name: "OWNER",
    description: "Full access to all resources and settings. Can manage billing and delete the organization.",
    permissions: [
      "org:manage",
      "org:delete",
      "billing:manage",
      "team:create",
      "team:delete",
      "team:manage",
      "user:invite",
      "user:remove",
      "user:manage",
      "role:assign",
      "content:create",
      "content:edit",
      "content:delete",
      "content:view",
    ],
  },
  {
    name: "ADMIN",
    description: "Can manage teams, users, and most settings. Cannot delete organization or manage billing.",
    permissions: [
      "team:create",
      "team:manage",
      "user:invite",
      "user:remove",
      "user:manage",
      "role:assign",
      "content:create",
      "content:edit",
      "content:delete",
      "content:view",
    ],
  },
  {
    name: "MEMBER",
    description: "Standard team member with access to create and edit content.",
    permissions: [
      "content:create",
      "content:edit",
      "content:view",
      "team:view",
      "user:view",
    ],
  },
  {
    name: "VIEWER",
    description: "Read-only access. Can view content but cannot make changes.",
    permissions: [
      "content:view",
      "team:view",
      "user:view",
    ],
  },
];

// Team types that correspond to the sidebar navigation
const teams = [
  {
    name: "Admin",
    slug: "admin",
    logo: null,
    plan: "enterprise",
  },
  {
    name: "HR",
    slug: "hr",
    logo: null,
    plan: "pro",
  },
  {
    name: "AI Content Team",
    slug: "team",
    logo: null,
    plan: "pro",
  },
];

async function seedRoles() {
  console.log("🌱 Seeding roles...\n");

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (existingRole) {
      const updated = await prisma.role.update({
        where: { name: role.name },
        data: {
          description: role.description,
          permissions: role.permissions,
        },
      });
      console.log(`✅ Updated role: ${updated.name}`);
    } else {
      const created = await prisma.role.create({
        data: {
          name: role.name,
          description: role.description,
          permissions: role.permissions,
        },
      });
      console.log(`✅ Created role: ${created.name}`);
    }
  }
}

async function seedTeams() {
  console.log("\n🌱 Seeding teams...\n");

  // First, get or create a default owner (the first user in the system)
  let owner = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!owner) {
    console.log("⚠️  No users found. Creating a placeholder owner...");
    owner = await prisma.user.create({
      data: {
        stackAuthId: "seed-owner",
        email: "admin@tastyhub.com",
        displayName: "System Admin",
      },
    });
    console.log(`✅ Created placeholder owner: ${owner.email}`);
  }

  for (const team of teams) {
    const existingTeam = await prisma.team.findUnique({
      where: { slug: team.slug },
    });

    if (existingTeam) {
      const updated = await prisma.team.update({
        where: { slug: team.slug },
        data: {
          name: team.name,
          logo: team.logo,
          plan: team.plan,
        },
      });
      console.log(`✅ Updated team: ${updated.name}`);
    } else {
      const created = await prisma.team.create({
        data: {
          name: team.name,
          slug: team.slug,
          logo: team.logo,
          plan: team.plan,
          ownerId: owner.id,
        },
      });
      console.log(`✅ Created team: ${created.name}`);

      // Add owner to the team as OWNER role
      await prisma.userTeam.create({
        data: {
          userId: owner.id,
          teamId: created.id,
          role: "OWNER",
        },
      });
      console.log(`   └─ Added ${owner.displayName || owner.email} as OWNER`);
    }
  }
}

async function seed() {
  await seedRoles();
  await seedTeams();
  console.log("\n🎉 Seeding completed!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
