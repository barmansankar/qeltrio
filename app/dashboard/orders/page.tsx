import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export const metadata = {
  title: "Orders | Dashboard | Qeltrio",
};

export default function DashboardOrdersPage() {
  return (
    <DashboardPlaceholder
      title="Orders"
      description="Track purchases and order history across the marketplace."
      icon="orders"
      emptyTitle="No orders yet"
      emptyDescription="Orders will appear here once Lemon Squeezy checkout is integrated in Phase 6."
    />
  );
}
