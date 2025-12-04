"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "./role-badge";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
}

interface UserTeam {
  id: string;
  name: string;
  role: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  teams: UserTeam[];
}

interface ManageRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;

export function ManageRolesDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ManageRolesDialogProps) {
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingTeam, setAddingTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("MEMBER");

  // Fetch user's current teams and all available teams
  useEffect(() => {
    if (open && user) {
      setUserTeams(user.teams || []);
      fetchAllTeams();
    }
  }, [open, user]);

  const fetchAllTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teams");
      if (response.ok) {
        const teams = await response.json();
        setAllTeams(teams);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (teamId: string, newRole: string) => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}/roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, role: newRole }),
      });

      if (response.ok) {
        setUserTeams((prev) =>
          prev.map((ut) =>
            ut.id === teamId ? { ...ut, role: newRole } : ut
          )
        );
        onSuccess?.();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleAddToTeam = async () => {
    if (!user || !selectedTeam) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeam, role: selectedRole }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserTeams((prev) => [
          ...prev,
          {
            id: result.team.id,
            name: result.team.name,
            role: result.role,
          },
        ]);
        setSelectedTeam("");
        setSelectedRole("MEMBER");
        setAddingTeam(false);
        onSuccess?.();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add to team");
      }
    } catch (error) {
      console.error("Error adding to team:", error);
      alert("Failed to add to team");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromTeam = async (teamId: string) => {
    if (!user) return;

    if (!confirm("Are you sure you want to remove this user from the team?")) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/users/${user.id}/roles?teamId=${teamId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setUserTeams((prev) => prev.filter((ut) => ut.id !== teamId));
        onSuccess?.();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to remove from team");
      }
    } catch (error) {
      console.error("Error removing from team:", error);
      alert("Failed to remove from team");
    } finally {
      setSaving(false);
    }
  };

  // Filter out teams the user is already in
  const availableTeams = allTeams.filter(
    (team) => !userTeams.some((ut) => ut.id === team.id)
  );

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Roles</DialogTitle>
          <DialogDescription>
            Manage team memberships and roles for {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current team memberships */}
          <div className="space-y-3">
            <Label>Team Memberships</Label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userTeams.length > 0 ? (
              <div className="space-y-2">
                {userTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{team.name}</span>
                      <RoleBadge role={team.role} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={team.role}
                        onValueChange={(value: string) =>
                          handleRoleChange(team.id, value)
                        }
                        disabled={saving}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromTeam(team.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This user is not a member of any teams.
              </p>
            )}
          </div>

          {/* Add to team section */}
          {!addingTeam ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setAddingTeam(true)}
              disabled={availableTeams.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Team
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border p-3">
              <Label>Add to Team</Label>
              <div className="flex gap-2">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAddingTeam(false);
                    setSelectedTeam("");
                    setSelectedRole("MEMBER");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddToTeam}
                  disabled={!selectedTeam || saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
