"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSortSelect } from "@/components/products/product-sort-select";
import { Skeleton } from "@/components/ui/skeleton";

function ProductsPageControlsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("q");
    const queryString = params.toString();
    router.replace(queryString ? `/products?${queryString}` : "/products", {
      scroll: false,
    });
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:items-end">
      <ProductFilters
        category={category}
        onCategoryChange={(value) => updateParam("category", value)}
        className="justify-end"
      />
      <div className="w-full sm:ml-auto sm:max-w-xs">
        <ProductSortSelect />
      </div>
    </div>
  );
}

function ControlsSkeleton() {
  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:items-end">
      <div className="flex flex-wrap justify-end gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-md sm:max-w-xs" />
    </div>
  );
}

export function ProductsPageControls() {
  return (
    <Suspense fallback={<ControlsSkeleton />}>
      <ProductsPageControlsContent />
    </Suspense>
  );
}
