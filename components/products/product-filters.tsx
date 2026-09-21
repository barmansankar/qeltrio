"use client";

import { PRODUCT_CATEGORIES } from "@/constants/product-categories";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  category: string;
  onCategoryChange: (value: string) => void;
  className?: string;
}

export function ProductFilters({
  category,
  onCategoryChange,
  className,
}: ProductFiltersProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
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
