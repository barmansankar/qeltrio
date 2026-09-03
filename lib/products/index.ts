export type {
  Product,
  ProductDetailView,
  ProductRatings,
  ProductWithRatings,
  PaginatedProducts,
} from "@/types/product";

export type {
  ProductCreateInput,
  ProductFormInput,
  ProductListQuery,
  ProductSearchResultItem,
  ProductUpdateInput,
} from "@/lib/products/types";

export {
  buildLicenseAgreement,
  buildSearchKeywords,
  getProductPlaceholderGradient,
  productFromFirestore,
  productToFirestore,
  slugifyProductName,
} from "@/lib/products/utils";

export {
  filterProducts,
  normalizeSearchQuery,
  toSearchResults,
} from "@/lib/products/search";

export {
  parseProductFormInput,
  formatZodErrors,
  productFormSchema,
} from "@/lib/products/validation";

export type { ProductFormValues } from "@/lib/products/validation";
