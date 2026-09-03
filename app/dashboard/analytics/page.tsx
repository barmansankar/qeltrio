import { Suspense } from "react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { DashboardOverviewSkeleton } from "@/components/ui/skeleton";
import { getDashboardAnalytics } from "@/lib/analytics";

export const metadata = {
  title: "Analytics | Dashboard | Qeltrio",
};

async function AnalyticsContent() {
  const data = await getDashboardAnalytics("30d");
  return <AnalyticsDashboard initialData={data} />;
}

export default function DashboardAnalyticsPage() {
  return (
    <DashboardPage
      title="Analytics"
      description="Detailed charts and performance metrics for your marketplace."
    >
      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </DashboardPage>
  );
}
