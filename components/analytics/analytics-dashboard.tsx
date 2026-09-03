"use client";

import { useCallback, useState, useTransition } from "react";
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import { ChartCard } from "@/components/analytics/chart-card";
import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import { ProductPerformanceChart } from "@/components/analytics/product-performance-chart";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { UserGrowthChart } from "@/components/analytics/user-growth-chart";
import { ViewsDownloadsChart } from "@/components/analytics/views-downloads-chart";
import { Badge } from "@/components/ui/badge";
import { DashboardOverviewSkeleton } from "@/components/ui/skeleton";
import type { AnalyticsDateRange, DashboardAnalyticsData } from "@/types/analytics";

interface AnalyticsDashboardProps {
  initialData: DashboardAnalyticsData;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [range, setRange] = useState<AnalyticsDateRange>(initialData.range);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const loadRange = useCallback((nextRange: AnalyticsDateRange) => {
    setRange(nextRange);
    startTransition(async () => {
      const response = await fetch(`/api/analytics/dashboard?range=${nextRange}`);
      if (!response.ok) return;
      const nextData = (await response.json()) as DashboardAnalyticsData;
      setData(nextData);
    });
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DateRangeFilter value={range} onChange={loadRange} />
        {isPending && (
          <p className="text-caption" aria-live="polite">
            Updating analytics…
          </p>
        )}
      </div>

      {isPending ? (
        <DashboardOverviewSkeleton />
      ) : (
        <DashboardKpiGrid kpis={data.kpis} />
      )}

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
        <ChartCard
          title="Views Overview"
          description="Page and product views compared to downloads."
        >
          <ViewsDownloadsChart data={data.viewsDownloads} />
        </ChartCard>

        <ChartCard
          title="User Growth"
          description="New user signups over the selected period."
        >
          <UserGrowthChart data={data.userGrowth} />
        </ChartCard>
      </div>

      <ChartCard
        title="Product Performance"
        description="Top products by views, downloads, and purchases."
      >
        <ProductPerformanceChart data={data.productPerformance} />
      </ChartCard>

      <ChartCard
        title="Revenue"
        description="Revenue trend for the selected period."
        badge={<Badge variant="warning">Placeholder</Badge>}
      >
        <RevenueChart data={data.revenue} />
      </ChartCard>
    </div>
  );
}
