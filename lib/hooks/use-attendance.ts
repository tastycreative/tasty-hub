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
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  totalBreak: number;
  duration: number | null;
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
}

// Mutation for clock actions
export function useAttendanceAction() {
  const queryClient = useQueryClient();
  const timezone = getUserTimezone();

  return useMutation({
    mutationFn: async ({ action, breakType }: AttendanceActionParams) => {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-timezone": timezone,
        },
        body: JSON.stringify({ action, timezone, breakType }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform attendance action");
      }

      return response.json() as Promise<AttendanceResponse>;
    },
    onSuccess: (data) => {
      // Update the attendance cache
      queryClient.setQueryData(["attendance", "today", timezone], data);
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
    },
  });
}
