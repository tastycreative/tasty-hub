import { getUsersExcludingViewerOnly, getUserStats } from "@/lib/data/users";
import {
  UsersHeader,
  UserStatsCards,
  UsersTable,
} from "@/components/admin";

/**
 * HR Employees Page
 * Shows all users except those who only have viewer roles
 */
export default async function HREmployeesPage() {
  const [users, stats] = await Promise.all([
    getUsersExcludingViewerOnly(),
    getUserStats(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <UsersHeader />
      <UserStatsCards stats={stats} showPendingInvites={false} />
      <UsersTable users={users} />
    </div>
  );
}
