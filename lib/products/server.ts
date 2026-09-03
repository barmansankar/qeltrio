import "server-only";

import { cache } from "react";
import { getProductService } from "@/lib/products/service";
import type { ProductListQuery } from "@/lib/products/types";
import type {
  PaginatedProducts,
  Product,
  ProductDetailView,
  ProductWithRatings,
} from "@/types/product";

export { getProductService, productService } from "@/lib/products/service";
export { firestoreProductRepository } from "@/lib/products/repository";

const listPublished = cache(async (query?: ProductListQuery) =>
  getProductService().listPublished(query)
);

const getBySlug = cache(async (slug: string) =>
  getProductService().getBySlug(slug)
);

const getById = cache(async (id: string) => getProductService().getById(id));

export async function getProducts(
  query?: ProductListQuery
): Promise<PaginatedProducts<ProductWithRatings>> {
  return listPublished(query);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetailView | null> {
  return getBySlug(slug);
}

export async function getProductById(
  id: string
): Promise<ProductWithRatings | null> {
  return getById(id);
}

export async function getFeaturedProducts(
  limit = 4
): Promise<ProductWithRatings[]> {
  const result = await listPublished({
    featured: true,
    limit,
    sort: "popular",
  });
  return result.items;
}

export async function getPopularProducts(
  limit = 4
): Promise<ProductWithRatings[]> {
  const result = await listPublished({
    limit,
    sort: "popular",
  });
  return result.items;
}

export async function getAdminProducts(
  query?: ProductListQuery
): Promise<PaginatedProducts<Product>> {
  return getProductService().listAdmin(query);
}
