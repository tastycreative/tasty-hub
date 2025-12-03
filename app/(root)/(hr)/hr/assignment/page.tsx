"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, ArrowRight, MoreHorizontal } from "lucide-react";

// Mock data for team assignments
const teams = [
  { id: "1", name: "Engineering", members: 15, lead: "Alice Johnson" },
  { id: "2", name: "Design", members: 8, lead: "Bob Smith" },
  { id: "3", name: "Marketing", members: 10, lead: "Carol Williams" },
  { id: "4", name: "HR", members: 5, lead: "David Brown" },
];

const pendingAssignments = [
  { id: "1", employee: "New Hire 1", from: "Unassigned", to: "Engineering", status: "Pending" },
  { id: "2", employee: "New Hire 2", from: "Unassigned", to: "Design", status: "Pending" },
];

export default function AssignmentPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Assignment</h1>
          <p className="text-muted-foreground">
            Assign employees to teams and manage team rosters
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          New Assignment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Teams Overview</CardTitle>
            <CardDescription>Current team sizes and leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">Lead: {team.lead}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{team.members}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Assignments</CardTitle>
            <CardDescription>Assignments awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">{assignment.employee}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>{assignment.from}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{assignment.to}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">Reject</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                </div>
              ))}
              {pendingAssignments.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No pending assignments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
