import type { Product } from "@/types/product";
import type { ProductSearchResultItem } from "@/lib/products/types";

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function filterProducts<T extends Product>(products: T[], query: string): T[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return products;

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.shortDescription,
      product.description,
      product.category,
      ...product.technologies,
      ...product.searchKeywords,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function toSearchResults(products: Product[]): ProductSearchResultItem[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    category: product.category,
  }));
}

/** @deprecated Use ProductSearchResultItem */
export type ProductSearchResult = ProductSearchResultItem;
