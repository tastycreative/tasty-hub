import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusKey = status as StatusType;
  const styles = statusStyles[statusKey] ?? statusStyles.Inactive;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles,
        className
      )}
    >
      {status}
    </span>
  );
}
