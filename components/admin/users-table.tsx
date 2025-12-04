"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, UserCog } from "lucide-react";
import { RoleBadge } from "./role-badge";
import { StatusBadge } from "./status-badge";
import { ManageRolesDialog } from "./manage-roles-dialog";

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const router = useRouter();

  const handleManageRoles = (user: User) => {
    setSelectedUser(user);
    setRolesDialogOpen(true);
  };

  const handleRolesSuccess = () => {
    // Refresh the page data
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Role</th>
                  <th className="p-3 text-left font-medium">Teams</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{user.email}</td>
                      <td className="p-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="p-3">
                        <TeamsList teams={user.teams} />
                      </td>
                      <td className="p-3">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="p-3">
                        <UserActions user={user} onManageRoles={handleManageRoles} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No users found. Add your first user to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ManageRolesDialog
        user={selectedUser}
        open={rolesDialogOpen}
        onOpenChange={setRolesDialogOpen}
        onSuccess={handleRolesSuccess}
      />
    </>
  );
}

// User Avatar Component
function UserAvatar({ user }: { user: User }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
      <span className="text-sm font-medium">
        {user.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// Teams List Component
function TeamsList({ teams }: { teams: User["teams"] }) {
  if (!teams || teams.length === 0) {
    return <span className="text-sm text-muted-foreground">No teams</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {teams.slice(0, 2).map((team) => (
        <span
          key={team.id}
          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        >
          {team.name}
        </span>
      ))}
      {teams.length > 2 && (
        <span className="text-xs text-muted-foreground">
          +{teams.length - 2} more
        </span>
      )}
    </div>
  );
}

// User Actions Dropdown
function UserActions({
  user,
  onManageRoles,
}: {
  user: User;
  onManageRoles: (user: User) => void;
}) {
  const handleEdit = () => {
    console.log("Edit user:", user.id);
    // TODO: Implement edit modal
  };

  const handleDelete = () => {
    console.log("Delete user:", user.id);
    // TODO: Implement delete confirmation
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onManageRoles(user)}>
          <UserCog className="mr-2 h-4 w-4" />
          Manage Roles
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
