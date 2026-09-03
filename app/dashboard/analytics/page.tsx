import dynamic from "next/dynamic";
import { Suspense } from "react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { DashboardOverviewSkeleton } from "@/components/ui/skeleton";
import { getDashboardAnalytics } from "@/lib/analytics";

const AnalyticsDashboard = dynamic(
  () =>
    import("@/components/analytics/analytics-dashboard").then(
      (module) => module.AnalyticsDashboard
    ),
  { loading: () => <DashboardOverviewSkeleton /> }
);

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
