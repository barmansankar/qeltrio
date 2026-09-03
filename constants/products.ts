export const PRODUCTS_PAGE_SIZE = 12;

export const PRODUCT_SEARCH_SCAN_LIMIT = 200;

export const PRODUCT_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "popular", label: "Most Popular" },
  { value: "downloads", label: "Most Downloaded" },
] as const;

export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];
