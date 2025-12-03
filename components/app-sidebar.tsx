"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Clock,
  FileText,
  Settings2,
  UsersRound,
  Shield,
  Building2,
  ClipboardCheck,
  FolderOpen,
  Sparkles,
  KeyRound,
  UserCheck,
  Briefcase,
  CalendarDays,
  UserCog,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSidebarStore, STATIC_TEAMS, type TeamType } from "@/lib/stores/sidebar-store";

// Navigation config for Admin Team
const adminNavMain = [
  {
    title: "Users",
    url: "#",
    icon: Users,
    isActive: true,
    items: [
      {
        title: "All Users",
        url: "/admin/users",
      },
      {
        title: "Add User",
        url: "/admin/users/add",
      },
      {
        title: "Invitations",
        url: "/admin/users/invitations",
      },
    ],
  },
  {
    title: "Roles & Permissions",
    url: "#",
    icon: KeyRound,
    items: [
      {
        title: "Roles",
        url: "/admin/roles",
      },
      {
        title: "Permissions",
        url: "/admin/permissions",
      },
      {
        title: "Access Control",
        url: "/admin/access",
      },
    ],
  },
  {
    title: "Teams Management",
    url: "#",
    icon: Building2,
    items: [
      {
        title: "All Teams",
        url: "/admin/teams",
      },
      {
        title: "Create Team",
        url: "/admin/teams/create",
      },
      {
        title: "Departments",
        url: "/admin/departments",
      },
    ],
  },
  {
    title: "System Settings",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "General",
        url: "/admin/settings",
      },
      {
        title: "Security",
        url: "/admin/settings/security",
      },
      {
        title: "Integrations",
        url: "/admin/settings/integrations",
      },
      {
        title: "Audit Logs",
        url: "/admin/settings/audit",
      },
    ],
  },
];

const adminDocs = [
  {
    name: "Admin Guide",
    url: "/admin/docs/guide",
    icon: FileText,
  },
  {
    name: "Security Policies",
    url: "/admin/docs/security",
    icon: Shield,
  },
];

// Navigation config for HR Team
const hrNavMain = [
  {
    title: "Employees",
    url: "#",
    icon: Users,
    isActive: true,
    items: [
      {
        title: "All Employees",
        url: "/hr/employees",
      },
      {
        title: "Add Employee",
        url: "/hr/employees/add",
      },
      {
        title: "Org Chart",
        url: "/hr/org-chart",
      },
    ],
  },
  {
    title: "Team Assignment",
    url: "#",
    icon: UsersRound,
    items: [
      {
        title: "Assign to Team",
        url: "/hr/assignment",
      },
      {
        title: "Team Roster",
        url: "/hr/roster",
      },
      {
        title: "Transfers",
        url: "/hr/transfers",
      },
    ],
  },
  {
    title: "Recruitment",
    url: "#",
    icon: UserPlus,
    items: [
      {
        title: "Job Postings",
        url: "/hr/recruitment/jobs",
      },
      {
        title: "Candidates",
        url: "/hr/recruitment/candidates",
      },
      {
        title: "Interviews",
        url: "/hr/recruitment/interviews",
      },
      {
        title: "Onboarding",
        url: "/hr/onboarding",
      },
    ],
  },
  {
    title: "Employee Records",
    url: "#",
    icon: ClipboardCheck,
    items: [
      {
        title: "Documents",
        url: "/hr/records/documents",
      },
      {
        title: "Contracts",
        url: "/hr/records/contracts",
      },
      {
        title: "Performance",
        url: "/hr/records/performance",
      },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "HR Policies",
        url: "/hr/settings/policies",
      },
      {
        title: "Templates",
        url: "/hr/settings/templates",
      },
    ],
  },
];

const hrDocs = [
  {
    name: "Employee Handbook",
    url: "/hr/docs/handbook",
    icon: FileText,
  },
  {
    name: "HR Policies",
    url: "/hr/docs/policies",
    icon: Briefcase,
  },
  {
    name: "Onboarding Guide",
    url: "/hr/docs/onboarding",
    icon: UserCheck,
  },
];

