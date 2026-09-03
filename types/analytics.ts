export type AnalyticsDateRange = "7d" | "30d" | "90d" | "1y";

export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "download"
  | "signup";

export type KpiFormat = "number" | "currency";

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  period: string;
  format?: KpiFormat;
  isPlaceholder?: boolean;
  placeholderLabel?: string;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  views: number;
  downloads: number;
}

export interface UserGrowthPoint {
  date: string;
  label: string;
  users: number;
}

export interface ProductPerformancePoint {
  productId: string;
  name: string;
  views: number;
  downloads: number;
  purchases: number;
}

export interface RevenuePoint {
  date: string;
  label: string;
  revenue: number;
  isPlaceholder: true;
}

export interface DashboardAnalyticsData {
  kpis: KpiMetric[];
  viewsDownloads: TimeSeriesPoint[];
  userGrowth: UserGrowthPoint[];
  productPerformance: ProductPerformancePoint[];
  revenue: RevenuePoint[];
  range: AnalyticsDateRange;
  lastUpdated: string;
}

export interface TrackAnalyticsPayload {
  type: AnalyticsEventType;
  productId?: string;
  path?: string;
}

export interface DailyAnalyticsDoc {
  pageViews: number;
  productViews: number;
  downloads: number;
  signups: number;
  purchases: number;
  updatedAt: string;
}

export interface ProductDailyAnalyticsDoc {
  productId: string;
  date: string;
  views: number;
  downloads: number;
  purchases: number;
  updatedAt: string;
}
