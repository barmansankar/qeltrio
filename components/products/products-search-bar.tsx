"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ProductsSearchBarProps {
  className?: string;
}

export function ProductsSearchBar({ className }: ProductsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setValue(queryFromUrl);
  }, [mounted, queryFromUrl]);

  useEffect(() => {
    if (!mounted) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();

      if (trimmed) {
        if (params.get("q") === trimmed) return;
        params.set("q", trimmed);
      } else if (!params.has("q")) {
        return;
      } else {
        params.delete("q");
      }

      const queryString = params.toString();
      router.replace(queryString ? `/products?${queryString}` : "/products", {
        scroll: false,
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [mounted, value, router, searchParams]);

  function handleClear() {
    setValue("");
  }

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      />
      <Input
        type="text"
        inputMode="search"
        enterKeyHint="search"
        value={mounted ? value : queryFromUrl}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by name, category, or technology..."
        className="h-10 pl-9 pr-9"
        aria-label="Search products"
      />
      {mounted && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 focus-ring"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
