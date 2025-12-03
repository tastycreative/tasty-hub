import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Top cards skeleton */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Skeleton className="aspect-video rounded-xl animate-pulse" />
        <Skeleton className="aspect-video rounded-xl animate-pulse [animation-delay:150ms]" />
        <Skeleton className="aspect-video rounded-xl animate-pulse [animation-delay:300ms]" />
      </div>
      
      {/* Main content skeleton */}
      <Skeleton className="min-h-[50vh] flex-1 rounded-xl animate-pulse [animation-delay:450ms]" />
    </div>
  );
}
