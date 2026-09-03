import "server-only";

import {
  getProductRatingSummaries,
  getProductRatingSummary,
} from "@/lib/ratings/server";
import { firestoreProductRepository } from "@/lib/products/repository";
import { buildLicenseAgreement } from "@/lib/products/utils";
import type {
  ProductCreateInput,
  ProductListQuery,
  ProductUpdateInput,
} from "@/lib/products/types";
import type {
  PaginatedProducts,
  Product,
  ProductDetailView,
  ProductWithRatings,
} from "@/types/product";

function withRatingSummary(
  product: Product,
  summary?: { averageRating: number; ratingCount: number }
): ProductWithRatings {
  return {
    ...product,
    rating: summary?.ratingCount ? summary.averageRating : 0,
    ratingCount: summary?.ratingCount ?? 0,
  };
}

async function enrichWithRatings(
  products: Product[]
): Promise<ProductWithRatings[]> {
  if (products.length === 0) return [];
  const summaries = await getProductRatingSummaries(
    products.map((product) => product.id)
  );
  return products.map((product) =>
    withRatingSummary(product, summaries.get(product.id))
  );
}

export class ProductService {
  constructor(
    private readonly repository = firestoreProductRepository
  ) {}

  async listPublished(
    query?: ProductListQuery
  ): Promise<PaginatedProducts<ProductWithRatings>> {
    const result = await this.repository.list({
      status: "published",
      ...query,
    });
    return {
      ...result,
      items: await enrichWithRatings(result.items),
    };
  }

  async listAdmin(
    query?: ProductListQuery
  ): Promise<PaginatedProducts<Product>> {
    return this.repository.list({
      admin: true,
      sort: "newest",
      ...query,
    });
  }

  async getBySlug(slug: string): Promise<ProductDetailView | null> {
    const product = await this.repository.getBySlug(slug);
    if (!product) return null;

    const summary = await getProductRatingSummary(product.id, 0, 0);
    const withRatings = withRatingSummary(product, summary);

    return {
      ...withRatings,
      licenseAgreement: buildLicenseAgreement(product.name),
    };
  }

  async getById(id: string): Promise<ProductWithRatings | null> {
    const product = await this.repository.getById(id);
    if (!product) return null;

    const summary = await getProductRatingSummary(product.id, 0, 0);
    return withRatingSummary(product, summary);
  }

  async getByIdAdmin(id: string): Promise<Product | null> {
    return this.repository.getById(id);
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    return this.repository.slugExists(slug, excludeId);
  }

  async create(input: ProductCreateInput): Promise<Product> {
    if (await this.repository.slugExists(input.slug)) {
      throw new Error("SLUG_EXISTS");
    }
    return this.repository.create(input);
  }

  async update(id: string, input: ProductUpdateInput): Promise<Product> {
    if (input.slug && (await this.repository.slugExists(input.slug, id))) {
      throw new Error("SLUG_EXISTS");
    }
    return this.repository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async publish(id: string): Promise<Product> {
    return this.repository.publish(id);
  }

  async archive(id: string): Promise<Product> {
    return this.repository.archive(id);
  }

  async getCatalogIds(): Promise<Array<{ id: string; name: string }>> {
    const result = await this.repository.list({
      status: "published",
      limit: 100,
    });
    return result.items.map((product) => ({
      id: product.id,
      name: product.name,
    }));
  }
}

export const productService = new ProductService();

export function getProductService(): ProductService {
  return productService;
}
