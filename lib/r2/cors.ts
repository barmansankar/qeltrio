import "server-only";

import {
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  type CORSRule,
} from "@aws-sdk/client-s3";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";

const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

let verifiedOriginKey: string | null = null;

function getOriginCacheKey(origins: string[]): string {
  return origins.slice().sort().join("|");
}

function collectAllowedOrigins(requestOrigin?: string | null): string[] {
  const origins = new Set<string>(DEFAULT_DEV_ORIGINS);

  for (const envVar of [process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    if (!envVar) continue;
    try {
      origins.add(new URL(envVar).origin);
    } catch {
      // Ignore invalid URL values in env.
    }
  }

  if (requestOrigin) {
    origins.add(requestOrigin);
  }

  return [...origins];
}

function ruleAllowsBrowserUpload(rule: CORSRule, origins: string[]): boolean {
  const allowedOrigins = rule.AllowedOrigins ?? [];
  const hasOrigins =
    allowedOrigins.includes("*") ||
    origins.every((origin) => allowedOrigins.includes(origin));

  const methods = (rule.AllowedMethods ?? []).map((method) => method.toUpperCase());
  const hasPut = methods.includes("PUT") || methods.includes("*");

  const headers = (rule.AllowedHeaders ?? []).map((header) => header.toLowerCase());
  const hasContentType =
    headers.includes("*") || headers.includes("content-type");

  return hasOrigins && hasPut && hasContentType;
}

function corsRulesSufficient(
  rules: CORSRule[] | undefined,
  origins: string[]
): boolean {
  if (!rules?.length) return false;
  return rules.some((rule) => ruleAllowsBrowserUpload(rule, origins));
}

function mergeOrigins(existingRules: CORSRule[], requiredOrigins: string[]): string[] {
  const merged = new Set<string>(requiredOrigins);

  for (const rule of existingRules) {
    for (const origin of rule.AllowedOrigins ?? []) {
      if (origin !== "*") {
        merged.add(origin);
      }
    }
  }

  return [...merged];
}

/**
 * Ensures the R2 bucket allows browser PUT uploads from the app origin.
 * Required for direct presigned-URL uploads from the admin UI.
 */
export async function ensureR2UploadCors(
  requestOrigin?: string | null
): Promise<void> {
  const origins = collectAllowedOrigins(requestOrigin);
  const cacheKey = getOriginCacheKey(origins);
  if (verifiedOriginKey === cacheKey) return;

  const { bucketName } = getR2Config();
  const client = getR2Client();

  try {
    const existing = await client.send(
      new GetBucketCorsCommand({ Bucket: bucketName })
    );

    if (corsRulesSufficient(existing.CORSRules, origins)) {
      verifiedOriginKey = cacheKey;
      return;
    }

    const mergedOrigins = mergeOrigins(existing.CORSRules ?? [], origins);
    const preservedRules = (existing.CORSRules ?? []).filter(
      (rule) => !ruleAllowsBrowserUpload(rule, origins)
    );

    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            ...preservedRules,
            {
              AllowedOrigins: mergedOrigins,
              AllowedMethods: ["GET", "PUT", "HEAD"],
              AllowedHeaders: ["*"],
              ExposeHeaders: ["ETag", "Content-Length"],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );

    verifiedOriginKey = cacheKey;
    console.info("[r2] Configured bucket CORS for browser uploads:", mergedOrigins);
  } catch (error) {
    console.warn(
      "[r2] Unable to configure bucket CORS automatically. Browser uploads may fail until CORS is set on the R2 bucket.",
      error
    );
  }
}
