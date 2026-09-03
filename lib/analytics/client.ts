"use client";

import type { TrackAnalyticsPayload } from "@/types/analytics";

const inFlightKeys = new Set<string>();

function storageKey(key: string) {
  return `qeltrio:analytics:${key}`;
}

function hasRecentEvent(key: string, ttlMs = 30 * 60 * 1000) {
  if (typeof window === "undefined") return false;

  const raw = sessionStorage.getItem(storageKey(key));
  if (!raw) return false;

  const timestamp = Number(raw);
  if (Number.isNaN(timestamp)) return true;

  return Date.now() - timestamp < ttlMs;
}

function markEvent(key: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(storageKey(key), String(Date.now()));
}

async function sendAnalyticsEvent(payload: TrackAnalyticsPayload) {
  const response = await fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Analytics event failed");
  }
}

async function trackOnce(key: string, payload: TrackAnalyticsPayload) {
  if (inFlightKeys.has(key) || hasRecentEvent(key)) {
    return;
  }

  inFlightKeys.add(key);

  try {
    await sendAnalyticsEvent(payload);
    markEvent(key);
  } catch {
    // Analytics should never block UX.
  } finally {
    inFlightKeys.delete(key);
  }
}

export function trackPageView(path: string) {
  const key = `page_view:${path}`;
  return trackOnce(key, { type: "page_view", path });
}

export function trackProductView(productId: string) {
  const key = `product_view:${productId}`;
  return trackOnce(key, { type: "product_view", productId });
}

export function trackDownload(productId: string) {
  const key = `download:${productId}`;
  return trackOnce(key, { type: "download", productId });
}

export function trackSignup() {
  const key = "signup";
  return trackOnce(key, { type: "signup" });
}
