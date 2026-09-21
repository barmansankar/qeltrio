"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
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

interface CatalogQuery {
  category: string;
  sort: ProductSortOption;
}

interface ProductsCatalogProps {
  initialData: CatalogResponse;
  initialQuery: CatalogQuery;
}

function buildQueryKey(query: CatalogQuery) {
  return `${query.category}|${query.sort}`;
}

export function ProductsCatalog({
  initialData,
  initialQuery,
}: ProductsCatalogProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const initialQueryKey = useRef(buildQueryKey(initialQuery));

  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") as ProductSortOption) ?? "newest";
  const queryKey = buildQueryKey({ category, sort });

  const [products, setProducts] = useState(initialData.products);
  const [nextCursor, setNextCursor] = useState(initialData.nextCursor);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (cursor?: string, append = false) => {
      const params = new URLSearchParams();
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
    [category, sort]
  );

  useEffect(() => {
    if (queryKey === initialQueryKey.current) {
      return;
    }

    setLoading(true);
    setError(null);
    startTransition(() => {
      fetchProducts()
        .catch(() => setError("Unable to load products. Please try again."))
        .finally(() => setLoading(false));
    });
  }, [fetchProducts, queryKey]);

  if (loading && products.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {Array.from({ length: PRODUCTS_PAGE_SIZE }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
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
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            category
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
