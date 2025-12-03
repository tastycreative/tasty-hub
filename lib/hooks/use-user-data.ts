import { useQuery } from "@tanstack/react-query";
import { useUser } from "@stackframe/stack";

// Fetch user's teams from the database
async function fetchUserTeams(stackAuthId: string) {
  const response = await fetch(`/api/users/${stackAuthId}/teams`);
  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }
  return response.json();
}

// Fetch user data from the database
async function fetchUserData(stackAuthId: string) {
  const response = await fetch(`/api/users/${stackAuthId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

export function useUserTeams() {
  const user = useUser();

  return useQuery({
    queryKey: ["userTeams", user?.id],
    queryFn: () => fetchUserTeams(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserData() {
  const user = useUser();

  return useQuery({
    queryKey: ["userData", user?.id],
    queryFn: () => fetchUserData(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get current Stack Auth user with caching
export function useCurrentUser() {
  const stackUser = useUser();

  return {
    id: stackUser?.id,
    email: stackUser?.primaryEmail,
    displayName: stackUser?.displayName,
    avatarUrl: stackUser?.profileImageUrl,
    isLoading: stackUser === undefined,
    isAuthenticated: !!stackUser,
  };
}
