"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ProductSearchDialog } from "@/components/products/product-search-dialog";

interface ProductSearchContextValue {
  openSearch: () => void;
  closeSearch: () => void;
}

const ProductSearchContext = createContext<ProductSearchContextValue | null>(null);

export function ProductSearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ProductSearchContext.Provider value={{ openSearch, closeSearch }}>
      {children}
      <ProductSearchDialog open={open} onClose={closeSearch} />
    </ProductSearchContext.Provider>
  );
}

export function useProductSearch() {
  const context = useContext(ProductSearchContext);
  if (!context) {
    throw new Error("useProductSearch must be used within ProductSearchProvider");
  }
  return context;
}
