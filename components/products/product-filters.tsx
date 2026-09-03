"use client";

import { PRODUCT_CATEGORIES } from "@/constants/product-categories";
import { PRODUCT_SORT_OPTIONS, type ProductSortOption } from "@/constants/products";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  category: string;
  sort: ProductSortOption;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: ProductSortOption) => void;
  className?: string;
}

export function ProductFilters({
  category,
  sort,
  onCategoryChange,
  onSortChange,
  className,
}: ProductFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={!category}
          onClick={() => onCategoryChange("")}
          label="All"
        />
        {PRODUCT_CATEGORIES.map((item) => (
          <FilterChip
            key={item}
            active={category === item}
            onClick={() => onCategoryChange(item)}
            label={item}
          />
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="shrink-0">Sort by</span>
        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as ProductSortOption)
          }
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-zinc-200 focus-ring"
          aria-label="Sort products"
        >
          {PRODUCT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm transition-colors focus-ring",
        active
          ? "border-zinc-500 bg-white/[0.06] text-zinc-100"
          : "border-[var(--border)] text-zinc-500 hover:border-[var(--border-hover)] hover:text-zinc-300"
      )}
    >
      {label}
    </button>
  );
}
