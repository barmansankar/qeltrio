import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export const metadata = {
  title: "Settings | Dashboard | Qeltrio",
};

export default function DashboardSettingsPage() {
  return (
    <DashboardPlaceholder
      title="Settings"
      description="Configure your marketplace preferences and integrations."
      icon="settings"
      emptyTitle="Settings coming soon"
      emptyDescription="Marketplace settings, integrations, and configuration options will be available in a future phase."
    />
  );
}