// Navigation config for Normal Team (e.g., AI Content Team)
const normalNavMain = [
  {
    title: "Attendance",
    url: "#",
    icon: Clock,
    isActive: true,
    items: [
      {
        title: "Clock In/Out",
        url: "/team/attendance",
      },
      {
        title: "My Timesheet",
        url: "/team/attendance/timesheet",
      },
      {
        title: "Leave Requests",
        url: "/team/attendance/leave",
      },
      {
        title: "Schedule",
        url: "/team/attendance/schedule",
      },
    ],
  },
  {
    title: "Team",
    url: "#",
    icon: UsersRound,
    items: [
      {
        title: "Members",
        url: "/team/members",
      },
      {
        title: "Directory",
        url: "/team/directory",
      },
      {
        title: "Calendar",
        url: "/team/calendar",
      },
    ],
  },
  {
    title: "My Profile",
    url: "#",
    icon: UserCog,
    items: [
      {
        title: "Profile",
        url: "/team/profile",
      },
      {
        title: "My Documents",
        url: "/team/profile/documents",
      },
      {
        title: "Settings",
        url: "/team/profile/settings",
      },
    ],
  },
];

const normalDocs = [
  {
    name: "Documents",
    url: "/team/docs",
    icon: FileText,
  },
  {
    name: "Resources",
    url: "/team/docs/resources",
    icon: FolderOpen,
  },
  {
    name: "Meeting Notes",
    url: "/team/docs/meetings",
    icon: CalendarDays,
  },
];

// Team icons mapping
const teamIcons: Record<string, React.ElementType> = {
  admin: Shield,
  hr: Users,
  "ai-content": Sparkles,
};

// Function to get navigation based on team type
function getNavigationForTeam(teamType: TeamType) {
  switch (teamType) {
    case "admin":
      return { navMain: adminNavMain, docs: adminDocs };
    case "hr":
      return { navMain: hrNavMain, docs: hrDocs };
    case "team":
    default:
      return { navMain: normalNavMain, docs: normalDocs };
  }
}

// Transform store teams to UI teams
function getTeamsWithIcons() {
  return STATIC_TEAMS.map((team) => ({
    ...team,
    logo: teamIcons[team.id] || Sparkles,
  }));
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

// Helper to get dashboard URL for team type
function getTeamDashboardUrl(teamType: TeamType): string {
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

export function AppSidebar({ ...props }: AppSidebarProps) {
  const router = useRouter();
  const { selectedTeam, setSelectedTeam } = useSidebarStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Wait for hydration to prevent mismatch
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Get teams with icons
  const teams = React.useMemo(() => getTeamsWithIcons(), []);

  // Get current active team with icon
  const activeTeam = React.useMemo(() => {
    return {
      ...selectedTeam,
      logo: teamIcons[selectedTeam.id] || Sparkles,
    };
  }, [selectedTeam]);

  // Get navigation based on active team type
  const { navMain, docs } = React.useMemo(
    () => getNavigationForTeam(selectedTeam.type),
    [selectedTeam.type]
  );

  // Handle team change - update store and redirect to team dashboard
  const handleTeamChange = React.useCallback(
    (team: (typeof teams)[0]) => {
      const storeTeam = STATIC_TEAMS.find((t) => t.id === team.id);
      if (storeTeam) {
        setSelectedTeam(storeTeam);
        // Redirect to the team's dashboard
        router.push(getTeamDashboardUrl(storeTeam.type));
      }
    },
    [setSelectedTeam, router]
  );

  // Show skeleton during hydration
  if (!isHydrated) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Tasty Hub</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent />
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Tasty Hub</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Management Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <TeamSwitcher
          teams={teams}
          activeTeam={activeTeam}
          onTeamChange={handleTeamChange}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={docs} label="Docs" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
