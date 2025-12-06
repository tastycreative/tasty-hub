import { useQuery } from "@tanstack/react-query";

export interface AttendanceRecord {
  id: string;
  userId: string;
  timezone: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  totalBreak: number;
  duration: number | null;
  totalHours: number | null; // Net work hours (duration - breaks)
  status: "CLOCKED_IN" | "CLOCKED_OUT" | "ON_BREAK" | "ABSENT";
  notes: string | null;
  shiftReport: string | null;
  reportedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  breaks: Array<{
    id: string;
    attendanceId: string;
    startTime: string;
    endTime: string | null;
    duration: number | null;
    type: "SHORT" | "LUNCH" | "PERSONAL" | "OTHER";
    notes: string | null;
  }>;
}

export interface AttendanceHistoryParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

async function fetchAttendanceHistory(params?: AttendanceHistoryParams) {
  const searchParams = new URLSearchParams();

  if (params?.userId) searchParams.set("userId", params.userId);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const url = `/api/attendance/history${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch attendance history");
  }

  return response.json() as Promise<{
    attendance: AttendanceRecord[];
    count: number;
  }>;
}

/**
 * Hook to fetch attendance history (timesheet)
 * @param params - Optional filters: userId, startDate, endDate, limit
 * @param enabled - Whether the query should run (default: true)
 */
export function useAttendanceHistory(
  params?: AttendanceHistoryParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["attendance-history", params],
    queryFn: () => fetchAttendanceHistory(params),
    enabled,
  });
}
