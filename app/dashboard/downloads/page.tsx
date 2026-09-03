import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export const metadata = {
  title: "Downloads | Dashboard | Qeltrio",
};

export default function DashboardDownloadsPage() {
  return (
    <DashboardPlaceholder
      title="Downloads"
      description="Monitor product download activity across the marketplace."
      icon="downloads"
      emptyTitle="No downloads yet"
      emptyDescription="Download records will appear here once secure R2 downloads are enabled in Phase 7."
    />
  );
}
