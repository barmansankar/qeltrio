/**
 * Firebase product data access layer (server-only).
 */
import "server-only";

export {
  firestoreProductRepository,
} from "@/lib/products/repository";

export {
  getProductService,
  productService,
  getProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  getAdminProducts,
} from "@/lib/products/server";

import { getProductService } from "@/lib/products/service";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/products/types";
import type { Product } from "@/types/product";

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  return getProductService().create(input);
}

export async function updateProduct(
  id: string,
  input: ProductUpdateInput
): Promise<Product> {
  return getProductService().update(id, input);
}

export async function deleteProduct(id: string): Promise<void> {
  return getProductService().delete(id);
}

export async function publishProduct(id: string): Promise<Product> {
  return getProductService().publish(id);
}

export async function archiveProduct(id: string): Promise<Product> {
  return getProductService().archive(id);
}

export async function slugExists(slug: string, excludeId?: string) {
  return getProductService().slugExists(slug, excludeId);
}
