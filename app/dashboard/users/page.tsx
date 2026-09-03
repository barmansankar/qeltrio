import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";

export const metadata = {
  title: "Users | Dashboard | Qeltrio",
};

export default function DashboardUsersPage() {
  return (
    <DashboardPlaceholder
      title="Users"
      description="View and manage registered marketplace users."
      icon="users"
      emptyTitle="No users yet"
      emptyDescription="User data will appear here once authentication is connected in Phase 2."
    />
  );
}
