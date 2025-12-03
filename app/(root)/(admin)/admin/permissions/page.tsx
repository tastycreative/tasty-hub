"use client";

import * as React from "react";
import {
  Shield,
  Users,
  Building2,
  FileText,
  Settings,
  Clock,
  DollarSign,
  Search,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Permission categories based on the app's features
const permissionCategories = [
  {
    id: "users",
    name: "User Management",
    icon: Users,
    description: "Permissions related to user accounts",
    permissions: [
      { id: "users.view", name: "View Users", description: "View user profiles and list" },
      { id: "users.create", name: "Create Users", description: "Add new users to the system" },
      { id: "users.edit", name: "Edit Users", description: "Modify user information" },
      { id: "users.delete", name: "Delete Users", description: "Remove users from the system" },
      { id: "users.invite", name: "Invite Users", description: "Send invitations to new users" },
    ],
  },
  {
    id: "teams",
    name: "Team Management",
    icon: Building2,
    description: "Permissions for team operations",
    permissions: [
      { id: "teams.view", name: "View Teams", description: "View team information" },
      { id: "teams.create", name: "Create Teams", description: "Create new teams" },
      { id: "teams.edit", name: "Edit Teams", description: "Modify team settings" },
      { id: "teams.delete", name: "Delete Teams", description: "Remove teams" },
      { id: "teams.manage_members", name: "Manage Members", description: "Add/remove team members" },
    ],
  },
  {
    id: "roles",
    name: "Role Management",
    icon: Shield,
    description: "Permissions for role administration",
    permissions: [
      { id: "roles.view", name: "View Roles", description: "View available roles" },
      { id: "roles.create", name: "Create Roles", description: "Create custom roles" },
      { id: "roles.edit", name: "Edit Roles", description: "Modify role permissions" },
      { id: "roles.delete", name: "Delete Roles", description: "Remove custom roles" },
      { id: "roles.assign", name: "Assign Roles", description: "Assign roles to users" },
    ],
  },
  {
    id: "attendance",
    name: "Attendance",
    icon: Clock,
    description: "Time and attendance permissions",
    permissions: [
      { id: "attendance.view_own", name: "View Own Attendance", description: "View personal attendance" },
      { id: "attendance.view_team", name: "View Team Attendance", description: "View team attendance records" },
      { id: "attendance.view_all", name: "View All Attendance", description: "View all attendance records" },
      { id: "attendance.manage", name: "Manage Attendance", description: "Edit attendance records" },
      { id: "attendance.approve_leave", name: "Approve Leave", description: "Approve leave requests" },
    ],
  },
  {
    id: "documents",
    name: "Documents",
    icon: FileText,
    description: "Document access permissions",
    permissions: [
      { id: "documents.view", name: "View Documents", description: "Access documents" },
      { id: "documents.create", name: "Create Documents", description: "Upload new documents" },
      { id: "documents.edit", name: "Edit Documents", description: "Modify documents" },
      { id: "documents.delete", name: "Delete Documents", description: "Remove documents" },
      { id: "documents.share", name: "Share Documents", description: "Share with others" },
    ],
  },
  {
    id: "payroll",
    name: "Payroll & Benefits",
    icon: DollarSign,
    description: "Financial data permissions",
    permissions: [
      { id: "payroll.view_own", name: "View Own Payroll", description: "View personal payroll" },
      { id: "payroll.view_all", name: "View All Payroll", description: "View all payroll data" },
      { id: "payroll.manage", name: "Manage Payroll", description: "Process payroll" },
      { id: "payroll.benefits", name: "Manage Benefits", description: "Administer benefits" },
    ],
  },
  {
    id: "settings",
    name: "System Settings",
    icon: Settings,
    description: "System configuration permissions",
    permissions: [
      { id: "settings.view", name: "View Settings", description: "View system settings" },
      { id: "settings.edit", name: "Edit Settings", description: "Modify system settings" },
      { id: "settings.security", name: "Security Settings", description: "Manage security settings" },
      { id: "settings.integrations", name: "Integrations", description: "Manage integrations" },
      { id: "settings.audit", name: "View Audit Logs", description: "Access audit logs" },
    ],
  },
];

// Role permission matrix based on RoleType enum
const rolePermissions: Record<string, string[]> = {
  OWNER: [
    "users.view", "users.create", "users.edit", "users.delete", "users.invite",
    "teams.view", "teams.create", "teams.edit", "teams.delete", "teams.manage_members",
    "roles.view", "roles.create", "roles.edit", "roles.delete", "roles.assign",
    "attendance.view_own", "attendance.view_team", "attendance.view_all", "attendance.manage", "attendance.approve_leave",
    "documents.view", "documents.create", "documents.edit", "documents.delete", "documents.share",
    "payroll.view_own", "payroll.view_all", "payroll.manage", "payroll.benefits",
    "settings.view", "settings.edit", "settings.security", "settings.integrations", "settings.audit",
  ],
  ADMIN: [
    "users.view", "users.create", "users.edit", "users.invite",
    "teams.view", "teams.create", "teams.edit", "teams.manage_members",
    "roles.view", "roles.assign",
    "attendance.view_own", "attendance.view_team", "attendance.view_all", "attendance.manage", "attendance.approve_leave",
    "documents.view", "documents.create", "documents.edit", "documents.delete", "documents.share",
    "payroll.view_own", "payroll.view_all",
    "settings.view", "settings.edit",
  ],
  MEMBER: [
    "users.view",
    "teams.view",
    "roles.view",
    "attendance.view_own", "attendance.view_team",
    "documents.view", "documents.create", "documents.edit",
    "payroll.view_own",
    "settings.view",
  ],
  VIEWER: [
    "users.view",
    "teams.view",
    "roles.view",
    "attendance.view_own",
    "documents.view",
    "payroll.view_own",
    "settings.view",
  ],
};

export default function PermissionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>(
    permissionCategories.map((c) => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = permissionCategories
    .map((category) => ({
      ...category,
      permissions: category.permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.permissions.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground mt-1">
          View and manage permission assignments across roles
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Shows which permissions are assigned to each role type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Permission</th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-amber-500">●</span> Owner
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-blue-500">●</span> Admin
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-green-500">●</span> Member
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-gray-500">●</span> Viewer
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategories.includes(category.id);

                  return (
                    <React.Fragment key={category.id}>
                      {/* Category Header */}
                      <tr
                        className="bg-muted/50 cursor-pointer hover:bg-muted"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <td colSpan={5} className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isExpanded ? "" : "-rotate-90"
                              }`}
                            />
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{category.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({category.permissions.length} permissions)
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Permission Rows */}
                      {isExpanded &&
                        category.permissions.map((permission) => (
                          <tr
                            key={permission.id}
                            className="border-b hover:bg-muted/30"
                          >
                            <td className="py-2 px-4 pl-10">
                              <div>
                                <p className="font-medium text-sm">
                                  {permission.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </td>
                            {(["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const).map(
                              (role) => (
                                <td key={role} className="text-center py-2 px-4">
                                  {rolePermissions[role].includes(permission.id) ? (
                                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                                  )}
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {(["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const).map((role) => {
          const colors = {
            OWNER: "text-amber-500 bg-amber-500/10",
            ADMIN: "text-blue-500 bg-blue-500/10",
            MEMBER: "text-green-500 bg-green-500/10",
            VIEWER: "text-gray-500 bg-gray-500/10",
          };
          return (
            <Card key={role}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{role}</p>
                    <p className="text-2xl font-bold">
                      {rolePermissions[role].length}
                    </p>
                    <p className="text-xs text-muted-foreground">permissions</p>
                  </div>
                  <div className={`p-3 rounded-full ${colors[role]}`}>
                    <Shield className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
