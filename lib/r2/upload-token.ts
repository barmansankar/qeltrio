import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import {
  R2_UPLOAD_TOKEN_EXPIRY_SECONDS,
  R2_UPLOAD_URL_EXPIRATION_SECONDS,
} from "@/constants/product-files";
import type { R2UploadStatus } from "@/types/product";

export interface R2UploadTokenPayload {
  purpose: "save";
  objectKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  slug: string;
  productId?: string;
  uploadStatus: R2UploadStatus;
  exp: number;
}

export interface R2PrepareUploadTokenPayload {
  purpose: "prepare";
  objectKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  slug: string;
  productId?: string;
  exp: number;
}

function getSigningSecret(): string {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error("UPLOAD_TOKEN_SECRET_UNAVAILABLE");
  }
  return createHmac("sha256", key).update("qeltrio-r2-upload").digest("hex");
}

function signPayload(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSigningSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function verifySignedPayload<T extends { exp: number; purpose: string }>(
  token: string,
  expectedPurpose: T["purpose"]
): T | null {
  try {
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;

    const expected = createHmac("sha256", getSigningSecret())
      .update(body)
      .digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as T;

    if (payload.purpose !== expectedPurpose) return null;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function createPrepareUploadToken(
  payload: Omit<R2PrepareUploadTokenPayload, "purpose" | "exp">
): string {
  const fullPayload: R2PrepareUploadTokenPayload = {
    ...payload,
    purpose: "prepare",
    exp: Math.floor(Date.now() / 1000) + R2_UPLOAD_URL_EXPIRATION_SECONDS,
  };
  return signPayload(fullPayload);
}

export function verifyPrepareUploadToken(
  token: string
): R2PrepareUploadTokenPayload | null {
  const payload = verifySignedPayload<R2PrepareUploadTokenPayload>(token, "prepare");
  if (!payload?.objectKey || !payload.fileName || !payload.slug) return null;
  return payload;
}

export function createUploadToken(
  payload: Omit<R2UploadTokenPayload, "purpose" | "exp">
): string {
  const fullPayload: R2UploadTokenPayload = {
    ...payload,
    purpose: "save",
    exp: Math.floor(Date.now() / 1000) + R2_UPLOAD_TOKEN_EXPIRY_SECONDS,
  };
  return signPayload(fullPayload);
}

export function verifyUploadToken(token: string): R2UploadTokenPayload | null {
  const payload = verifySignedPayload<R2UploadTokenPayload>(token, "save");
  if (!payload?.objectKey || !payload.fileName || !payload.slug) return null;
  if (payload.uploadStatus !== "uploaded") return null;
  return payload;
}
