/** Maximum ZIP file size in bytes (500 MB). Adjust here only. */
export const MAX_PRODUCT_FILE_SIZE = 500 * 1024 * 1024;

export const ALLOWED_PRODUCT_FILE_EXTENSION = ".zip";

export const ALLOWED_PRODUCT_CONTENT_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
] as const;

/** Content-Type used for presigned R2 uploads (must match browser PUT header). */
export const PRODUCT_ZIP_CONTENT_TYPE = "application/zip";

/** When true, publishing a product requires an uploaded software ZIP. */
export const REQUIRE_ZIP_FOR_PUBLISH = true;

/** Presigned upload URL lifetime in seconds (short-lived). */
export const R2_UPLOAD_URL_EXPIRATION_SECONDS = 900;

/** @deprecated Use R2_UPLOAD_URL_EXPIRATION_SECONDS */
export const R2_UPLOAD_URL_EXPIRY_SECONDS = R2_UPLOAD_URL_EXPIRATION_SECONDS;

/** How long a completed upload token remains valid for product save (seconds). */
export const R2_UPLOAD_TOKEN_EXPIRY_SECONDS = 24 * 60 * 60;
