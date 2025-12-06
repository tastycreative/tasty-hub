"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, Download, FileText, Globe, CalendarIcon } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * TimesheetView component - Shared across all team types (Admin, HR, Team)
 * Displays the current user's attendance history (timesheet)
 * Shows clock in/out times, breaks, and total hours worked
 */
export function TimesheetView() {
  const [selectedReport, setSelectedReport] = useState<AttendanceRecord | null>(null);
  const [showPST, setShowPST] = useState(false);

  // Date range state - using DateRange type for range highlighting
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

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

  // Format dates for API
  const startDate = format(dateRange.from, "yyyy-MM-dd");
  const endDate = format(dateRange.to, "yyyy-MM-dd");

  // Fetch attendance data using TanStack Query (no userId = current user)
  const { data, isLoading, error } = useAttendanceHistory({
    startDate,
    endDate,
    limit: 1000,
  });

  const attendance = data?.attendance || [];

  // Calculate stats - use totalHours when available, fallback to duration calculation
  const totalDays = attendance.length;
  const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
  const avgHours = totalDays > 0 ? totalHours / totalDays : 0;
  const daysWithReport = attendance.filter(a => a.shiftReport).length;

  // Export to CSV
  const exportToCSV = () => {
    if (attendance.length === 0) return;

    const headers = [
      "Employee Name",
      "Email",
      "Date",
      "Clock In",
      "Clock Out",
      "Total Hours",
      "Break Count",
      "Total Break Time (min)",
      "Status",
      "Shift Report"
    ];

    const rows = attendance.map((record) => [
      record.user.displayName || "N/A",
      record.user.email,
      format(new Date(record.date), "MMM dd, yyyy"),
      record.clockIn ? formatTime(record.clockIn, "MMM dd, yyyy hh:mm a", true) : "-",
      record.clockOut ? formatTime(record.clockOut, "MMM dd, yyyy hh:mm a", true) : "-",
      record.totalHours != null ? record.totalHours.toFixed(2) : "-",
      record.breaks.length.toString(),
      record.totalBreak.toString(),
      record.status.replace(/_/g, " "),
      record.shiftReport ? record.shiftReport.replace(/"/g, '""').replace(/\n/g, " ") : "-",
    ]);

    // Calculate totals
    const totalHoursSum = attendance.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const totalBreaksCount = attendance.reduce((sum, record) => sum + record.breaks.length, 0);
    const totalBreakTimeSum = attendance.reduce((sum, record) => sum + record.totalBreak, 0);

    // Add summary row
    const summaryRow = [
      "TOTAL",
      "",
      `${attendance.length} days`,
      "",
      "",
      totalHoursSum.toFixed(2),
      totalBreaksCount.toString(),
      totalBreakTimeSum.toString(),
      "",
      "",
    ];

    const csvContent = [headers, ...rows, summaryRow]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `timesheet_${startDate}_to_${endDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick date range presets
  const setQuickRange = (range: "7days" | "30days" | "90days" | "thisMonth" | "lastMonth") => {
    const now = new Date();
    let from: Date;
    let to = now;

    switch (range) {
      case "7days":
        from = subDays(now, 7);
        break;
      case "30days":
        from = subDays(now, 30);
        break;
      case "90days":
        from = subDays(now, 90);
        break;
      case "thisMonth":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }

    setDateRange({ from, to });
    setTempRange({ from, to });
  };

  // Apply the temp range to the actual range
  const applyDateRange = () => {
    if (tempRange.from && tempRange.to) {
      setDateRange({ from: tempRange.from, to: tempRange.to });
      setIsDatePickerOpen(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Timesheet</h1>
          <p className="text-muted-foreground">
            {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
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

          {/* Date Range Picker */}
          <Popover
            open={isDatePickerOpen}
            onOpenChange={(open) => {
              setIsDatePickerOpen(open);
              // Sync tempRange with dateRange when opening
              if (open) {
                setTempRange({ from: dateRange.from, to: dateRange.to });
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <h4 className="font-medium text-sm mb-2">Quick Select</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuickRange("7days");
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuickRange("30days");
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuickRange("thisMonth");
                      setIsDatePickerOpen(false);
                    }}
                  >
                    This Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuickRange("lastMonth");
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Last Month
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm mb-2">Custom Range</h4>
                <div className="space-y-3">
                  {/* Display selected range */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">From</div>
                      <Button
                        variant={tempRange.from ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start font-normal"
                        onClick={() => setTempRange({ from: undefined, to: tempRange.to })}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempRange.from ? format(tempRange.from, "MMM dd, yyyy") : "Select"}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">To</div>
                      <Button
                        variant={tempRange.to ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start font-normal"
                        onClick={() => setTempRange({ from: tempRange.from, to: undefined })}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempRange.to ? format(tempRange.to, "MMM dd, yyyy") : "Select"}
                      </Button>
                    </div>
                  </div>

                  {/* Single calendar with range selection */}
                  <CalendarComponent
                    mode="single"
                    selected={tempRange.from}
                    onSelect={(date) => {
                      if (!date) return;

                      // If both missing, always set "from" first
                      if (!tempRange.from && !tempRange.to) {
                        setTempRange({ from: date, to: undefined });
                        return;
                      }

                      // If "to" is missing, set it
                      if (tempRange.from && !tempRange.to) {
                        // If selected date is before "from", update "from"
                        if (date < tempRange.from) {
                          setTempRange({ from: date, to: tempRange.from });
                        } else {
                          // Otherwise set as "to"
                          setTempRange({ from: tempRange.from, to: date });
                        }
                        return;
                      }

                      // If "from" is missing, set it
                      if (!tempRange.from && tempRange.to) {
                        // If selected date is after "to", update "to"
                        if (date > tempRange.to) {
                          setTempRange({ from: tempRange.to, to: date });
                        } else {
                          // Otherwise set as "from"
                          setTempRange({ from: date, to: tempRange.to });
                        }
                        return;
                      }

                      // If both are set and user clicks a date, start fresh with that as "from"
                      if (tempRange.from && tempRange.to) {
                        setTempRange({ from: date, to: undefined });
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    numberOfMonths={2}
                    className={cn("rounded-md")}
                    modifiers={{
                      range_start: tempRange.from ? [tempRange.from] : [],
                      range_end: tempRange.to ? [tempRange.to] : [],
                      range_middle: tempRange.from && tempRange.to ?
                        Array.from(
                          { length: Math.floor((tempRange.to.getTime() - tempRange.from.getTime()) / (1000 * 60 * 60 * 24)) - 1 },
                          (_, i) => new Date(tempRange.from!.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
                        ) : [],
                    }}
                    modifiersClassNames={{
                      range_start: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-l-md",
                      range_end: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-r-md",
                      range_middle: "bg-primary/20 text-primary",
                    }}
                  />

                  <Button
                    className="w-full"
                    size="sm"
                    onClick={applyDateRange}
                    disabled={!tempRange.from || !tempRange.to}
                  >
                    Apply Range
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={attendance.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <>
          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <p className="text-xs text-muted-foreground">Total worked</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <p className="text-xs text-muted-foreground">Average per day</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <p className="text-xs text-muted-foreground">Shift reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Your clock in/out records for the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                        <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-3"><Skeleton className="h-4 w-12" /></td>
                        <td className="p-3"><Skeleton className="h-6 w-24 rounded-full" /></td>
                        <td className="p-3"><Skeleton className="h-4 w-4" /></td>
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
