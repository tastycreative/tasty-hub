"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

type AttendanceStatus = "CLOCKED_IN" | "CLOCKED_OUT" | "ON_BREAK" | "ABSENT";
type BreakType = "SHORT" | "LUNCH" | "PERSONAL" | "OTHER";

interface Break {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  type: BreakType;
}

interface Attendance {
  id: string;
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  totalBreak: number;
  duration: number | null;
  breaks: Break[];
}

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
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [activeBreak, setActiveBreak] = useState<Break | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<{ local: string; la: string }>({
    local: "",
    la: "",
  });
  
  // Shift report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [clockedOutAttendance, setClockedOutAttendance] = useState<Attendance | null>(null);

  // Get user's timezone using Luxon
  const timezone = useMemo(() => {
    return DateTime.local().zoneName || "UTC";
  }, []);

  // LA timezone
  const laTimezone = "America/Los_Angeles";

  // Fetch current attendance status
  const fetchAttendance = useCallback(async () => {
    try {
      const response = await fetch(`/api/attendance?timezone=${encodeURIComponent(timezone)}`, {
        headers: {
          "x-timezone": timezone,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance);
        setActiveBreak(data.activeBreak);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timezone]);

  // Initial fetch
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Single synchronized timer for both current time and elapsed time
  useEffect(() => {
    const updateAll = () => {
      const now = DateTime.now();
      
      // Update current time display
      setCurrentTime({
        local: now.setZone(timezone).toFormat("hh:mm:ss a"),
        la: now.setZone(laTimezone).toFormat("hh:mm:ss a"),
      });

      // Update elapsed time if clocked in
      if (attendance) {
        if (attendance.status === "CLOCKED_IN" && attendance.clockIn) {
          const clockInTime = new Date(attendance.clockIn).getTime();
          const breakTime = attendance.totalBreak * 60; // Convert minutes to seconds
          setElapsedSeconds(Math.floor((now.toMillis() - clockInTime) / 1000) - breakTime);
        } else if (attendance.status === "ON_BREAK" && activeBreak) {
          const breakStartTime = new Date(activeBreak.startTime).getTime();
          setElapsedSeconds(Math.floor((now.toMillis() - breakStartTime) / 1000));
        }
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

  // Handle clock actions
  const handleAction = async (action: string, breakType?: BreakType) => {
    setIsActionLoading(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-timezone": timezone,
        },
        body: JSON.stringify({ action, timezone, breakType }),
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance);
        setActiveBreak(data.activeBreak);
        
        // Show shift report modal after clocking out
        if (action === "clock_out" && data.attendance) {
          setClockedOutAttendance(data.attendance);
          setShowReportModal(true);
        }
      }
    } catch (error) {
      console.error("Failed to perform action:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle shift report submission
  const handleSubmitReport = async (report: string) => {
    if (!clockedOutAttendance) return;
    
    try {
      const response = await fetch("/api/attendance", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-timezone": timezone,
        },
        body: JSON.stringify({ 
          attendanceId: clockedOutAttendance.id, 
          shiftReport: report,
          timezone 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance);
      }
    } catch (error) {
      console.error("Failed to submit shift report:", error);
    }
  };

  // Handle modal close
  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setClockedOutAttendance(null);
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
        <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
          {/* User's Local Time */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="h-3 w-3" />
                <span>{currentTime.local}</span>
                <span className="text-[10px] opacity-70">{getTimezoneLabel(timezone)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Your local time ({timezone})</TooltipContent>
          </Tooltip>

          {/* LA Time - only show if user is not in LA */}
          {!isInLA && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Globe className="h-3 w-3" />
                    <span>{currentTime.la}</span>
                    <span className="text-[10px] opacity-70">{getTimezoneLabel(laTimezone)}</span>
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
                disabled={isActionLoading}
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
                disabled={isActionLoading}
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

        {/* Shift Report Modal */}
        <ShiftReportModal
          isOpen={showReportModal}
          onClose={handleCloseReportModal}
          onSubmit={handleSubmitReport}
          clockOutTime={clockedOutAttendance?.clockOut || undefined}
          duration={clockedOutAttendance?.duration || undefined}
          timezone={laTimezone}
        />
      </div>
    </TooltipProvider>
  );
}
