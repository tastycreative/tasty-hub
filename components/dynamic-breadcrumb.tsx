"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

// Route configuration for breadcrumbs
const routeConfig: Record<string, { label: string; parent?: string }> = {
  // Admin routes
  admin: { label: "Admin" },
  "admin/users": { label: "Users", parent: "admin" },
  "admin/roles": { label: "Roles", parent: "admin" },
  "admin/permissions": { label: "Permissions", parent: "admin" },
  "admin/teams": { label: "Teams", parent: "admin" },
  "admin/access": { label: "Access Control", parent: "admin" },

  // HR routes
  hr: { label: "HR" },
  "hr/employees": { label: "Employees", parent: "hr" },
  "hr/roster": { label: "Roster", parent: "hr" },
  "hr/assignment": { label: "Assignment", parent: "hr" },

  // Team routes
  team: { label: "Team" },
  "team/members": { label: "Members", parent: "team" },
  "team/attendance": { label: "Attendance", parent: "team" },
  "team/docs": { label: "Documents", parent: "team" },

  // Dashboard
  dashboard: { label: "Dashboard" },
};

function getBreadcrumbs(pathname: string) {
  // Remove leading slash and split
  const segments = pathname.replace(/^\//, "").split("/");
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    currentPath = currentPath ? `${currentPath}/${segments[i]}` : segments[i];
    const config = routeConfig[currentPath];

    if (config) {
      breadcrumbs.push({
        label: config.label,
        href: `/${currentPath}`,
        isLast: i === segments.length - 1,
      });
    }
  }

  return breadcrumbs;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            {index > 0 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
