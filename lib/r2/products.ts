import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  PRODUCT_ZIP_CONTENT_TYPE,
  R2_UPLOAD_URL_EXPIRATION_SECONDS,
} from "@/constants/product-files";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";
import {
  buildProductObjectKey,
  isValidProductObjectKey,
} from "@/lib/r2/object-keys";
import { createPrepareUploadToken } from "@/lib/r2/upload-token";
import { validateProductFile } from "@/lib/r2/validation";
import { hasZipSignature } from "@/lib/r2/zip-signature";

export interface CreateProductUploadUrlInput {
  slug: string;
  fileName: string;
  fileSize: number;
  contentType?: string;
  productId?: string;
}

export interface CreateProductUploadUrlResult {
  uploadUrl: string;
  objectKey: string;
  prepareToken: string;
  expiresIn: number;
}

export interface ProductObjectMetadata {
  objectKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  lastModified?: Date;
}

export interface VerifyUploadedProductResult {
  valid: boolean;
  error?: "NOT_FOUND" | "SIZE_MISMATCH" | "INVALID_ZIP_SIGNATURE";
}

async function readObjectPrefix(
  objectKey: string,
  length = 4
): Promise<Uint8Array | null> {
  const { bucketName } = getR2Config();
  const client = getR2Client();

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Range: `bytes=0-${length - 1}`,
      })
    );

    if (!response.Body) return null;

    const bytes = await response.Body.transformToByteArray();
    return bytes;
  } catch {
    return null;
  }
}

export async function createProductUploadUrl(
  input: CreateProductUploadUrlInput
): Promise<CreateProductUploadUrlResult> {
  const validation = validateProductFile({
    fileName: input.fileName,
    fileSize: input.fileSize,
    contentType: input.contentType,
  });

  if (!validation.valid) {
    throw new Error(validation.error ?? "INVALID_FILE");
  }

  const contentType = PRODUCT_ZIP_CONTENT_TYPE;
  const objectKey = buildProductObjectKey(input.slug, input.fileName);
  const { bucketName } = getR2Config();
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: input.fileSize,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: R2_UPLOAD_URL_EXPIRATION_SECONDS,
  });

  const prepareToken = createPrepareUploadToken({
    objectKey,
    fileName: input.fileName,
    fileSize: input.fileSize,
    contentType,
    slug: input.slug,
    productId: input.productId,
  });

  return {
    uploadUrl,
    objectKey,
    prepareToken,
    expiresIn: R2_UPLOAD_URL_EXPIRATION_SECONDS,
  };
}

export async function getProductObjectMetadata(
  objectKey: string
): Promise<ProductObjectMetadata | null> {
  if (!isValidProductObjectKey(objectKey)) {
    throw new Error("INVALID_OBJECT_KEY");
  }

  const { bucketName } = getR2Config();
  const client = getR2Client();

  try {
    const response = await client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    return {
      objectKey,
      fileName: objectKey.split("/").pop() ?? objectKey,
      fileSize: response.ContentLength ?? 0,
      contentType: response.ContentType ?? PRODUCT_ZIP_CONTENT_TYPE,
      lastModified: response.LastModified,
    };
  } catch {
    return null;
  }
}

export async function objectExists(objectKey: string): Promise<boolean> {
  const metadata = await getProductObjectMetadata(objectKey);
  return metadata !== null;
}

export async function deleteProductObject(objectKey: string): Promise<void> {
  if (!isValidProductObjectKey(objectKey)) {
    throw new Error("INVALID_OBJECT_KEY");
  }

  const { bucketName } = getR2Config();
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    })
  );
}

export async function verifyUploadedProductZip(
  objectKey: string,
  expectedSize: number
): Promise<VerifyUploadedProductResult> {
  const metadata = await getProductObjectMetadata(objectKey);
  if (!metadata) {
    return { valid: false, error: "NOT_FOUND" };
  }

  if (metadata.fileSize !== expectedSize) {
    return { valid: false, error: "SIZE_MISMATCH" };
  }

  const prefix = await readObjectPrefix(objectKey, 4);
  if (!prefix || !hasZipSignature(prefix)) {
    return { valid: false, error: "INVALID_ZIP_SIGNATURE" };
  }

  return { valid: true };
}

/** @deprecated Use verifyUploadedProductZip */
export async function verifyUploadedObject(
  objectKey: string,
  expectedSize: number
): Promise<boolean> {
  const result = await verifyUploadedProductZip(objectKey, expectedSize);
  return result.valid;
}

/**
 * Server-only: generates a short-lived download URL for future purchase flow.
 * Not exposed to customers in this phase.
 */
export async function createProductDownloadUrl(
  objectKey: string,
  expiresIn = 300
): Promise<string> {
  if (!isValidProductObjectKey(objectKey)) {
    throw new Error("INVALID_OBJECT_KEY");
  }

  const { bucketName } = getR2Config();
  const client = getR2Client();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    }),
    { expiresIn }
  );
}
