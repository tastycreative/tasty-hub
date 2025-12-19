import { AttendanceView } from "@/features/attendance/components";

/**
 * Team Attendance Page
 * This page is shared across all team types (Admin, HR, Team)
 * Uses the AttendanceView component from features/attendance/components
 */
export default function AttendancePage() {
  return <AttendanceView />;
}
