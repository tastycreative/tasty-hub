import { create } from "zustand";
import { persist } from "zustand/middleware";

// Team types for navigation - maps slug to navigation type
export type TeamType = "admin" | "hr" | "team" | "viewer";

export interface TeamData {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  plan?: string;
  type: TeamType;
}

// Map team slug to navigation type
export function getTeamType(slug: string, role?: string): TeamType {
  // If role is VIEWER, always return viewer type
  if (role === "VIEWER") {
    return "viewer";
  }

  switch (slug) {
    case "admin":
      return "admin";
    case "hr":
      return "hr";
    default:
      return "team";
  }
}

// Convert database team to TeamData
export function toTeamData(team: {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  plan?: string;
  role?: string;
}): TeamData {
  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    logo: team.logo,
    plan: team.plan,
    type: getTeamType(team.slug, team.role),
  };
}

// Default viewer team (shown when no teams loaded yet or user has no teams)
const DEFAULT_TEAM: TeamData = {
  id: "viewer",
  name: "Pending Access",
  slug: "viewer",
  type: "viewer",
};

// Helper to set cookie - now stores team slug instead of type
function setTeamCookie(teamSlug: string) {
  if (typeof document !== "undefined") {
    document.cookie = `selected-team=${teamSlug}; path=/; max-age=31536000`; // 1 year
  }
}

// Helper to get team slug from cookie
function getTeamSlugFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/selected-team=([^;]+)/);
  return match ? match[1] : null;
}

interface SidebarState {
  // Available teams (loaded from database)
  teams: TeamData[];
  setTeams: (teams: TeamData[]) => void;

  // Selected team
  selectedTeam: TeamData;
  setSelectedTeam: (team: TeamData) => void;

  // Sidebar open state (for mobile)
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;

  // Collapsed state (for desktop mini mode)
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;

  // Initialize from cookie
  initFromCookie: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      // Available teams (empty until loaded from database)
      teams: [],
      setTeams: (teams) => {
        const currentSelected = get().selectedTeam;

        // First, try to get team from cookie (slug-based)
        const cookieSlug = getTeamSlugFromCookie();
        const teamFromCookie = cookieSlug ? teams.find((t) => t.slug === cookieSlug) : null;

        if (teamFromCookie) {
          // Use team from cookie if it exists in the new teams
          set({ teams, selectedTeam: teamFromCookie });
        } else {
          // Check if currently selected team still exists
          const stillExists = teams.find((t) => t.id === currentSelected.id);
          if (!stillExists && teams.length > 0) {
            // Select the first team if current selection doesn't exist
            set({ teams, selectedTeam: teams[0] });
            setTeamCookie(teams[0].slug);
          } else {
            set({ teams });
          }
        }
      },

      // Default to empty team until loaded
      selectedTeam: DEFAULT_TEAM,
      setSelectedTeam: (team) => {
        setTeamCookie(team.slug);
        set({ selectedTeam: team });
      },

      // Mobile open state
      isOpen: false,
      setIsOpen: (open) => set({ isOpen: open }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      // Desktop collapsed state
      isCollapsed: false,
      setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),

      // Initialize from cookie on client
      initFromCookie: () => {
        const teamSlug = getTeamSlugFromCookie();
        if (teamSlug) {
          const teams = get().teams;
          const team = teams.find((t) => t.slug === teamSlug);
          if (team) {
            set({ selectedTeam: team });
          }
        }
      },
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        selectedTeam: state.selectedTeam,
        isCollapsed: state.isCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync cookie with persisted state on rehydration
        if (state?.selectedTeam) {
          setTeamCookie(state.selectedTeam.slug);
        }
      },
    }
  )
);
