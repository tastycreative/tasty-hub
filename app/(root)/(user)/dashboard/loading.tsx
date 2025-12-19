import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Welcome header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 animate-pulse" />
        <Skeleton className="h-4 w-96 animate-pulse [animation-delay:100ms]" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
              <Skeleton className="h-4 w-4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1 animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
              <Skeleton className="h-3 w-24 animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart skeleton */}
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32 animate-pulse" />
            <Skeleton className="h-4 w-48 animate-pulse [animation-delay:100ms]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full animate-pulse [animation-delay:200ms]" />
          </CardContent>
        </Card>

        {/* Recent activity skeleton */}
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32 animate-pulse" />
            <Skeleton className="h-4 w-40 animate-pulse [animation-delay:100ms]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton
                    className="h-9 w-9 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 75}ms` }}
                  />
                  <div className="flex-1 space-y-1">
                    <Skeleton
                      className="h-4 w-3/4 animate-pulse"
                      style={{ animationDelay: `${i * 75 + 25}ms` }}
                    />
                    <Skeleton
                      className="h-3 w-1/2 animate-pulse"
                      style={{ animationDelay: `${i * 75 + 50}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
