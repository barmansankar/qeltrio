import "server-only";

import {
  getProductRatingSummaries,
  getProductRatingSummary,
} from "@/lib/ratings/server";
import {
  assertPublishable,
  cleanupOrphanedUpload,
  deleteProductR2File,
  replaceProductR2File,
  resolveR2MetadataForSave,
} from "@/lib/products/r2-metadata";
import { firestoreProductRepository } from "@/lib/products/repository";
import { buildLicenseAgreement, stripInternalProductFields } from "@/lib/products/utils";
import type {
  ProductCreateInput,
  ProductListQuery,
  ProductR2Metadata,
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

function stripUploadToken<T extends ProductCreateInput | ProductUpdateInput>(
  input: T
): Omit<T, "r2UploadToken"> {
  const { r2UploadToken: _token, ...rest } = input;
  return rest;
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
      items: (await enrichWithRatings(result.items)).map(stripInternalProductFields),
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
      ...stripInternalProductFields(withRatings),
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

    const existing = null;
    let r2Metadata: ProductR2Metadata & { previousObjectKey?: string };

    try {
      r2Metadata = await resolveR2MetadataForSave({
        slug: input.slug,
        status: input.status,
        r2UploadToken: input.r2UploadToken,
        existingProduct: existing,
      });
    } catch (error) {
      throw error;
    }

    const productInput = stripUploadToken(input);

    if (productInput.status === "published") {
      assertPublishable({
        id: "",
        ...productInput,
        ...r2Metadata,
        views: 0,
        downloads: 0,
        purchases: 0,
        searchKeywords: [],
        createdAt: "",
        updatedAt: "",
      } as Product);
    }

    const { previousObjectKey: _prev, ...r2Fields } = r2Metadata;

    try {
      const product = await this.repository.create(productInput, r2Fields);
      return product;
    } catch (error) {
      if (r2Fields.r2ObjectKey && input.r2UploadToken) {
        await cleanupOrphanedUpload(r2Fields.r2ObjectKey);
      }
      throw error;
    }
  }

  async update(id: string, input: ProductUpdateInput): Promise<Product> {
    if (input.slug && (await this.repository.slugExists(input.slug, id))) {
      throw new Error("SLUG_EXISTS");
    }

    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const slug = input.slug ?? existing.slug;
    const status = input.status ?? existing.status;

    let r2Metadata: ProductR2Metadata & { previousObjectKey?: string };

    try {
      r2Metadata = await resolveR2MetadataForSave({
        slug,
        status,
        r2UploadToken: input.r2UploadToken,
        existingProduct: existing,
      });
    } catch (error) {
      throw error;
    }

    const productInput = stripUploadToken(input);
    const mergedForValidation = { ...existing, ...productInput, ...r2Metadata };

    if (mergedForValidation.status === "published") {
      assertPublishable(mergedForValidation);
    }

    const previousObjectKey = r2Metadata.previousObjectKey;
    const newObjectKey = input.r2UploadToken ? r2Metadata.r2ObjectKey : undefined;
    const { previousObjectKey: _prev, ...r2Fields } = r2Metadata;

    try {
      const product = await this.repository.update(id, productInput, r2Fields);

      if (previousObjectKey && newObjectKey) {
        await replaceProductR2File(previousObjectKey);
      }

      return product;
    } catch (error) {
      if (newObjectKey && input.r2UploadToken) {
        await cleanupOrphanedUpload(newObjectKey, {
          protectObjectKeys: [existing.r2ObjectKey ?? ""],
        });
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const product = await this.repository.getById(id);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    await this.repository.delete(id);
    await deleteProductR2File(product);
  }

  async publish(id: string): Promise<Product> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    assertPublishable(existing);
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
