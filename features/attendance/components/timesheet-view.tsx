"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Download, Loader2, FileText, Globe } from "lucide-react";
import { useAttendanceHistory, type AttendanceRecord } from "../api";
import { format, subDays } from "date-fns";
import { DateTime } from "luxon";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * TimesheetView component - Shared across all team types (Admin, HR, Team)
 * Displays the current user's attendance history (timesheet)
 * Shows clock in/out times, breaks, and total hours worked
 */
export function TimesheetView() {
  const [selectedReport, setSelectedReport] = useState<AttendanceRecord | null>(null);
  const [showPST, setShowPST] = useState(false);

  // Helper function to format time with timezone
  const formatTime = (date: string | null, formatStr: string = "hh:mm a", showTZ: boolean = true) => {
    if (!date) return "-";
    const timezone = showPST ? "America/Los_Angeles" : DateTime.local().zoneName;
    const dt = DateTime.fromISO(date).setZone(timezone);
    const time = dt.toFormat(formatStr);
    const tzAbbr = dt.toFormat("ZZZZ"); // Short timezone abbreviation (PST, JST, etc.)
    return showTZ ? `${time} ${tzAbbr}` : time;
  };

  // Get timezone labels
  const userTimezone = DateTime.local().zoneName;
  const timezoneLabel = showPST ? "PST" : userTimezone.split("/")[1] || "Local";
  // Fetch last 30 days of attendance for the current user
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch attendance data using TanStack Query (no userId = current user)
  const { data, isLoading, error } = useAttendanceHistory({
    startDate: thirtyDaysAgo,
    endDate: today,
    limit: 100,
  });

  const attendance = data?.attendance || [];

  // Calculate stats - use totalHours when available, fallback to duration calculation
  const totalDays = attendance.length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
  const avgHours = totalDays > 0 ? totalHours / totalDays : 0;
  const daysWithReport = attendance.filter(a => a.shiftReport).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Timesheet</h1>
          <p className="text-muted-foreground">
            View your attendance history and working hours
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPST(!showPST)}
          >
            <Globe className="mr-2 h-4 w-4" />
            {timezoneLabel}
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Select Date Range
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
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
            <p className="text-destructive">Failed to load timesheet data</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDays}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  Total worked
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  Average per day
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{daysWithReport}</div>
                <p className="text-xs text-muted-foreground">
                  Shift reports
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Your clock in/out records for the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records found</p>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Date</th>
                        <th className="p-3 text-left font-medium">Clock In ({timezoneLabel})</th>
                        <th className="p-3 text-left font-medium">Clock Out ({timezoneLabel})</th>
                        <th className="p-3 text-left font-medium">Breaks</th>
                        <th className="p-3 text-left font-medium">Hours</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record.id} className="border-b">
                          <td className="p-3 font-medium">
                            {format(new Date(record.date), "MMM dd, yyyy")}
                          </td>
                          <td className="p-3">
                            {formatTime(record.clockIn)}
                          </td>
                          <td className="p-3">
                            {formatTime(record.clockOut)}
                          </td>
                          <td className="p-3">
                            {record.breaks.length > 0 ? (
                              <span className="text-sm">
                                {record.breaks.length} ({record.totalBreak}min)
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-3">
                            {record.totalHours != null ? `${record.totalHours.toFixed(2)}h` : "-"}
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
                            {record.shiftReport ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedReport(record)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
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

      {/* Shift Report Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shift Report</DialogTitle>
            <DialogDescription>
              {selectedReport && format(new Date(selectedReport.date), "MMMM dd, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Shift Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clock In</p>
                <p className="text-sm">
                  {formatTime(selectedReport?.clockIn || null)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clock Out</p>
                <p className="text-sm">
                  {formatTime(selectedReport?.clockOut || null)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-sm">
                  {selectedReport?.duration
                    ? `${(selectedReport.duration / 60).toFixed(1)}h`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Breaks</p>
                <p className="text-sm">
                  {selectedReport?.breaks.length
                    ? `${selectedReport.breaks.length} (${selectedReport.totalBreak}min)`
                    : "None"}
                </p>
              </div>
            </div>

            {/* Shift Report Content */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Report</p>
              <div className="rounded-md border p-4 bg-muted/50">
                <p className="text-sm whitespace-pre-wrap">
                  {selectedReport?.shiftReport || "No report submitted"}
                </p>
              </div>
            </div>

            {/* Breaks Details */}
            {selectedReport && selectedReport.breaks.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Breaks</p>
                <div className="space-y-2">
                  {selectedReport.breaks.map((breakRecord) => (
                    <div key={breakRecord.id} className="rounded-md border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {breakRecord.type.toLowerCase()} Break
                        </span>
                        <span className="text-muted-foreground">
                          {breakRecord.duration ? `${breakRecord.duration}min` : "Ongoing"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTime(breakRecord.startTime)} - {" "}
                        {breakRecord.endTime
                          ? formatTime(breakRecord.endTime)
                          : "Ongoing"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
