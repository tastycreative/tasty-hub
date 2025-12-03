import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminLoading() {
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
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
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

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 animate-pulse" />
          <Skeleton className="h-4 w-48 animate-pulse [animation-delay:100ms]" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="border-b bg-muted/50 p-3">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-4 flex-1 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                ))}
              </div>
            </div>
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="border-b p-3">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((col) => (
                    <Skeleton
                      key={col}
                      className="h-4 flex-1 animate-pulse"
                      style={{ animationDelay: `${(row * 5 + col) * 30}ms` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
