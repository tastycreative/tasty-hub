// User types for the admin module

 interface UserTeam {
  id: string;
  name: string;
  role: string;
}

 interface User {
  id: string;
  stackAuthId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  role: string;
  teams: UserTeam[];
  status: string;
}

 type RoleType = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

 type StatusType = "Active" | "Pending" | "Inactive";
