import {
  ALLOWED_PRODUCT_FILE_EXTENSION,
  MAX_PRODUCT_FILE_SIZE,
} from "@/constants/product-files";

const BLOCKED_EXTENSIONS = [
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".sh",
  ".apk",
  ".msi",
  ".dmg",
  ".app",
  ".jar",
  ".ps1",
  ".vbs",
  ".scr",
];

export interface ProductFileValidationInput {
  fileName: string;
  fileSize: number;
  contentType?: string;
}

export interface ProductFileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateProductFile(
  input: ProductFileValidationInput
): ProductFileValidationResult {
  const fileName = input.fileName.trim();
  const lowerName = fileName.toLowerCase();

  if (!fileName) {
    return { valid: false, error: "A file name is required." };
  }

  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return { valid: false, error: "Invalid file name." };
  }

  for (const ext of BLOCKED_EXTENSIONS) {
    if (lowerName.endsWith(ext)) {
      return {
        valid: false,
        error: `Files with extension ${ext} are not allowed. Only ZIP files are accepted.`,
      };
    }
  }

  if (!lowerName.endsWith(ALLOWED_PRODUCT_FILE_EXTENSION)) {
    return {
      valid: false,
      error: "Only .zip files are allowed.",
    };
  }

  if (input.fileSize <= 0) {
    return { valid: false, error: "File is empty." };
  }

  if (input.fileSize > MAX_PRODUCT_FILE_SIZE) {
    const maxMb = Math.round(MAX_PRODUCT_FILE_SIZE / (1024 * 1024));
    return {
      valid: false,
      error: `File exceeds the maximum size of ${maxMb} MB.`,
    };
  }

  if (
    input.contentType &&
    input.contentType !== "application/octet-stream" &&
    !input.contentType.includes("zip")
  ) {
    return {
      valid: false,
      error: "Only ZIP files are allowed.",
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
