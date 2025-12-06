"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Clock, Play, Square, Coffee, ChevronDown, Utensils, User, MoreHorizontal, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { ShiftReportModal } from "@/components/shift-report-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAttendance,
  useAttendanceAction,
  useSubmitShiftReport,
  type Attendance,
  type Break,
} from "@/lib/hooks/use-attendance";

type BreakType = "SHORT" | "LUNCH" | "PERSONAL" | "OTHER";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatTime(dateString: string, timezone: string): string {
  const dt = DateTime.fromISO(dateString).setZone(timezone);
  return dt.toFormat("hh:mm a");
}

// Get short timezone label
function getTimezoneLabel(timezone: string): string {
  const dt = DateTime.now().setZone(timezone);
  return dt.toFormat("ZZZZ"); // e.g., "PST", "EST", "PHT"
}

export function ClockInOut() {
  // TanStack Query hooks
  const { data, isLoading } = useAttendance();
  const attendanceAction = useAttendanceAction();
  const submitShiftReport = useSubmitShiftReport();
  
  // Extract attendance and activeBreak from query data
  const attendance = data?.attendance ?? null;
  const activeBreak = data?.activeBreak ?? null;
  
  // Local state for timer and UI
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState<{ local: string; la: string; localDate: string; laDate: string }>({
    local: "",
    la: "",
    localDate: "",
    laDate: "",
  });
  
  // Shift report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [clockedOutAttendance, setClockedOutAttendance] = useState<Attendance | null>(null);

  // Date selection dialog state
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [pendingClockOut, setPendingClockOut] = useState(false);

  // Debug log for dialog state changes
  useEffect(() => {
    console.log("[DEBUG] showDateDialog changed to:", showDateDialog);
  }, [showDateDialog]);

  // Get user's timezone using Luxon
  const timezone = useMemo(() => {
    return DateTime.local().zoneName || "UTC";
  }, []);

  // LA timezone
  const laTimezone = "America/Los_Angeles";

  // Check on mount and when attendance changes if there's a clocked out attendance without a shift report
  useEffect(() => {
    if (attendance && attendance.status === "CLOCKED_OUT" && !attendance.shiftReport && attendance.clockOut) {
      // Only show modal if clock out was today
      const clockOutDate = DateTime.fromISO(attendance.clockOut).setZone(timezone);
      const today = DateTime.now().setZone(timezone);

      if (clockOutDate.hasSame(today, 'day')) {
        setClockedOutAttendance(attendance);
        setShowReportModal(true);
      }
    }
  }, [attendance, timezone]);

  // Single synchronized timer for both current time and elapsed time
  useEffect(() => {
    const updateAll = () => {
      const now = DateTime.now();
      
      // Update current time display
      setCurrentTime({
        local: now.setZone(timezone).toFormat("h:mm:ss a"),
        la: now.setZone(laTimezone).toFormat("h:mm:ss a"),
        localDate: now.setZone(timezone).toFormat("ccc, LLL d"),
        laDate: now.setZone(laTimezone).toFormat("ccc, LLL d"),
      });

      // Update elapsed time based on status
      if (attendance) {
        if (attendance.status === "CLOCKED_IN" && attendance.clockIn) {
          // Show total work time (excluding all breaks)
          const clockInTime = new Date(attendance.clockIn).getTime();
          const totalBreakSeconds = attendance.totalBreak * 60; // Convert minutes to seconds
          const totalElapsed = Math.floor((now.toMillis() - clockInTime) / 1000);
          setElapsedSeconds(totalElapsed - totalBreakSeconds);
        } else if (attendance.status === "ON_BREAK" && activeBreak && activeBreak.startTime) {
          // Show current break duration only
          const breakStartTime = new Date(activeBreak.startTime).getTime();
          setElapsedSeconds(Math.floor((now.toMillis() - breakStartTime) / 1000));
        } else {
          setElapsedSeconds(0);
        }
      } else {
        setElapsedSeconds(0);
      }
    };

    // Calculate delay to sync with the next second boundary
    const now = Date.now();
    const msUntilNextSecond = 1000 - (now % 1000);

    // Initial update
    updateAll();

    // Start synced interval after waiting for next second boundary
    const timeout = setTimeout(() => {
      updateAll();
      const interval = setInterval(updateAll, 1000);
      // Store interval ID for cleanup
      (window as Window & { __clockInterval?: NodeJS.Timeout }).__clockInterval = interval;
    }, msUntilNextSecond);

    return () => {
      clearTimeout(timeout);
      const interval = (window as Window & { __clockInterval?: NodeJS.Timeout }).__clockInterval;
      if (interval) clearInterval(interval);
    };
  }, [timezone, attendance, activeBreak]);

  // Check if there are other completed attendance records for the clock-in date (excluding current one)
  const checkForExistingAttendance = async () => {
    try {
      // Use the date from the current attendance's clockIn, not today's date
      // This handles the case where user clocked in on Day 1 and is clocking out on Day 2
      if (!attendance?.clockIn) {
        return false;
      }
      
      const clockInDate = DateTime.fromISO(attendance.clockIn).setZone(timezone).startOf("day").toFormat("yyyy-MM-dd");
      console.log("[DEBUG] Checking for existing attendance on clock-in date:", clockInDate);
      console.log("[DEBUG] Current attendance ID:", attendance?.id);

      const response = await fetch(`/api/attendance/history?startDate=${clockInDate}&endDate=${clockInDate}`);
      const data = await response.json();

      console.log("[DEBUG] API response:", data);
      console.log("[DEBUG] Attendance records found:", data.attendance);

      // Check if there are any CLOCKED_OUT records for the clock-in date (excluding current attendance)
      const hasCompletedAttendance = data.attendance?.some(
        (record: Attendance) => {
          console.log("[DEBUG] Checking record:", record.id, "status:", record.status, "is current?", record.id === attendance?.id);
          // Only count CLOCKED_OUT records that are NOT the current attendance
          return record.status === "CLOCKED_OUT" && record.id !== attendance?.id;
        }
      );

      console.log("[DEBUG] Has completed attendance (excluding current):", hasCompletedAttendance);
      return hasCompletedAttendance;
    } catch (error) {
      console.error("Error checking attendance:", error);
      return false;
    }
  };

  // Handle clock actions using mutation
  const handleAction = async (action: "clock_in" | "clock_out" | "start_break" | "end_break", breakType?: BreakType) => {
    console.log("[DEBUG] handleAction called with action:", action);

    // Special handling for clock_out - check if we need to ask about the date
    if (action === "clock_out") {
      console.log("[DEBUG] Clock out action - checking for existing attendance");
      const hasExisting = await checkForExistingAttendance();
      console.log("[DEBUG] hasExisting result:", hasExisting);

      if (hasExisting) {
        console.log("[DEBUG] Setting showDateDialog to true");
        setPendingClockOut(true);
        setShowDateDialog(true);
        return;
      }
      console.log("[DEBUG] No existing attendance, proceeding with clock out");
    }

    attendanceAction.mutate(
      { action, breakType },
      {
        onSuccess: (data) => {
          // Show shift report modal after clocking out
          if (action === "clock_out" && data.attendance) {
            setClockedOutAttendance(data.attendance);
            setShowReportModal(true);
          }
        },
      }
    );
  };

  // Execute clock out with selected date
  const executeClockOut = (useNextDay: boolean) => {
    setShowDateDialog(false);
    setPendingClockOut(false);

    attendanceAction.mutate(
      { action: "clock_out", useNextDay },
      {
        onSuccess: (data) => {
          if (data.attendance) {
            setClockedOutAttendance(data.attendance);
            setShowReportModal(true);
          }
        },
      }
    );
  };

  // Handle shift report submission using mutation
  const handleSubmitReport = async (report: string) => {
    if (!clockedOutAttendance) return;

    submitShiftReport.mutate(
      {
        attendanceId: clockedOutAttendance.id,
        shiftReport: report,
      },
      {
        onSuccess: () => {
          // Close modal after successful submission
          setShowReportModal(false);
          setClockedOutAttendance(null);
        },
      }
    );
  };

  // Get break type label
  const getBreakTypeLabel = (type: BreakType) => {
    switch (type) {
      case "SHORT": return "Short Break";
      case "LUNCH": return "Lunch Break";
      case "PERSONAL": return "Personal Break";
      case "OTHER": return "Other Break";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        {/* Time Display Skeleton */}
        <div className="hidden md:flex items-center gap-3">
          {/* Local Time Skeleton */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-8 animate-pulse rounded bg-muted" />
          </div>
          
          {/* Separator */}
          <div className="h-3 w-px bg-muted" />
          
          {/* LA Time Skeleton */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-8 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Separator Skeleton */}
        <div className="hidden md:block h-4 w-px bg-muted" />

        {/* Button Skeleton */}
        <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  const isClockedIn = attendance?.status === "CLOCKED_IN";
  const isOnBreak = attendance?.status === "ON_BREAK";
  const isClockedOut = !attendance || attendance.status === "CLOCKED_OUT";

  // Check if user is in LA timezone
  const isInLA = timezone === laTimezone;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {/* Time Display */}
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          {/* User's Local Time with Date */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" />
                <span>{currentTime.localDate}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{currentTime.local}</span>
                <span className="text-[10px] opacity-60">{getTimezoneLabel(timezone)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Your local time ({timezone})</TooltipContent>
          </Tooltip>

          {/* LA Time with Date - only show if user is not in LA */}
          {!isInLA && (
            <>
              <span className="text-muted-foreground/30">|</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 font-mono">
                    <Globe className="h-3 w-3" />
                    <span>{currentTime.laDate}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>{currentTime.la}</span>
                    <span className="text-[10px] opacity-60">{getTimezoneLabel(laTimezone)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Los Angeles time (HQ)</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Separator */}
        <div className="hidden md:block h-4 w-px bg-border" />

        {/* Timer Display */}
        {(isClockedIn || isOnBreak) && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-mono",
              isOnBreak
                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                : "bg-green-500/10 text-green-600 dark:text-green-400"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDuration(elapsedSeconds)}</span>
            {isOnBreak && <span className="text-xs">(break)</span>}
          </div>
        )}

        {/* Clock In Button */}
        {isClockedOut && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("clock_in")}
                disabled={attendanceAction.isPending}
                className="gap-1.5 text-green-600 border-green-600/30 hover:bg-green-500/10 hover:text-green-600"
              >
                <Play className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clock In</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Start your work day</TooltipContent>
          </Tooltip>
        )}

        {/* Actions Menu when clocked in */}
        {(isClockedIn || isOnBreak) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={attendanceAction.isPending}
                className={cn(
                  "gap-1",
                  isOnBreak
                    ? "text-yellow-600 border-yellow-600/30 hover:bg-yellow-500/10"
                    : "text-green-600 border-green-600/30 hover:bg-green-500/10"
                )}
              >
                {isOnBreak ? (
                  <Coffee className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {attendance?.clockIn && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Clocked in at {formatTime(attendance.clockIn, laTimezone)} {getTimezoneLabel(laTimezone)}
                </div>
              )}
              
              {/* Show break count if any */}
              {attendance?.breaks && attendance.breaks.length > 0 && (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Breaks today: {attendance.breaks.length} ({attendance.totalBreak} min)
                </div>
              )}
              
              <DropdownMenuSeparator />
              
              {isClockedIn && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Coffee className="mr-2 h-4 w-4" />
                    Start Break
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleAction("start_break", "SHORT")}>
                        <Coffee className="mr-2 h-4 w-4" />
                        Short Break (15 min)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("start_break", "LUNCH")}>
                        <Utensils className="mr-2 h-4 w-4" />
                        Lunch Break
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("start_break", "PERSONAL")}>
                        <User className="mr-2 h-4 w-4" />
                        Personal Break
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("start_break", "OTHER")}>
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Other
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}
              
              {isOnBreak && activeBreak && (
                <DropdownMenuItem onClick={() => handleAction("end_break")}>
                  <Play className="mr-2 h-4 w-4" />
                  End {getBreakTypeLabel(activeBreak.type)}
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => handleAction("clock_out")}
                className="text-red-600 focus:text-red-600"
              >
                <Square className="mr-2 h-4 w-4" />
                Clock Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Shift Report Modal - Required, no close button */}
        <ShiftReportModal
          isOpen={showReportModal}
          onSubmit={handleSubmitReport}
          clockOutTime={clockedOutAttendance?.clockOut || undefined}
          totalHours={clockedOutAttendance?.totalHours || undefined}
          totalBreak={clockedOutAttendance?.totalBreak}
          timezone={laTimezone}
          isSubmitting={submitShiftReport.isPending}
        />

        {/* Date Selection Dialog */}
        <AlertDialog open={showDateDialog} onOpenChange={setShowDateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Choose Date for This Shift</AlertDialogTitle>
              <AlertDialogDescription>
                You already have a completed shift for {attendance?.clockIn ? DateTime.fromISO(attendance.clockIn).setZone(timezone).toFormat("MMM dd") : "this date"}. Would you like to assign this shift to the same date (creating multiple shifts) or to the next day?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogAction
                onClick={() => executeClockOut(false)}
                className="bg-primary"
              >
                Keep Same Date ({attendance?.clockIn ? DateTime.fromISO(attendance.clockIn).setZone(timezone).toFormat("MMM dd") : "Today"})
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => executeClockOut(true)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Assign to Next Day ({attendance?.clockIn ? DateTime.fromISO(attendance.clockIn).setZone(timezone).plus({ days: 1 }).toFormat("MMM dd") : "Tomorrow"})
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
