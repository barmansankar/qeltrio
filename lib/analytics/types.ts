import type {
  AnalyticsDateRange,
  DailyAnalyticsDoc,
  DashboardAnalyticsData,
  KpiMetric,
  ProductPerformancePoint,
  RevenuePoint,
  TimeSeriesPoint,
  UserGrowthPoint,
} from "@/types/analytics";

export interface AnalyticsService {
  getDashboardAnalytics(range: AnalyticsDateRange): Promise<DashboardAnalyticsData>;
}

export type {
  AnalyticsDateRange,
  DashboardAnalyticsData,
  KpiMetric,
  ProductPerformancePoint,
  RevenuePoint,
  TimeSeriesPoint,
  UserGrowthPoint,
  DailyAnalyticsDoc,
};
