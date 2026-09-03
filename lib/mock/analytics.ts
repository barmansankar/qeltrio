export type KpiFormat = "number" | "currency";

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  period: string;
  format?: KpiFormat;
}

export interface DashboardOverviewData {
  kpis: KpiMetric[];
  lastUpdated: string;
}

/**
 * Mock dashboard KPI data.
 * Replace with Firestore queries when analytics collections are populated.
 */
export async function getDashboardOverview(): Promise<DashboardOverviewData> {
  // Simulate network latency for realistic loading states
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    kpis: [
      {
        id: "views",
        label: "Total Views",
        value: 12840,
        change: 12.5,
        period: "vs previous period",
      },
      {
        id: "downloads",
        label: "Total Downloads",
        value: 4328,
        change: 8.2,
        period: "vs previous period",
      },
      {
        id: "users",
        label: "Total Users",
        value: 2481,
        change: 5.4,
        period: "vs previous period",
      },
      {
        id: "revenue",
        label: "Total Revenue",
        value: 24850,
        change: 18.3,
        period: "vs previous period",
        format: "currency",
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}
