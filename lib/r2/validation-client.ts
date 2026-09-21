import {
  ALLOWED_PRODUCT_FILE_EXTENSION,
  MAX_PRODUCT_FILE_SIZE,
} from "@/constants/product-files";

export function validateProductFileClient(file: File): string | null {
  const lowerName = file.name.toLowerCase();

  if (!lowerName.endsWith(ALLOWED_PRODUCT_FILE_EXTENSION)) {
    return "Only .zip files are allowed.";
  }

  const blocked = [
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
  for (const ext of blocked) {
    if (lowerName.endsWith(ext)) {
      return `Files with extension ${ext} are not allowed.`;
    }
  }

  if (file.size <= 0) {
    return "File is empty.";
  }

  if (file.size > MAX_PRODUCT_FILE_SIZE) {
    const maxMb = Math.round(MAX_PRODUCT_FILE_SIZE / (1024 * 1024));
    return `File exceeds the maximum size of ${maxMb} MB.`;
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
