"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check, X, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { useAttendanceHistory } from "../api";
import { format } from "date-fns";
import { ClockInOut } from "@/components/clock-in-out";

interface AttendanceViewProps {
  /**
   * If provided, shows attendance for this specific user only
   * If not provided, shows attendance for all users (HR view)
   */
  userId?: string;
}

/**
 * AttendanceView component - Used by HR to view all users' attendance today
 * Can be filtered to show a specific user's attendance
 * Features clock in/out functionality and displays today's attendance records
 * @param userId - Optional user ID to filter attendance
 */
export function AttendanceView({ userId }: AttendanceViewProps) {
  // Fetch today's date
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch attendance data for today using TanStack Query
  const { data, isLoading, error } = useAttendanceHistory({
    userId,
    startDate: today,
    endDate: today,
  });

  const attendanceToday = data?.attendance || [];
  const present = attendanceToday.filter(a => a.status !== "ABSENT" && a.status !== "CLOCKED_OUT").length;
  const absent = attendanceToday.filter(a => a.status === "ABSENT").length;
  const clockedOut = attendanceToday.filter(a => a.status === "CLOCKED_OUT").length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Track team attendance and working hours
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load attendance data</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <Check className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{present}</div>
                <p className="text-xs text-muted-foreground">
                  Out of {attendanceToday.length} records
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                <X className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{absent}</div>
                <p className="text-xs text-muted-foreground">
                  Require follow-up
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clocked Out</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clockedOut}</div>
                <p className="text-xs text-muted-foreground">
                  Completed shifts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendanceToday.length > 0
                    ? (attendanceToday.reduce((sum, a) => sum + (a.duration || 0), 0) / attendanceToday.length / 60).toFixed(1)
                    : "0"}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Today
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
              {attendanceToday.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records for today</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Name</th>
                        <th className="p-3 text-left font-medium">Clock In</th>
                        <th className="p-3 text-left font-medium">Clock Out</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Hours</th>
                        <th className="p-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceToday.map((record) => (
                        <tr key={record.id} className="border-b">
                          <td className="p-3 font-medium">{record.user.displayName || record.user.email}</td>
                          <td className="p-3">
                            {record.clockIn ? format(new Date(record.clockIn), "hh:mm a") : "-"}
                          </td>
                          <td className="p-3">
                            {record.clockOut ? format(new Date(record.clockOut), "hh:mm a") : "-"}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              record.status === "CLOCKED_IN"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : record.status === "ON_BREAK"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : record.status === "CLOCKED_OUT"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}>
                              {record.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="p-3">
                            {record.duration ? `${(record.duration / 60).toFixed(1)}h` : "-"}
                          </td>
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
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
