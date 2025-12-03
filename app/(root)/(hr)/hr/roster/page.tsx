"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, MoreHorizontal } from "lucide-react";

// Mock data for team roster
const roster = [
  { id: "1", name: "Engineering Team", members: ["Alice", "Bob", "Carol", "David"], lead: "Alice Johnson" },
  { id: "2", name: "Design Team", members: ["Eva", "Frank"], lead: "Eva Martinez" },
  { id: "3", name: "Marketing Team", members: ["Grace", "Henry", "Ivy"], lead: "Grace Lee" },
];

export default function RosterPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Roster</h1>
          <p className="text-muted-foreground">
            View all team rosters and their members
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Roster
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roster.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{team.name}</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Lead: {team.lead}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{team.members.length} members</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {team.members.map((member, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs">
                    {member}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
