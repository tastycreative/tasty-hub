"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Check, X, Clock, MoreHorizontal } from "lucide-react";
import { useAttendanceHistory } from "../api";
import { format } from "date-fns";
import { ClockInOut } from "@/components/clock-in-out";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AttendanceViewProps {
  /**
   * If provided, shows attendance for this specific user only
   * If not provided, shows attendance for all users (HR view)
   */
  userId?: string;
}

/**
 * AttendanceView component - Used by HR to view all users' attendance
 * Can be filtered to show a specific user's attendance
 * Features date selection and displays attendance records for selected date
 * @param userId - Optional user ID to filter attendance
 */
export function AttendanceView({ userId }: AttendanceViewProps) {
  // State for selected date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format selected date for API
  const dateString = format(selectedDate, "yyyy-MM-dd");

  // Fetch attendance data for selected date using TanStack Query
  const { data, isLoading, error } = useAttendanceHistory({
    userId,
    startDate: dateString,
    endDate: dateString,
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <>
          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="p-3 text-left">
                        <Skeleton className="h-4 w-20" />
                      </th>
                      <th className="p-3 text-left">
                        <Skeleton className="h-4 w-20" />
                      </th>
                      <th className="p-3 text-left">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="p-3 text-left">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      <th className="p-3 text-left">
                        <Skeleton className="h-4 w-16" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="p-3">
                          <Skeleton className="h-8 w-8 rounded" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
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
              <CardTitle>
                {format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  ? "Today's Attendance"
                  : "Attendance"}
              </CardTitle>
              <CardDescription>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceToday.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No attendance records for {format(selectedDate, "MMMM d, yyyy")}
                </p>
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
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {record.user.avatarUrl ? (
                                <img
                                  src={record.user.avatarUrl}
                                  alt={record.user.displayName || record.user.email}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                  <span className="text-sm font-medium">
                                    {(record.user.displayName || record.user.email).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span className="font-medium">
                                {record.user.displayName || record.user.email}
                              </span>
                            </div>
                          </td>
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
