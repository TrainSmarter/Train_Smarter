import { Skeleton } from "@/components/ui/skeleton";

export default function OrganisationLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>

      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
