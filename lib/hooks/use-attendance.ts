import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";

type AttendanceStatus = "CLOCKED_IN" | "CLOCKED_OUT" | "ON_BREAK" | "ABSENT";
type BreakType = "SHORT" | "LUNCH" | "PERSONAL" | "OTHER";

export interface Break {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  type: BreakType;
}

export interface Attendance {
  id: string;
  date: string; // The date of the attendance record
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  totalBreak: number;
  duration: number | null;
  totalHours: number | null; // Net work hours (duration - breaks)
  breaks: Break[];
  shiftReport?: string | null;
}

interface AttendanceResponse {
  attendance: Attendance | null;
  activeBreak: Break | null;
}

// Get user's timezone
function getUserTimezone(): string {
  return DateTime.local().zoneName || "UTC";
}

// Fetch current attendance
async function fetchAttendance(timezone: string): Promise<AttendanceResponse> {
  const response = await fetch(
    `/api/attendance?timezone=${encodeURIComponent(timezone)}`,
    {
      headers: {
        "x-timezone": timezone,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch attendance");
  }
  
  return response.json();
}

// Hook to get current attendance
export function useAttendance() {
  const timezone = getUserTimezone();
  
  return useQuery({
    queryKey: ["attendance", "today", timezone],
    queryFn: () => fetchAttendance(timezone),
    staleTime: 30 * 1000, // 30 seconds - attendance data can be stale quickly
    refetchInterval: 60 * 1000, // Refetch every minute as backup
  });
}

// Attendance action types
type AttendanceAction = "clock_in" | "clock_out" | "start_break" | "end_break";

interface AttendanceActionParams {
  action: AttendanceAction;
  breakType?: BreakType;
  useNextDay?: boolean; // For clock_out: assign to next day instead of today
}

// Mutation for clock actions with optimistic updates
export function useAttendanceAction() {
  const queryClient = useQueryClient();
  const timezone = getUserTimezone();

  return useMutation({
    mutationFn: async ({ action, breakType, useNextDay }: AttendanceActionParams) => {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-timezone": timezone,
        },
        body: JSON.stringify({ action, timezone, breakType, useNextDay }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform attendance action");
      }

      return response.json() as Promise<AttendanceResponse>;
    },
    // Optimistically update the UI before the API call completes
    onMutate: async ({ action, breakType }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["attendance", "today", timezone] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<AttendanceResponse>(["attendance", "today", timezone]);

      // Optimistically update to the new value
      if (previousData) {
        const now = DateTime.now().setZone(timezone).toISO();
        const optimisticData: AttendanceResponse = { ...previousData };

        switch (action) {
          case "clock_in":
            optimisticData.attendance = {
              id: previousData.attendance?.id || "temp",
              clockIn: now,
              clockOut: null,
              status: "CLOCKED_IN",
              totalBreak: 0,
              duration: null,
              totalHours: null,
              breaks: [],
            };
            break;

          case "clock_out":
            if (optimisticData.attendance) {
              optimisticData.attendance = {
                ...optimisticData.attendance,
                clockOut: now,
                status: "CLOCKED_OUT",
              };
            }
            optimisticData.activeBreak = null;
            break;

          case "start_break":
            if (optimisticData.attendance && breakType && now) {
              optimisticData.attendance.status = "ON_BREAK";
              optimisticData.activeBreak = {
                id: "temp",
                startTime: now,
                endTime: null,
                duration: null,
                type: breakType,
              };
            }
            break;

          case "end_break":
            if (optimisticData.attendance && optimisticData.activeBreak && optimisticData.activeBreak.startTime) {
              // Calculate break duration
              const breakStart = DateTime.fromISO(optimisticData.activeBreak.startTime);
              const breakEnd = DateTime.now().setZone(timezone);
              const breakDurationMinutes = Math.floor(breakEnd.diff(breakStart, 'minutes').minutes);

              // Update attendance with new break duration added to totalBreak
              optimisticData.attendance = {
                ...optimisticData.attendance,
                status: "CLOCKED_IN",
                totalBreak: optimisticData.attendance.totalBreak + breakDurationMinutes,
              };
              optimisticData.activeBreak = null;
            }
            break;
        }

        queryClient.setQueryData(["attendance", "today", timezone], optimisticData);
      }

      // Return context with previous data for rollback on error
      return { previousData };
    },
    // On error, rollback to previous data
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["attendance", "today", timezone], context.previousData);
      }
    },
    // Always refetch after error or success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "today", timezone] });
    },
  });
}

// Mutation for submitting shift report
interface ShiftReportParams {
  attendanceId: string;
  shiftReport: string;
}

export function useSubmitShiftReport() {
  const queryClient = useQueryClient();
  const timezone = getUserTimezone();

  return useMutation({
    mutationFn: async ({ attendanceId, shiftReport }: ShiftReportParams) => {
      const response = await fetch("/api/attendance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-timezone": timezone,
        },
        body: JSON.stringify({ attendanceId, shiftReport, timezone }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit shift report");
      }

      return response.json() as Promise<{ attendance: Attendance }>;
    },
    onSuccess: (data) => {
      // Update the attendance cache
      queryClient.setQueryData(["attendance", "today", timezone], {
        attendance: data.attendance,
        activeBreak: null,
      });

      // Invalidate attendance history to refetch timesheet data
      queryClient.invalidateQueries({ queryKey: ["attendance-history"] });
    },
  });
}
