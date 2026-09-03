"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PRODUCTS_PAGE_SIZE } from "@/constants/products";
import type { ProductSortOption } from "@/constants/products";
import type { ProductWithRatings } from "@/types/product";
import { Package } from "lucide-react";

interface CatalogResponse {
  products: ProductWithRatings[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function ProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") as ProductSortOption) ?? "newest";

  const [products, setProducts] = useState<ProductWithRatings[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (cursor?: string, append = false) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      params.set("limit", String(PRODUCTS_PAGE_SIZE));
      if (cursor) params.set("cursor", cursor);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Unable to load products.");
      }

      const data = (await response.json()) as CatalogResponse;
      setProducts((current) =>
        append ? [...current, ...data.products] : data.products
      );
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    },
    [q, category, sort]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    startTransition(() => {
      fetchProducts()
        .catch(() => setError("Unable to load products. Please try again."))
        .finally(() => setLoading(false));
    });
  }, [fetchProducts]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <ProductFilters
          category={category}
          sort={sort}
          onCategoryChange={(value) => updateParam("category", value)}
          onSortChange={(value) => updateParam("sort", value)}
        />
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {Array.from({ length: PRODUCTS_PAGE_SIZE }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Package}
        title="Unable to load products"
        description={error}
        action={{
          label: "Try again",
          onClick: () => {
            setLoading(true);
            fetchProducts()
              .catch(() => setError("Unable to load products. Please try again."))
              .finally(() => setLoading(false));
          },
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProductFilters
        category={category}
        sort={sort}
        onCategoryChange={(value) => updateParam("category", value)}
        onSortChange={(value) => updateParam("sort", value)}
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            q.trim()
              ? `No products match your search for "${q.trim()}".`
              : category
                ? `No products in the ${category} category yet.`
                : "No products are available right now."
          }
          action={{ label: "Clear filters", href: "/products" }}
        />
      ) : (
        <>
          <ProductGrid products={products} />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                size="md"
                disabled={isPending}
                onClick={() => {
                  if (!nextCursor) return;
                  startTransition(() => {
                    fetchProducts(nextCursor, true).catch(() =>
                      setError("Unable to load more products.")
                    );
                  });
                }}
              >
                {isPending ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
