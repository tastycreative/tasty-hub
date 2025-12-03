"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UsersHeaderProps {
  title?: string;
  description?: string;
}

export function UsersHeader({
  title = "Users",
  description = "Manage all users in your organization",
}: UsersHeaderProps) {
  const handleAddUser = () => {
    console.log("Add user clicked");
    // TODO: Implement add user modal
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button onClick={handleAddUser}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>
  );
}
