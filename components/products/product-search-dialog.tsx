"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Package, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductSearchResultItem } from "@/lib/products/types";

interface ProductSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ProductSearchDialog({ open, onClose }: ProductSearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const search = useCallback(async (value: string) => {
    setLoading(true);
    try {
      const params = value.trim() ? `?q=${encodeURIComponent(value.trim())}` : "";
      const response = await fetch(`/api/products${params}`);
      if (!response.ok) return;
      const data = (await response.json()) as {
        products: Array<{
          id: string;
          name: string;
          slug: string;
          shortDescription: string;
          category: string;
        }>;
      };
      setResults(
        data.products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          category: product.category,
        }))
      );
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      return;
    }

    inputRef.current?.focus();
    void search("");
  }, [open, search]);

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      void search(query);
    }, 150);

    return () => clearTimeout(timeout);
  }, [query, open, search]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const selected = results[activeIndex];
        if (selected) {
          router.push(`/products/${selected.slug}`);
          onClose();
          return;
        }

        if (query.trim()) {
          router.push(`/products?q=${encodeURIComponent(query.trim())}`);
          onClose();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, activeIndex, query, router, onClose]);

  if (!open) return null;

  const showViewAll = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close search"
      />

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-xl shadow-black/40"
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, categories, technologies..."
            className="h-12 flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            autoComplete="off"
            aria-label="Search products"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 focus-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[min(50vh,360px)] overflow-y-auto p-2">
          {loading && results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">
              {query.trim() ? "No products match your search." : "Start typing to search products."}
            </p>
          ) : (
            <ul role="listbox" aria-label="Search results">
              {results.map((product, index) => (
                <li key={product.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      router.push(`/products/${product.slug}`);
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors focus-ring",
                      index === activeIndex
                        ? "bg-white/[0.06] text-zinc-100"
                        : "text-zinc-400 hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-zinc-500">
                      <Package className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-100">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-500">
                        {product.category} · {product.shortDescription}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showViewAll && (
          <div className="border-t border-[var(--border)] p-2">
            <button
              type="button"
              onClick={() => {
                router.push(`/products?q=${encodeURIComponent(query.trim())}`);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 focus-ring"
            >
              View all results for &ldquo;{query.trim()}&rdquo;
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="hidden border-t border-[var(--border)] px-4 py-2 text-[11px] text-zinc-600 sm:flex sm:items-center sm:gap-4">
          <span>
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5">↑↓</kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5">↵</kbd>{" "}
            open
          </span>
          <span>
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5">esc</kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}
