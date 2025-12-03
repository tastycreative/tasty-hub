"use client";

import * as React from "react";
import {
  Shield,
  Crown,
  Users,
  Eye,
  Search,
  UserPlus,
  MoreHorizontal,
  Building2,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample data based on schema.prisma models: User, Team, UserTeam
const userTeamAssignments = [
  {
    id: "1",
    user: {
      id: "user1",
      displayName: "John Doe",
      email: "john@example.com",
      avatarUrl: null,
    },
    team: {
      id: "team1",
      name: "Admin Team",
      slug: "admin-team",
    },
    role: "OWNER" as const,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    user: {
      id: "user2",
      displayName: "Jane Smith",
      email: "jane@example.com",
      avatarUrl: null,
    },
    team: {
      id: "team1",
      name: "Admin Team",
      slug: "admin-team",
    },
    role: "ADMIN" as const,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    user: {
      id: "user3",
      displayName: "Mike Johnson",
      email: "mike@example.com",
      avatarUrl: null,
    },
    team: {
      id: "team2",
      name: "HR Team",
      slug: "hr-team",
    },
    role: "ADMIN" as const,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    user: {
      id: "user4",
      displayName: "Sarah Wilson",
      email: "sarah@example.com",
      avatarUrl: null,
    },
    team: {
      id: "team2",
      name: "HR Team",
      slug: "hr-team",
    },
    role: "MEMBER" as const,
    createdAt: "2024-02-10",
  },
  {
    id: "5",
    user: {
      id: "user5",
      displayName: "Tom Brown",
      email: "tom@example.com",
      avatarUrl: null,
    },
    team: {
      id: "team3",
      name: "AI Content Team",
      slug: "ai-content-team",
    },
    role: "MEMBER" as const,
    createdAt: "2024-02-15",
  },
  {
    id: "6",
    user: {
      id: "user6",
      displayName: "Emily Davis",
      email: "emily@example.com",
      avatarUrl: null,
    },
    team: {
      id: "team3",
      name: "AI Content Team",
      slug: "ai-content-team",
    },
    role: "VIEWER" as const,
    createdAt: "2024-03-01",
  },
  {
    id: "7",
    user: {
      id: "user2",
      displayName: "Jane Smith",
      email: "jane@example.com",
      avatarUrl: null,
    },
    team: {
      id: "team2",
      name: "HR Team",
      slug: "hr-team",
    },
    role: "MEMBER" as const,
    createdAt: "2024-02-05",
  },
];

const roleConfig = {
  OWNER: {
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Owner",
  },
  ADMIN: {
    icon: Shield,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Admin",
  },
  MEMBER: {
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Member",
  },
  VIEWER: {
    icon: Eye,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    label: "Viewer",
  },
};

export default function AccessControlPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTeam, setFilterTeam] = React.useState<string | null>(null);
  const [filterRole, setFilterRole] = React.useState<string | null>(null);

  // Get unique teams
  const teams = Array.from(
    new Map(
      userTeamAssignments.map((a) => [a.team.id, a.team])
    ).values()
  );

  // Filter assignments
  const filteredAssignments = userTeamAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.team.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = !filterTeam || assignment.team.id === filterTeam;
    const matchesRole = !filterRole || assignment.role === filterRole;
    return matchesSearch && matchesTeam && matchesRole;
  });

  // Group by team for summary
  const teamSummary = teams.map((team) => {
    const members = userTeamAssignments.filter((a) => a.team.id === team.id);
    return {
      ...team,
      totalMembers: members.length,
      owners: members.filter((m) => m.role === "OWNER").length,
      admins: members.filter((m) => m.role === "ADMIN").length,
      members: members.filter((m) => m.role === "MEMBER").length,
      viewers: members.filter((m) => m.role === "VIEWER").length,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage user-team assignments and role memberships
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Assignment
        </Button>
      </div>

      {/* Team Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {teamSummary.map((team) => (
          <Card
            key={team.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              filterTeam === team.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() =>
              setFilterTeam(filterTeam === team.id ? null : team.id)
            }
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{team.name}</CardTitle>
              </div>
              <CardDescription>{team.totalMembers} members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">●</span>
                  <span>{team.owners}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-500">●</span>
                  <span>{team.admins}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green-500">●</span>
                  <span>{team.members}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">●</span>
                  <span>{team.viewers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {filterRole ? roleConfig[filterRole as keyof typeof roleConfig].label : "All Roles"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterRole(null)}>
              All Roles
            </DropdownMenuItem>
            {Object.entries(roleConfig).map(([role, config]) => (
              <DropdownMenuItem
                key={role}
                onClick={() => setFilterRole(role)}
              >
                <config.icon className={`mr-2 h-4 w-4 ${config.color}`} />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {(filterTeam || filterRole) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterTeam(null);
              setFilterRole(null);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>User-Team Assignments</CardTitle>
          <CardDescription>
            Based on the UserTeam junction table in your schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      User
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Team
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                      Role
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Assigned</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => {
                  const roleInfo = roleConfig[assignment.role];
                  const RoleIcon = roleInfo.icon;

                  return (
                    <tr
                      key={assignment.id}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={assignment.user.avatarUrl || undefined} />
                            <AvatarFallback>
                              {assignment.user.displayName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {assignment.user.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {assignment.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{assignment.team.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.color}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {roleInfo.label}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>View User</DropdownMenuItem>
                            <DropdownMenuItem>View Team</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No assignments found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schema Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schema Reference</CardTitle>
          <CardDescription>
            This page is based on the following Prisma models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-mono text-sm font-medium">User</p>
              <p className="text-xs text-muted-foreground mt-1">
                id, stackAuthId, email, displayName, avatarUrl
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-mono text-sm font-medium">Team</p>
              <p className="text-xs text-muted-foreground mt-1">
                id, name, slug, logo, plan, ownerId
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-mono text-sm font-medium">UserTeam</p>
              <p className="text-xs text-muted-foreground mt-1">
                id, userId, teamId, role (RoleType enum)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
