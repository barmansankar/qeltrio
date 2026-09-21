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
        "inline-flex h-10 items-center gap-2.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-zinc-500 transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] hover:text-zinc-300 focus-ring sm:min-w-[220px] lg:min-w-[300px]",
        className
      )}
      aria-label="Search products"
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="hidden flex-1 truncate text-left sm:inline">Search products</span>
      {showShortcut && (
        <kbd className="ml-auto hidden rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] text-zinc-600 lg:inline">
          ⌘K
        </kbd>
      )}
    </button>
  );
}
