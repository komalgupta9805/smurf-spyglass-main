import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface PageSkeletonProps {
  type?: "analytics" | "table" | "chart" | "full";
  count?: number;
}

const PageSkeleton = ({ type = "analytics", count = 5 }: PageSkeletonProps) => {
  if (type === "analytics") {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-7 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-48 w-full" />
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="p-4 space-y-3">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="space-y-3 animate-fade-in">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <Card className="p-4 animate-fade-in">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
};

export default PageSkeleton;
