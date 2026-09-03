import { Download } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Downloads",
};

export default function AccountDownloadsPage() {
  return (
    <div className="space-y-6">
      <header className="page-header mb-0">
        <h1 className="page-title text-2xl">Downloads</h1>
        <p className="page-description text-sm">
          Your product download history.
        </p>
      </header>

      <EmptyState
        icon={Download}
        title="No downloads yet"
        description="Download history will appear here after you purchase and download products."
        action={{ label: "Browse Products", href: "/products" }}
      />
    </div>
  );
}
