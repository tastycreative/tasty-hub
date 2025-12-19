"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { AddTeamDialog } from "@/components/add-team-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface Team {
  id: string;
  name: string;
  slug: string;
  type: "admin" | "hr" | "team" | "viewer";
  logo: React.ElementType;
}

interface TeamSwitcherProps {
  teams: Team[];
  activeTeam: Team;
  onTeamChange: (team: Team) => void;
  onRefetchTeams?: () => void;
}

export function TeamSwitcher({
  teams,
  activeTeam,
  onTeamChange,
  onRefetchTeams,
}: TeamSwitcherProps) {
  const { isMobile } = useSidebar();
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = React.useState(false);

  const handleTeamCreated = React.useCallback(() => {
    // Refetch teams after creating a new team
    onRefetchTeams?.();
  }, [onRefetchTeams]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {activeTeam.type === "team" ? "Team" : `${activeTeam.type} Team`}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams
              .filter((team) => team.type !== "viewer")
              .map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => onTeamChange(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            {/* Only show Add team button if user is admin or hr */}
            {(activeTeam.type === "admin" || activeTeam.type === "hr") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => setIsAddTeamDialogOpen(true)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">Add team</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <AddTeamDialog
        open={isAddTeamDialogOpen}
        onOpenChange={setIsAddTeamDialogOpen}
        onSuccess={handleTeamCreated}
      />
    </SidebarMenu>
  );
}
