"use client";

import { Search } from "lucide-react";
import { useProductSearch } from "@/components/products/product-search-provider";
import { cn } from "@/lib/utils";

interface ProductSearchTriggerProps {
  className?: string;
  showShortcut?: boolean;
}

export function ProductSearchTrigger({
  className,
  showShortcut = true,
}: ProductSearchTriggerProps) {
  const { openSearch } = useProductSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-[var(--border-hover)] hover:text-zinc-300 focus-ring",
        className
      )}
      aria-label="Search products"
    >
      <Search className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden lg:inline">Search products</span>
      {showShortcut && (
        <kbd className="hidden rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] text-zinc-600 lg:inline">
          ⌘K
        </kbd>
      )}
    </button>
  );
}
