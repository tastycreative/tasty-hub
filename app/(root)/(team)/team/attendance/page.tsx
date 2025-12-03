"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check, X, Calendar, MoreHorizontal } from "lucide-react";

// Mock data for attendance
const attendanceToday = [
  { id: "1", name: "Alice Johnson", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hours: 9 },
  { id: "2", name: "Bob Smith", checkIn: "09:15 AM", checkOut: "-", status: "Working", hours: 0 },
  { id: "3", name: "Carol Williams", checkIn: "-", checkOut: "-", status: "Absent", hours: 0 },
  { id: "4", name: "David Brown", checkIn: "08:45 AM", checkOut: "05:30 PM", status: "Present", hours: 8.75 },
];

const weeklyStats = {
  present: 85,
  absent: 10,
  late: 5,
};

export default function AttendancePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Track your team&apos;s attendance and working hours
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
          <Button>
            <Clock className="mr-2 h-4 w-4" />
            Clock In
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceToday.filter(a => a.status !== "Absent").length}</div>
            <p className="text-xs text-muted-foreground">
              Out of {attendanceToday.length} team members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceToday.filter(a => a.status === "Absent").length}</div>
            <p className="text-xs text-muted-foreground">
              Require follow-up
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Presence</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.present}%</div>
            <p className="text-xs text-muted-foreground">
              Average attendance rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Attendance</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Check In</th>
                  <th className="p-3 text-left font-medium">Check Out</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Hours</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceToday.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="p-3 font-medium">{record.name}</td>
                    <td className="p-3">{record.checkIn}</td>
                    <td className="p-3">{record.checkOut}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        record.status === "Present" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : record.status === "Working"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-3">{record.hours > 0 ? `${record.hours}h` : "-"}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
