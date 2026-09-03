import { Settings } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Account Settings",
};

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="page-header mb-0">
        <h1 className="page-title text-2xl">Settings</h1>
        <p className="page-description text-sm">
          Manage your account preferences.
        </p>
      </header>

      <EmptyState
        icon={Settings}
        title="Settings coming soon"
        description="Profile editing, password changes, and notification preferences will be available in a future update."
        action={{ label: "Back to Account", href: "/account" }}
      />
    </div>
  );
}
