import Link from "next/link";
import { Layers } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/constants/product-categories";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Categories | Qeltrio",
  description: "Browse products by category.",
};

export default function CategoriesPage() {
  return (
    <div className="page-container page-section">
      <header className="page-header">
        <h1 className="page-title">Categories</h1>
        <p className="page-description">
          Explore products organized by type and use case.
        </p>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/products?category=${encodeURIComponent(category)}`}
            className="surface-card card-hover p-5 text-label text-zinc-200"
          >
            {category}
          </Link>
        ))}
      </div>

      <EmptyState
        icon={Layers}
        title="Browse by category"
        description="Select a category above to view matching products in the marketplace."
        action={{ label: "View all products", href: "/products" }}
      />
    </div>
  );
}
