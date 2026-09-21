"use client";

import { useCallback, useRef, useState } from "react";
import { FileArchive, Loader2, Trash2, Upload } from "lucide-react";
import { MAX_PRODUCT_FILE_SIZE, PRODUCT_ZIP_CONTENT_TYPE } from "@/constants/product-files";
import {
  formatFileSize,
  validateProductFileClient,
} from "@/lib/r2/validation-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export interface UploadedFileState {
  uploadToken: string;
  objectKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

interface ProductFileUploadProps {
  slug: string;
  productId?: string;
  existingFile?: Pick<
    Product,
    | "r2ObjectKey"
    | "r2FileName"
    | "r2FileSize"
    | "r2ContentType"
    | "r2UploadedAt"
    | "r2UploadStatus"
  >;
  value: UploadedFileState | null;
  onChange: (value: UploadedFileState | null) => void;
  disabled?: boolean;
  error?: string;
}

type UploadPhase = "idle" | "preparing" | "uploading" | "verifying" | "success" | "error";

export function ProductFileUpload({
  slug,
  productId,
  existingFile,
  value,
  onChange,
  disabled = false,
  error,
}: ProductFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [r2Configured, setR2Configured] = useState<boolean | null>(null);

  const maxMb = Math.round(MAX_PRODUCT_FILE_SIZE / (1024 * 1024));
  const displayError = error ?? localError;
  const productionObjectKey = existingFile?.r2ObjectKey ?? undefined;

  const currentFile = value ?? (existingFile?.r2UploadStatus === "uploaded" && existingFile.r2FileName
    ? {
        uploadToken: "",
        objectKey: existingFile.r2ObjectKey ?? "",
        fileName: existingFile.r2FileName,
        fileSize: existingFile.r2FileSize ?? 0,
        contentType: existingFile.r2ContentType ?? "application/zip",
        uploadedAt: existingFile.r2UploadedAt ?? "",
      }
    : null);

  const uploadToR2 = useCallback(
    (uploadUrl: string, file: File, onProgress: (pct: number) => void): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", PRODUCT_ZIP_CONTENT_TYPE);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
            return;
          }

          reject(
            new Error(
              xhr.responseText?.trim() ||
                `Upload failed with status ${xhr.status}.`
            )
          );
        };

        xhr.onerror = () =>
          reject(
            new Error(
              "Network error during upload. Ensure Cloudflare R2 bucket CORS allows PUT from this origin."
            )
          );
        xhr.send(file);
      });
    },
    []
  );

  const cleanupUpload = useCallback(
    async (objectKey: string) => {
      await fetch("/api/admin/products/upload/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ objectKey, productId }),
      }).catch(() => undefined);
    },
    [productId]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setLocalError(null);
      setProgress(0);

      const validationError = validateProductFileClient(file);
      if (validationError) {
        setLocalError(validationError);
        setPhase("error");
        return;
      }

      if (!slug.trim()) {
        setLocalError("Enter a product name or slug before uploading.");
        setPhase("error");
        return;
      }

      setPhase("preparing");

      let pendingObjectKey: string | null = null;

      try {
        const initResponse = await fetch("/api/admin/products/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            slug,
            fileName: file.name,
            fileSize: file.size,
            contentType: PRODUCT_ZIP_CONTENT_TYPE,
            productId,
          }),
        });

        const initData = (await initResponse.json()) as {
          error?: string;
          uploadUrl?: string;
          objectKey?: string;
          prepareToken?: string;
        };

        if (initResponse.status === 503) {
          setR2Configured(false);
          setLocalError(initData.error ?? "Cloudflare R2 is not configured.");
          setPhase("error");
          return;
        }

        setR2Configured(true);

        if (
          !initResponse.ok ||
          !initData.uploadUrl ||
          !initData.objectKey ||
          !initData.prepareToken
        ) {
          setLocalError(initData.error ?? "Unable to prepare upload.");
          setPhase("error");
          return;
        }

        pendingObjectKey = initData.objectKey;

        setPhase("uploading");
        await uploadToR2(initData.uploadUrl, file, setProgress);

        setPhase("verifying");
        const completeResponse = await fetch("/api/admin/products/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            prepareToken: initData.prepareToken,
            objectKey: initData.objectKey,
            fileName: file.name,
            fileSize: file.size,
            contentType: PRODUCT_ZIP_CONTENT_TYPE,
            slug,
            productId,
          }),
        });

        const completeData = (await completeResponse.json()) as {
          error?: string;
          uploadToken?: string;
          objectKey?: string;
          fileName?: string;
          fileSize?: number;
          contentType?: string;
          uploadedAt?: string;
        };

        if (!completeResponse.ok || !completeData.uploadToken) {
          if (pendingObjectKey) {
            await cleanupUpload(pendingObjectKey);
          }
          setLocalError(completeData.error ?? "Upload verification failed.");
          setPhase("error");
          return;
        }

        onChange({
          uploadToken: completeData.uploadToken,
          objectKey: completeData.objectKey ?? initData.objectKey,
          fileName: completeData.fileName ?? file.name,
          fileSize: completeData.fileSize ?? file.size,
          contentType: completeData.contentType ?? PRODUCT_ZIP_CONTENT_TYPE,
          uploadedAt: completeData.uploadedAt ?? new Date().toISOString(),
        });

        setPhase("success");
      } catch (error) {
        if (pendingObjectKey && pendingObjectKey !== productionObjectKey) {
          await cleanupUpload(pendingObjectKey);
        }
        const message =
          error instanceof Error ? error.message : "Upload failed. Please try again.";
        setLocalError(message);
        setPhase("error");
      }
    },
    [slug, productId, onChange, uploadToR2, cleanupUpload, productionObjectKey]
  );

  async function handleRemove() {
    if (value?.objectKey && value.objectKey !== productionObjectKey) {
      await cleanupUpload(value.objectKey);
    }

    onChange(null);
    setPhase("idle");
    setProgress(0);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {r2Configured === false && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">
          Cloudflare R2 is not configured. Add R2 environment variables to enable software uploads.
        </div>
      )}

      {currentFile && phase !== "uploading" && phase !== "preparing" && phase !== "verifying" ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-violet-400">
              <FileArchive className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-100">
                {currentFile.fileName}
              </p>
              <p className="mt-1 text-caption">
                Status:{" "}
                <span className="text-emerald-400">Uploaded</span>
                {currentFile.fileSize > 0 && (
                  <> · {formatFileSize(currentFile.fileSize)}</>
                )}
              </p>
              {currentFile.uploadedAt && (
                <p className="mt-0.5 text-caption">
                  Uploaded:{" "}
                  {new Date(currentFile.uploadedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
                aria-label="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!value && (
            <div className="mt-4">
              <input
                ref={inputRef}
                type="file"
                accept=".zip,application/zip"
                className="sr-only"
                disabled={disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileSelect(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Replace file
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center",
            disabled && "opacity-60"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            className="sr-only"
            disabled={disabled || phase === "preparing" || phase === "uploading" || phase === "verifying"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileSelect(file);
            }}
          />

          {(phase === "idle" || phase === "error" || phase === "success") && (
            <>
              <FileArchive className="mx-auto h-8 w-8 text-zinc-600" aria-hidden="true" />
              <p className="mt-3 text-sm text-zinc-400">
                Select a software ZIP file to upload
              </p>
              <p className="mt-1 text-caption">
                .zip only · Max {maxMb} MB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Choose ZIP file
              </Button>
            </>
          )}

          {phase === "preparing" && (
            <div className="flex flex-col items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
              Preparing upload…
            </div>
          )}

          {phase === "uploading" && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-300">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                Uploading {progress}%
              </div>
              <div className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {phase === "verifying" && (
            <div className="flex flex-col items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
              Verifying upload…
            </div>
          )}

          {phase === "success" && (
            <p className="text-sm text-emerald-400">Upload successful.</p>
          )}
        </div>
      )}

      {displayError && (
        <p className="text-xs text-red-400" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}
