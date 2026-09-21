"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { PRODUCT_SORT_OPTIONS, type ProductSortOption } from "@/constants/products";

export function ProductSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = (searchParams.get("sort") as ProductSortOption) ?? "newest";

  function handleChange(value: ProductSortOption) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "newest") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    params.delete("q");
    const queryString = params.toString();
    router.replace(queryString ? `/products?${queryString}` : "/products", {
      scroll: false,
    });
  }

  return (
    <label className="flex w-full items-center gap-2 text-sm text-zinc-500">
      <span className="shrink-0">Sort by</span>
      <div className="relative w-full">
        <select
          value={sort}
          onChange={(event) => handleChange(event.target.value as ProductSortOption)}
          className="h-10 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 pr-8 text-sm text-zinc-200 focus-ring"
          aria-label="Sort products"
        >
          {PRODUCT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />
      </div>
    </label>
  );
}
