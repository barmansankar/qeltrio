import "server-only";

import { Timestamp, type Query } from "firebase-admin/firestore";
import { PRODUCT_SEARCH_SCAN_LIMIT, PRODUCTS_PAGE_SIZE } from "@/constants/products";
import type { ProductSortOption } from "@/constants/products";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  buildSearchKeywords,
  productFromFirestore,
  productToFirestore,
  slugifyProductName,
} from "@/lib/products/utils";
import type {
  ProductCreateInput,
  ProductListQuery,
  ProductRepository,
  ProductUpdateInput,
} from "@/lib/products/types";
import { PRODUCTS_COLLECTION } from "@/lib/products/types";
import { filterProducts } from "@/lib/products/search";
import type { PaginatedProducts, Product } from "@/types/product";
import type { ProductStatus } from "@/types";

function getSortConfig(sort: ProductSortOption = "newest") {
  switch (sort) {
    case "oldest":
      return { field: "createdAt", direction: "asc" as const };
    case "price-asc":
      return { field: "price", direction: "asc" as const };
    case "price-desc":
      return { field: "price", direction: "desc" as const };
    case "popular":
      return { field: "purchases", direction: "desc" as const };
    case "downloads":
      return { field: "downloads", direction: "desc" as const };
    case "newest":
    default:
      return { field: "createdAt", direction: "desc" as const };
  }
}

function encodeCursor(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  sortField: string
): string {
  const sortValue = doc.get(sortField);
  const serialized =
    sortValue && typeof sortValue === "object" && "toMillis" in sortValue
      ? (sortValue as { toMillis: () => number }).toMillis()
      : sortValue;

  return Buffer.from(
    JSON.stringify({
      id: doc.id,
      sortField,
      sortValue: serialized ?? 0,
    })
  ).toString("base64url");
}

function decodeCursor(cursor: string): { id: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      id: string;
    };
    return parsed.id ? { id: parsed.id } : null;
  } catch {
    return null;
  }
}

function applyStatusFilter(
  query: Query,
  status?: ProductStatus | ProductStatus[],
  admin = false
) {
  if (admin && !status) return query;
  if (!status) {
    return query.where("status", "==", "published");
  }
  if (Array.isArray(status)) {
    if (status.length === 1) return query.where("status", "==", status[0]);
    return query.where("status", "in", status.slice(0, 10));
  }
  return query.where("status", "==", status);
}

export class FirestoreProductRepository implements ProductRepository {
  async list(query: ProductListQuery = {}): Promise<PaginatedProducts> {
    const db = getAdminFirestore();
    const limit = query.limit ?? PRODUCTS_PAGE_SIZE;
    const sort = getSortConfig(query.sort);
    const admin = query.admin ?? false;

    if (query.search?.trim()) {
      return this.listWithSearch(query, limit, admin);
    }

    let firestoreQuery: Query = db.collection(PRODUCTS_COLLECTION);
    firestoreQuery = applyStatusFilter(firestoreQuery, query.status, admin);

    if (query.category) {
      firestoreQuery = firestoreQuery.where("category", "==", query.category);
    }

    if (query.featured !== undefined) {
      firestoreQuery = firestoreQuery.where("featured", "==", query.featured);
    }

    firestoreQuery = firestoreQuery.orderBy(sort.field, sort.direction);

    if (query.cursor) {
      const decoded = decodeCursor(query.cursor);
      if (decoded) {
        const cursorDoc = await db
          .collection(PRODUCTS_COLLECTION)
          .doc(decoded.id)
          .get();
        if (cursorDoc.exists) {
          firestoreQuery = firestoreQuery.startAfter(cursorDoc);
        }
      }
    }

    const snapshot = await firestoreQuery.limit(limit + 1).get();
    const docs = snapshot.docs;
    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;

    const items = pageDocs.map((doc) =>
      productFromFirestore(doc.id, doc.data() as Record<string, unknown>)
    );

    return {
      items,
      hasMore,
      nextCursor: hasMore
        ? encodeCursor(pageDocs[pageDocs.length - 1], sort.field)
        : null,
    };
  }

