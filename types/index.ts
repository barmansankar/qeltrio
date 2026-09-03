export type UserRole = "user" | "admin";

export type ProductStatus = "published" | "draft" | "archived";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export type { UserProfile, AuthUser, SignUpInput, SignInInput, ForgotPasswordInput } from "./auth";
export type { Product, ProductDetailView, ProductRatings, ProductWithRatings } from "./product";
export type {
  AnalyticsDateRange,
  DashboardAnalyticsData,
  KpiMetric,
  KpiFormat,
} from "./analytics";
