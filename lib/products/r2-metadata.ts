import "server-only";

import { REQUIRE_ZIP_FOR_PUBLISH } from "@/constants/product-files";
import { isR2Configured } from "@/lib/r2/config";
import {
  deleteProductObject,
  verifyUploadedProductZip,
} from "@/lib/r2/products";
import { isValidProductObjectKey } from "@/lib/r2/object-keys";
import { verifyUploadToken } from "@/lib/r2/upload-token";
import type { ProductR2Metadata } from "@/lib/products/types";
import type { Product } from "@/types/product";

export interface ResolvedR2Metadata extends ProductR2Metadata {
  previousObjectKey?: string;
}

export async function resolveR2MetadataForSave(input: {
  slug: string;
  status: string;
  r2UploadToken?: string;
  existingProduct?: Product | null;
}): Promise<ResolvedR2Metadata> {
  const existing = input.existingProduct;

  if (!input.r2UploadToken) {
    if (input.status === "published" && REQUIRE_ZIP_FOR_PUBLISH) {
      if (!existing?.r2ObjectKey || existing.r2UploadStatus !== "uploaded") {
        throw new Error("ZIP_REQUIRED_FOR_PUBLISH");
      }
    }
    return {
      r2ObjectKey: existing?.r2ObjectKey,
      r2FileName: existing?.r2FileName,
      r2FileSize: existing?.r2FileSize,
      r2ContentType: existing?.r2ContentType,
      r2UploadedAt: existing?.r2UploadedAt,
      r2UploadStatus: existing?.r2UploadStatus ?? "none",
    };
  }

  if (!isR2Configured()) {
    throw new Error("R2_NOT_CONFIGURED");
  }

  const tokenPayload = verifyUploadToken(input.r2UploadToken);
  if (!tokenPayload) {
    throw new Error("INVALID_UPLOAD_TOKEN");
  }

  if (tokenPayload.slug !== input.slug) {
    throw new Error("UPLOAD_SLUG_MISMATCH");
  }

  if (
    input.existingProduct &&
    tokenPayload.productId &&
    tokenPayload.productId !== input.existingProduct.id
  ) {
    throw new Error("UPLOAD_PRODUCT_MISMATCH");
  }

  if (!isValidProductObjectKey(tokenPayload.objectKey)) {
    throw new Error("INVALID_OBJECT_KEY");
  }

  const verified = await verifyUploadedProductZip(
    tokenPayload.objectKey,
    tokenPayload.fileSize
  );

  if (!verified.valid) {
    throw new Error("UPLOAD_NOT_FOUND");
  }

  const previousObjectKey =
    existing?.r2ObjectKey && existing.r2ObjectKey !== tokenPayload.objectKey
      ? existing.r2ObjectKey
      : undefined;

  return {
    r2ObjectKey: tokenPayload.objectKey,
    r2FileName: tokenPayload.fileName,
    r2FileSize: tokenPayload.fileSize,
    r2ContentType: tokenPayload.contentType,
    r2UploadedAt: new Date().toISOString(),
    r2UploadStatus: "uploaded",
    previousObjectKey,
  };
}

export async function cleanupOrphanedUpload(
  objectKey: string,
  options?: { protectObjectKeys?: string[] }
): Promise<void> {
  if (!isR2Configured() || !isValidProductObjectKey(objectKey)) return;

  const protectedKeys = new Set(
    (options?.protectObjectKeys ?? []).filter(Boolean)
  );

  if (protectedKeys.has(objectKey)) {
    console.warn(
      "[r2] Skipped orphan cleanup for protected production object:",
      objectKey
    );
    return;
  }

  try {
    await deleteProductObject(objectKey);
  } catch (error) {
    console.error("[r2] Failed to cleanup orphaned upload:", objectKey, error);
  }
}

export async function deleteProductR2File(product: Product): Promise<void> {
  if (!product.r2ObjectKey || !isR2Configured()) return;

  try {
    await deleteProductObject(product.r2ObjectKey);
  } catch (error) {
    console.error(
      "[r2] Failed to delete product file:",
      product.r2ObjectKey,
      error
    );
  }
}

export async function replaceProductR2File(
  previousObjectKey: string | undefined
): Promise<void> {
  if (!previousObjectKey || !isR2Configured()) return;

  try {
    await deleteProductObject(previousObjectKey);
  } catch (error) {
    console.error(
      "[r2] Failed to delete replaced product file:",
      previousObjectKey,
      error
    );
  }
}

export function assertPublishable(product: Product): void {
  if (!REQUIRE_ZIP_FOR_PUBLISH) return;

  if (!product.r2ObjectKey || product.r2UploadStatus !== "uploaded") {
    throw new Error("ZIP_REQUIRED_FOR_PUBLISH");
  }
}
