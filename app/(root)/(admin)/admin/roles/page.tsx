"use client";

import * as React from "react";
import {
  Shield,
  Crown,
  UserCog,
  Users,
  Eye,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Based on RoleType enum from schema.prisma
const roleTypes = [
  {
    id: "OWNER",
    name: "Owner",
    description: "Full access to all resources. Can transfer ownership and delete the team.",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    permissions: [
      "Manage all team settings",
      "Transfer ownership",
      "Delete team",
      "Manage billing",
      "Add/remove admins",
      "All admin permissions",
    ],
    userCount: 1,
  },
  {
    id: "ADMIN",
    name: "Admin",
    description: "Can manage team members, roles, and most settings.",
    icon: Shield,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    permissions: [
      "Manage team members",
      "Assign roles",
      "Manage team settings",
      "View all data",
      "Create/edit content",
      "All member permissions",
    ],
    userCount: 3,
  },
  {
    id: "MEMBER",
    name: "Member",
    description: "Standard team member with access to team resources.",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    permissions: [
      "View team members",
      "Access team resources",
      "Create content",
      "Edit own content",
      "Submit requests",
      "View reports",
    ],
    userCount: 12,
  },
  {
    id: "VIEWER",
    name: "Viewer",
    description: "Read-only access to team resources.",
    icon: Eye,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    permissions: [
      "View team members",
      "View content",
      "View reports",
      "Download files",
    ],
    userCount: 5,
  },
];

// Custom roles from Role model in schema.prisma
const customRoles = [
  {
    id: "1",
    name: "HR Manager",
    description: "Access to HR-specific features and employee data",
    permissions: ["manage_employees", "view_payroll", "manage_leave"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Team Lead",
    description: "Can manage their team members and approve requests",
    permissions: ["manage_team", "approve_leave", "view_reports"],
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Finance",
    description: "Access to financial data and payroll",
    permissions: ["view_payroll", "manage_billing", "view_reports"],
    createdAt: "2024-03-10",
  },
];

export default function RolesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground mt-1">
            Manage system and custom roles for your organization
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Custom Role
        </Button>
      </div>

      {/* System Roles Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">System Roles</h2>
          <p className="text-sm text-muted-foreground">
            Built-in roles based on the RoleType enum. These cannot be deleted.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {roleTypes.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className={`${role.borderColor} border-2 transition-all hover:shadow-md`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${role.bgColor}`}>
                        <Icon className={`h-5 w-5 ${role.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {role.userCount} {role.userCount === 1 ? "user" : "users"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {role.id}
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Permissions:</p>
                    <ul className="grid gap-1">
                      {role.permissions.map((permission, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="h-3.5 w-3.5 text-green-500" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Roles Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Custom Roles</h2>
          <p className="text-sm text-muted-foreground">
            Custom roles with specific permissions defined in the Role model.
          </p>
        </div>

        <div className="grid gap-4">
          {customRoles.map((role) => (
            <Card key={role.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <UserCog className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Created on {new Date(role.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        View Users
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono bg-muted px-2 py-1 rounded"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
