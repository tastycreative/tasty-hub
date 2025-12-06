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
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebarStore, toTeamData, type TeamType, type TeamData } from "@/lib/stores/sidebar-store";

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
  // Timesheet for Admin
  {
    title: "My Timesheet",
    url: "/admin/timesheet",
    icon: Clock,
  },
  {
    title: "My Team",
    url: "#",
    icon: UsersRound,
    items: [
      {
        title: "Members",
        url: "/admin/members",
      },
      {
        title: "Directory",
        url: "/admin/directory",
      },
      {
        title: "Calendar",
        url: "/admin/calendar",
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
        url: "/admin/profile",
      },
      {
        title: "My Documents",
        url: "/admin/profile/documents",
      },
      {
        title: "Settings",
        url: "/admin/profile/settings",
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
  // Attendance for HR (manages all users)
  {
    title: "Attendance",
    url: "/hr/attendance",
    icon: ClipboardCheck,
  },
  // Timesheet for HR
  {
    title: "My Timesheet",
    url: "/hr/timesheet",
    icon: Clock,
  },
  {
    title: "My Team",
    url: "#",
    icon: UsersRound,
    items: [
      {
        title: "Members",
        url: "/hr/members",
      },
      {
        title: "Directory",
        url: "/hr/directory",
      },
      {
        title: "Calendar",
        url: "/hr/calendar",
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
        url: "/hr/profile",
      },
      {
        title: "My Documents",
        url: "/hr/profile/documents",
      },
      {
        title: "Settings",
        url: "/hr/profile/settings",
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
    title: "My Timesheet",
    url: "/team/timesheet",
    icon: Clock,
    isActive: true,
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

// Transform teams to UI teams with icons
function getTeamsWithIcons(teams: TeamData[]) {
  return teams.map((team) => ({
    ...team,
    logo: teamIcons[team.slug] || teamIcons[team.type] || Sparkles,
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
  const { teams: storeTeams, setTeams, selectedTeam, setSelectedTeam } = useSidebarStore();
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Wait for hydration to prevent mismatch
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch teams from API
  React.useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch("/api/teams");
        if (response.ok) {
          const dbTeams = await response.json();
          if (dbTeams.length > 0) {
            const teamData = dbTeams.map((t: { id: string; name: string; slug: string; logo?: string | null; plan?: string }) => toTeamData(t));
            setTeams(teamData);
          }
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeams();
  }, [setTeams]);

  // Get teams with icons
  const teams = React.useMemo(() => getTeamsWithIcons(storeTeams), [storeTeams]);

  // Get current active team with icon
  const activeTeam = React.useMemo(() => {
    return {
      ...selectedTeam,
      logo: teamIcons[selectedTeam.slug] || teamIcons[selectedTeam.type] || Sparkles,
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
      const storeTeam = storeTeams.find((t) => t.id === team.id);
      if (storeTeam) {
        setSelectedTeam(storeTeam);
        // Redirect to the team's dashboard
        router.push(getTeamDashboardUrl(storeTeam.type));
      }
    },
    [storeTeams, setSelectedTeam, router]
  );

  // Show skeleton during hydration
  if (!isHydrated || isLoading) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          {/* Logo skeleton */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {/* Team switcher skeleton */}
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* Navigation skeleton */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <Skeleton className="h-3 w-16" />
            </SidebarGroupLabel>
            <SidebarMenu>
              {[1, 2, 3, 4].map((i) => (
                <SidebarMenuItem key={i}>
                  <div className="flex items-center gap-2 rounded-md p-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" style={{ animationDelay: `${i * 100}ms` }} />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          {/* Docs skeleton */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <Skeleton className="h-3 w-12" />
            </SidebarGroupLabel>
            <SidebarMenu>
              {[1, 2, 3].map((i) => (
                <SidebarMenuItem key={i}>
                  <div className="flex items-center gap-2 rounded-md p-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" style={{ animationDelay: `${i * 100 + 400}ms` }} />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {/* User skeleton */}
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 rounded-md p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
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
              <Link href="/dashboard" className="flex items-center justify-between w-full">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Tasty Hub</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Management Platform
                  </span>
                </div>
                <div className="group-data-[collapsible=icon]:hidden" onClick={(e) => e.preventDefault()}>
                  <ThemeToggle />
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
