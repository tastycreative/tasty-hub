import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HRLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 animate-pulse" />
          <Skeleton className="h-4 w-64 animate-pulse [animation-delay:100ms]" />
        </div>
        <Skeleton className="h-10 w-28 animate-pulse [animation-delay:200ms]" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
              <Skeleton className="h-4 w-4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1 animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
              <Skeleton className="h-3 w-20 animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <Card className="flex-1">
        <CardHeader>
          <Skeleton className="h-6 w-32 animate-pulse" />
          <Skeleton className="h-4 w-48 animate-pulse [animation-delay:100ms]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="flex items-center gap-4">
                <Skeleton
                  className="h-10 w-10 rounded-full animate-pulse"
                  style={{ animationDelay: `${row * 50}ms` }}
                />
                <div className="flex-1 space-y-2">
                  <Skeleton
                    className="h-4 w-1/3 animate-pulse"
                    style={{ animationDelay: `${row * 50 + 25}ms` }}
                  />
                  <Skeleton
                    className="h-3 w-1/4 animate-pulse"
                    style={{ animationDelay: `${row * 50 + 50}ms` }}
                  />
                </div>
                <Skeleton
                  className="h-6 w-16 rounded-full animate-pulse"
                  style={{ animationDelay: `${row * 50 + 75}ms` }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
