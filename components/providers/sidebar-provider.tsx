"use client";

import * as React from "react";
import { useUser } from "@stackframe/stack";

interface TeamData {
  id: string;
  name: string;
  logo: string | null;
  plan: string;
  role: string;
  type?: "admin" | "hr" | "normal";
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

// Static teams for now - will be replaced with database teams later
const STATIC_TEAMS: TeamData[] = [
  {
    id: "admin-team",
    name: "Admin Team",
    logo: null,
    plan: "enterprise",
    role: "ADMIN",
    type: "admin",
  },
  {
    id: "hr-team",
    name: "HR Team",
    logo: null,
    plan: "pro",
    role: "ADMIN",
    type: "hr",
  },
  {
    id: "ai-content-team",
    name: "AI Content Team",
    logo: null,
    plan: "pro",
    role: "MEMBER",
    type: "normal",
  },
];

export function SidebarContextProvider({ children }: { children: React.ReactNode }) {
  const stackUser = useUser();
  const [activeTeam, setActiveTeam] = React.useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize user data from Stack Auth
  const user: UserData | null = stackUser
    ? {
        name: stackUser.displayName || "User",
        email: stackUser.primaryEmail || "",
        avatar: stackUser.profileImageUrl || "",
      }
    : null;

  // Use static teams for now
  const teams = STATIC_TEAMS;

  // Set initial active team
  React.useEffect(() => {
    if (teams.length > 0 && !activeTeam) {
      // Try to restore from localStorage
      const savedTeamId = localStorage.getItem("activeTeamId");
      const savedTeam = teams.find((t) => t.id === savedTeamId);
      setActiveTeam(savedTeam || teams[0]);
    }
    setIsLoading(false);
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
      isLoading,
    }),
    [user, teams, activeTeam, handleSetActiveTeam, isLoading]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
