import { create } from "zustand";
import { persist } from "zustand/middleware";

// Team types for navigation
export type TeamType = "admin" | "hr" | "team";

export interface TeamData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  type: TeamType;
}

// Static teams for now
export const STATIC_TEAMS: TeamData[] = [
  {
    id: "admin",
    name: "Admin Team",
    slug: "admin",
    type: "admin",
  },
  {
    id: "hr",
    name: "HR Team",
    slug: "hr",
    type: "hr",
  },
  {
    id: "ai-content",
    name: "AI Content Team",
    slug: "ai-content",
    type: "team",
  },
];

// Helper to set cookie
function setTeamCookie(teamType: TeamType) {
  if (typeof document !== "undefined") {
    document.cookie = `selected-team=${teamType}; path=/; max-age=31536000`; // 1 year
  }
}

// Helper to get team from cookie
function getTeamFromCookie(): TeamType | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/selected-team=([^;]+)/);
  return match ? (match[1] as TeamType) : null;
}

interface SidebarState {
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
      // Default to first team
      selectedTeam: STATIC_TEAMS[0],
      setSelectedTeam: (team) => {
        setTeamCookie(team.type);
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

      // Initialize from cookie (call on app mount)
      initFromCookie: () => {
        const cookieTeamType = getTeamFromCookie();
        if (cookieTeamType) {
          const team = STATIC_TEAMS.find((t) => t.type === cookieTeamType);
          if (team && team.id !== get().selectedTeam.id) {
            set({ selectedTeam: team });
          }
        } else {
          // No cookie set, set it from current state
          setTeamCookie(get().selectedTeam.type);
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
        // When store rehydrates from localStorage, sync cookie
        if (state?.selectedTeam) {
          setTeamCookie(state.selectedTeam.type);
        }
      },
    }
  )
);
