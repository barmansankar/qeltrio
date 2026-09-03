import type { ProductSortOption } from "@/constants/products";
import type { ProductStatus } from "@/types";
import type { Product, PaginatedProducts } from "@/types/product";

export const PRODUCTS_COLLECTION = "products";

export interface ProductListQuery {
  status?: ProductStatus | ProductStatus[];
  category?: string;
  featured?: boolean;
  search?: string;
  sort?: ProductSortOption;
  limit?: number;
  cursor?: string;
  /** Admin-only: include all statuses when true */
  admin?: boolean;
}

export interface ProductFormInput {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  thumbnailUrl: string;
  screenshots: string[];
  technologies: string[];
  features: string[];
  version: string;
  requirements: string;
  demoUrl?: string;
  documentationUrl?: string;
  status: ProductStatus;
  featured: boolean;
  r2ObjectKey?: string;
  lemonSqueezyVariantId?: string;
}

export type ProductCreateInput = ProductFormInput;
export type ProductUpdateInput = Partial<ProductFormInput>;

export interface ProductRepository {
  list(query?: ProductListQuery): Promise<PaginatedProducts>;
  getById(id: string): Promise<Product | null>;
  getBySlug(slug: string, options?: { includeUnpublished?: boolean }): Promise<Product | null>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  create(input: ProductCreateInput): Promise<Product>;
  update(id: string, input: ProductUpdateInput): Promise<Product>;
  delete(id: string): Promise<void>;
  publish(id: string): Promise<Product>;
  archive(id: string): Promise<Product>;
}

export interface ProductSearchResultItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  category: string;
}