  private async listWithSearch(
    query: ProductListQuery,
    limit: number,
    admin: boolean
  ): Promise<PaginatedProducts> {
    const db = getAdminFirestore();
    let firestoreQuery: Query = db.collection(PRODUCTS_COLLECTION);
    firestoreQuery = applyStatusFilter(firestoreQuery, query.status, admin);

    if (query.category) {
      firestoreQuery = firestoreQuery.where("category", "==", query.category);
    }

    const snapshot = await firestoreQuery
      .orderBy("createdAt", "desc")
      .limit(PRODUCT_SEARCH_SCAN_LIMIT)
      .get();

    let items = snapshot.docs.map((doc) =>
      productFromFirestore(doc.id, doc.data() as Record<string, unknown>)
    );

    items = filterProducts(items, query.search ?? "");

    const offset = query.cursor ? Number(query.cursor) || 0 : 0;
    const pageItems = items.slice(offset, offset + limit);
    const nextOffset = offset + limit;
    const hasMore = nextOffset < items.length;

    return {
      items: pageItems,
      hasMore,
      nextCursor: hasMore ? String(nextOffset) : null,
    };
  }

  async getById(id: string): Promise<Product | null> {
    const db = getAdminFirestore();
    const snapshot = await db.collection(PRODUCTS_COLLECTION).doc(id).get();
    if (!snapshot.exists) return null;
    return productFromFirestore(
      snapshot.id,
      snapshot.data() as Record<string, unknown>
    );
  }

  async getBySlug(
    slug: string,
    options?: { includeUnpublished?: boolean }
  ): Promise<Product | null> {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection(PRODUCTS_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const product = productFromFirestore(
      doc.id,
      doc.data() as Record<string, unknown>
    );

    if (!options?.includeUnpublished && product.status !== "published") {
      return null;
    }

    return product;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection(PRODUCTS_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return false;
    if (excludeId && snapshot.docs[0].id === excludeId) return false;
    return true;
  }

  async create(input: ProductCreateInput): Promise<Product> {
    const db = getAdminFirestore();
    const slug = input.slug || slugifyProductName(input.name);
    const now = Timestamp.now();
    const ref = db.collection(PRODUCTS_COLLECTION).doc();

    const product: Omit<Product, "id"> = {
      name: input.name,
      slug,
      shortDescription: input.shortDescription,
      description: input.description,
      category: input.category,
      price: input.price,
      currency: input.currency,
      thumbnailUrl: input.thumbnailUrl,
      screenshots: input.screenshots,
      technologies: input.technologies,
      features: input.features,
      version: input.version,
      requirements: input.requirements,
      demoUrl: input.demoUrl,
      documentationUrl: input.documentationUrl,
      status: input.status,
      featured: input.featured && input.status === "published",
      views: 0,
      downloads: 0,
      purchases: 0,
      r2ObjectKey: input.r2ObjectKey || undefined,
      lemonSqueezyVariantId: input.lemonSqueezyVariantId || undefined,
      searchKeywords: buildSearchKeywords(input),
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };

    await ref.set({
      ...productToFirestore(product),
      createdAt: now,
      updatedAt: now,
    });

    return { id: ref.id, ...product };
  }

  async update(id: string, input: ProductUpdateInput): Promise<Product> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const db = getAdminFirestore();
    const now = Timestamp.now();
    const merged = {
      ...existing,
      ...input,
      featured:
        input.featured !== undefined
          ? input.featured && (input.status ?? existing.status) === "published"
          : existing.featured,
      updatedAt: now.toDate().toISOString(),
    };

    merged.searchKeywords = buildSearchKeywords(merged);

    const { views, downloads, purchases, createdAt, id: _id, ...writable } = merged;

    await db
      .collection(PRODUCTS_COLLECTION)
      .doc(id)
      .update({
        ...productToFirestore(writable as Omit<Product, "id">),
        views,
        downloads,
        purchases,
        updatedAt: now,
      });

    return merged;
  }

  async delete(id: string): Promise<void> {
    const db = getAdminFirestore();
    await db.collection(PRODUCTS_COLLECTION).doc(id).delete();
  }

  async publish(id: string): Promise<Product> {
    return this.update(id, { status: "published" });
  }

  async archive(id: string): Promise<Product> {
    return this.update(id, { status: "archived", featured: false });
  }
}

export const firestoreProductRepository = new FirestoreProductRepository();
