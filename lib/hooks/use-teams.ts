import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Team {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  role: string;
  memberCount: number;
}

// Fetch current user's teams
async function fetchMyTeams(): Promise<Team[]> {
  const response = await fetch("/api/teams/my");
  
  if (!response.ok) {
    if (response.status === 401) {
      // User not authenticated, return empty array
      return [];
    }
    throw new Error("Failed to fetch teams");
  }
  
  return response.json();
}

// Hook to get current user's teams
export function useMyTeams() {
  return useQuery({
    queryKey: ["teams", "my"],
    queryFn: fetchMyTeams,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth errors
  });
}

// Fetch all teams (for admin)
async function fetchAllTeams(): Promise<Team[]> {
  const response = await fetch("/api/teams");
  
  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }
  
  return response.json();
}

// Hook to get all teams (for admin)
export function useTeams() {
  return useQuery({
    queryKey: ["teams", "all"],
    queryFn: fetchAllTeams,
    staleTime: 5 * 60 * 1000,
  });
}

// Types for team creation
export interface CreateTeamInput {
  name: string;
  slug: string;
  logo?: string | null;
}

export interface CreateTeamResponse {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Create a new team
async function createTeam(data: CreateTeamInput): Promise<CreateTeamResponse> {
  const response = await fetch("/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create team");
  }

  return response.json();
}

// Hook to create a team
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      // Invalidate team queries to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
