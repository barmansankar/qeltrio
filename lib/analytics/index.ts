import { firestoreAnalyticsService } from "@/lib/analytics/firestore-service";
import type { AnalyticsService } from "@/lib/analytics/types";

/**
 * Analytics service entry point.
 * Swap this provider to plug in a dedicated analytics platform later
 * without changing dashboard UI components.
 */
export function getAnalyticsService(): AnalyticsService {
  return firestoreAnalyticsService;
}

export async function getDashboardAnalytics(
  ...args: Parameters<AnalyticsService["getDashboardAnalytics"]>
) {
  return getAnalyticsService().getDashboardAnalytics(...args);
}
