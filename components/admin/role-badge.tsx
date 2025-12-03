import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const roleStyles: Record<RoleType, string> = {
  OWNER: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEMBER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleKey = role as RoleType;
  const styles = roleStyles[roleKey] ?? roleStyles.VIEWER;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles,
        className
      )}
    >
      {role}
    </span>
  );
}
