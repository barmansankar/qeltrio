import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/50",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="surface-card p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <Skeleton className="mt-5 h-7 w-20" />
      <Skeleton className="mt-2 h-3.5 w-28" />
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-stretch gap-2 p-3 sm:p-4">
        <div className="w-[60%] space-y-2">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-[40%] shrink-0 rounded-[var(--radius)]" />
      </div>
      <div className="border-t border-[var(--border)] px-3 py-2.5 sm:px-4">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
