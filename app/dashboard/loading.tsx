import { DashboardOverviewSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-800/60" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-zinc-800/60" />
      </div>
      <DashboardOverviewSkeleton />
    </div>
  );
}
