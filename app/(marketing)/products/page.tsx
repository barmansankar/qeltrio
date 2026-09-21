import { Suspense } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductsCatalog } from "@/components/products/products-catalog";
import { ProductsPageControls } from "@/components/products/products-page-controls";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { PRODUCTS_PAGE_SIZE } from "@/constants/products";
import type { ProductSortOption } from "@/constants/products";
import { getFeaturedProducts, getProducts } from "@/lib/products/server";

export const metadata = {
  title: "Products",
  description: "Browse ready-to-use software projects and digital products.",
};

export const revalidate = 60;

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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "";
  const sort = (params.sort as ProductSortOption) ?? "newest";

  const initialCatalog = await getProducts({
    category: category || undefined,
    sort,
    limit: PRODUCTS_PAGE_SIZE,
  });

  return (
    <div className="page-container py-6 sm:py-8">
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="shrink-0">
            <h1 className="page-title">Products</h1>
            <p className="page-description mt-2">
              Discover SaaS applications, templates, AI tools, and more.
            </p>
          </div>
          <div className="w-full sm:max-w-2xl sm:shrink-0 lg:max-w-3xl">
            <ProductsPageControls />
          </div>
        </div>
      </header>

      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      <ProductsCatalog
        initialData={{
          products: initialCatalog.items,
          nextCursor: initialCatalog.nextCursor,
          hasMore: initialCatalog.hasMore,
        }}
        initialQuery={{ category, sort }}
      />
    </div>
  );
}
