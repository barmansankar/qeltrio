import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Purchases",
};

export default function AccountPurchasesPage() {
  return (
    <div className="space-y-6">
      <header className="page-header mb-0">
        <h1 className="page-title text-2xl">Purchases</h1>
        <p className="page-description text-sm">
          Products you&apos;ve purchased on Qeltrio.
        </p>
      </header>

      <EmptyState
        icon={ShoppingBag}
        title="No purchases yet"
        description="When you buy a product, it will appear here with download access."
        action={{ label: "Browse Products", href: "/products" }}
      />
    </div>
  );
}
