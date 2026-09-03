import { Suspense } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductsCatalog } from "@/components/products/products-catalog";
import { ProductsSearchBar } from "@/components/products/products-search-bar";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { getFeaturedProducts } from "@/lib/products/server";

export const metadata = {
  title: "Products",
  description: "Browse ready-to-use software projects and digital products.",
};

export const dynamic = "force-dynamic";

async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);
  if (products.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-subheading">Featured products</h2>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function SearchBarSkeleton() {
  return <Skeleton className="h-10 w-full sm:max-w-md" />;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="page-container py-6 sm:py-8">
      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h1 className="page-title shrink-0">Products</h1>
          <div className="w-full sm:max-w-md sm:shrink-0">
            <Suspense fallback={<SearchBarSkeleton />}>
              <ProductsSearchBar />
            </Suspense>
          </div>
        </div>
        <p className="page-description mt-2">
          {q?.trim()
            ? `Showing results for "${q.trim()}"`
            : "Discover SaaS applications, templates, AI tools, and more."}
        </p>
      </header>

      {!q?.trim() && (
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      )}

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductsCatalog />
      </Suspense>
    </div>
  );
}
