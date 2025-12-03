import { getUsers, getUserStats } from "@/lib/data/users";
import {
  UsersHeader,
  UserStatsCards,
  UsersTable,
} from "@/components/admin";

export default async function UsersPage() {
  const [users, stats] = await Promise.all([getUsers(), getUserStats()]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <UsersHeader />
      <UserStatsCards stats={stats} />
      <UsersTable users={users} />
    </div>
  );
}
