import type { ProductStatus } from "@/types";

/**
 * Core product catalog entity stored in Firestore (`products` collection).
 * Ratings are stored separately in `product_rating_summary`.
 */
export interface Product {
  id: string;
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
  views: number;
  downloads: number;
  purchases: number;
  /** Cloudflare R2 object key (Phase 7). Never store public download URLs. */
  r2ObjectKey?: string;
  /** Future Lemon Squeezy integration (Phase 6). */
  lemonSqueezyVariantId?: string;
  /** Lowercase tokens for basic Firestore-friendly search filtering. */
  searchKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRatings {
  rating: number;
  ratingCount: number;
}

export type ProductWithRatings = Product & ProductRatings;

export interface ProductDetailView extends ProductWithRatings {
  licenseAgreement: string;
}

export interface PaginatedProducts<T = Product> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
