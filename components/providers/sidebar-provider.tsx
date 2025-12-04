"use client";

import * as React from "react";
import { useUser } from "@stackframe/stack";
import { useMyTeams, type Team } from "@/lib/hooks/use-teams";

interface TeamData {
  id: string;
  name: string;
  logo: string | null;
  plan: string;
  role: string;
  slug?: string;
  memberCount?: number;
}

interface UserData {
  name: string;
  email: string;
  avatar: string;
}

interface SidebarContextType {
  user: UserData | null;
  teams: TeamData[];
  activeTeam: TeamData | null;
  setActiveTeam: (team: TeamData) => void;
  isLoading: boolean;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebarContext() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarContextProvider");
  }
  return context;
}

export function SidebarContextProvider({ children }: { children: React.ReactNode }) {
  const stackUser = useUser();
  const { data: teamsData, isLoading: isTeamsLoading } = useMyTeams();
  const [activeTeam, setActiveTeam] = React.useState<TeamData | null>(null);

  // Initialize user data from Stack Auth
  const user: UserData | null = stackUser
    ? {
        name: stackUser.displayName || "User",
        email: stackUser.primaryEmail || "",
        avatar: stackUser.profileImageUrl || "",
      }
    : null;

  // Transform teams from API to TeamData format
  const teams: TeamData[] = React.useMemo(() => {
    if (!teamsData) return [];
    return teamsData.map((team: Team) => ({
      id: team.id,
      name: team.name,
      logo: team.logo,
      plan: team.plan,
      role: team.role,
      slug: team.slug,
      memberCount: team.memberCount,
    }));
  }, [teamsData]);

  // Set initial active team when teams are loaded
  React.useEffect(() => {
    if (teams.length > 0 && !activeTeam) {
      // Try to restore from localStorage
      const savedTeamId = localStorage.getItem("activeTeamId");
      const savedTeam = teams.find((t) => t.id === savedTeamId);
      setActiveTeam(savedTeam || teams[0]);
    }
  }, [teams, activeTeam]);

  // Save active team to localStorage
  const handleSetActiveTeam = React.useCallback((team: TeamData) => {
    setActiveTeam(team);
    localStorage.setItem("activeTeamId", team.id);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      teams,
      activeTeam,
      setActiveTeam: handleSetActiveTeam,
      isLoading: isTeamsLoading,
    }),
    [user, teams, activeTeam, handleSetActiveTeam, isTeamsLoading]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
