import { slugifyProductName } from "@/lib/products/utils";

const UNSAFE_KEY_PATTERN = /\.\.|\/\/|^\/|\/$/;

/**
 * Sanitizes a filename for use in an R2 object key.
 * Only allows .zip files with safe characters.
 */
export function sanitizeProductFileName(fileName: string): string {
  const baseName = fileName.split(/[/\\]/).pop() ?? fileName;
  const cleaned = baseName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleaned.toLowerCase().endsWith(".zip")) {
    throw new Error("INVALID_FILE_EXTENSION");
  }

  if (!cleaned || cleaned === ".zip") {
    throw new Error("INVALID_FILE_NAME");
  }

  return cleaned;
}

/**
 * Builds a predictable R2 object key: products/{slug}/{filename}
 */
export function buildProductObjectKey(slug: string, fileName: string): string {
  const safeSlug = slugifyProductName(slug);
  if (!safeSlug) {
    throw new Error("INVALID_SLUG");
  }

  const safeFileName = sanitizeProductFileName(fileName);
  const objectKey = `products/${safeSlug}/${safeFileName}`;

  if (UNSAFE_KEY_PATTERN.test(objectKey)) {
    throw new Error("INVALID_OBJECT_KEY");
  }

  return objectKey;
}

/**
 * Builds a versioned filename for replacement uploads.
 */
export function buildVersionedFileName(slug: string, version: string): string {
  const safeSlug = slugifyProductName(slug);
  const safeVersion = version
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
  return `${safeSlug}-v${safeVersion}.zip`;
}

export function isValidProductObjectKey(objectKey: string): boolean {
  if (!objectKey || UNSAFE_KEY_PATTERN.test(objectKey)) return false;
  return /^products\/[a-z0-9-]+\/[a-zA-Z0-9._-]+\.zip$/.test(objectKey);
}
