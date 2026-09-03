import type { ProductStatus } from "@/types";
import type { Product } from "@/types/product";

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  "launchpad-saas-starter": "from-violet-600/40 to-indigo-900/60",
  "neuraldesk-ai-console": "from-fuchsia-600/40 to-purple-900/60",
  "commerceflow-admin": "from-emerald-600/40 to-teal-900/60",
  "devforge-api-toolkit": "from-sky-600/40 to-blue-900/60",
  "pixelcraft-landing-bundle": "from-amber-600/40 to-orange-900/60",
  "insightiq-analytics-saas": "from-cyan-600/40 to-slate-900/60",
  "quickbite-delivery-app": "from-rose-600/40 to-red-900/60",
  "agentflow-automation-hub": "from-violet-600/40 to-fuchsia-900/60",
  "cloudcrm-lite": "from-indigo-600/40 to-violet-900/60",
};

const DEFAULT_GRADIENT = "from-zinc-700/40 to-zinc-900/60";

export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductPlaceholderGradient(slug: string): string {
  return PLACEHOLDER_GRADIENTS[slug] ?? DEFAULT_GRADIENT;
}

export function buildLicenseAgreement(productName: string): string {
  return `END USER LICENSE AGREEMENT — ${productName}

1. GRANT OF LICENSE
Upon purchase, Qeltrio.AI grants you a non-exclusive, non-transferable license to use the source code and materials included with ${productName} ("Product") for personal or commercial projects.

2. PERMITTED USE
You may modify, deploy, and use the Product for unlimited personal and client projects. You may create end products for yourself or clients where the Product is not the primary value being sold.

3. RESTRICTIONS
You may not resell, redistribute, sublicense, or share the original source code, design files, or downloadable package. You may not list the Product on competing marketplaces or template stores.

4. OWNERSHIP
Qeltrio.AI and its licensors retain all intellectual property rights in the original Product. This license does not transfer ownership of the base materials.

5. SUPPORT & UPDATES
This purchase includes the version available at the time of sale. Future updates may be offered separately unless stated on the product page.

6. REFUNDS
Due to the digital nature of this Product, all sales are final once the download has been accessed, except where required by applicable law.

7. LIMITATION OF LIABILITY
The Product is provided "as is" without warranty. Qeltrio.AI shall not be liable for damages arising from use of the Product.

By proceeding to purchase, you acknowledge that you have read and agree to this license.`;
}

function parseTimestamp(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asStatus(value: unknown): ProductStatus {
  if (value === "published" || value === "draft" || value === "archived") {
    return value;
  }
  return "draft";
}

function asRequirements(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join("\n");
  }
  return String(value ?? "");
}

export function buildSearchKeywords(input: {
  name: string;
  slug: string;
  category: string;
  technologies: string[];
  shortDescription?: string;
}): string[] {
  const tokens = new Set<string>();
  const add = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized.length >= 2) tokens.add(normalized);
    normalized.split(/\s+/).forEach((part) => {
      if (part.length >= 2) tokens.add(part);
    });
  };

  add(input.name);
  add(input.slug);
  add(input.category);
  input.technologies.forEach(add);
  if (input.shortDescription) add(input.shortDescription);

  return Array.from(tokens).slice(0, 40);
}

/**
 * Maps a Firestore document to a Product.
 */
export function productFromFirestore(
  id: string,
  data: Record<string, unknown>
): Product {
  const slug = String(data.slug ?? slugifyProductName(String(data.name ?? id)));
  const name = String(data.name ?? "");
  const category = String(data.category ?? "Uncategorized");
  const technologies = asStringArray(data.technologies);

  return {
    id,
    name,
    slug,
    shortDescription: String(
      data.shortDescription ?? data.description ?? ""
    ),
    description: String(
      data.description ?? data.longDescription ?? data.shortDescription ?? ""
    ),
    category,
    price: asNumber(data.price),
    currency: String(data.currency ?? "USD"),
    thumbnailUrl: String(data.thumbnailUrl ?? ""),
    screenshots: asStringArray(data.screenshots),
    technologies,
    features: asStringArray(data.features),
    version: String(data.version ?? "1.0.0"),
    requirements: asRequirements(data.requirements),
    demoUrl: data.demoUrl ? String(data.demoUrl) : undefined,
    documentationUrl: data.documentationUrl
      ? String(data.documentationUrl)
      : undefined,
    status: asStatus(data.status),
    featured: Boolean(data.featured),
    views: asNumber(data.views),
    downloads: asNumber(data.downloads),
    purchases: asNumber(data.purchases),
    r2ObjectKey: data.r2ObjectKey
      ? String(data.r2ObjectKey)
      : data.downloadObjectKey
        ? String(data.downloadObjectKey)
        : undefined,
    lemonSqueezyVariantId: data.lemonSqueezyVariantId
      ? String(data.lemonSqueezyVariantId)
      : undefined,
    searchKeywords: asStringArray(data.searchKeywords).length
      ? asStringArray(data.searchKeywords)
      : buildSearchKeywords({ name, slug, category, technologies }),
    createdAt: parseTimestamp(data.createdAt),
    updatedAt: parseTimestamp(data.updatedAt),
  };
}

export function productToFirestore(
  product: Omit<Product, "id"> & { id?: string }
): Record<string, unknown> {
  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    category: product.category,
    price: product.price,
    currency: product.currency,
    thumbnailUrl: product.thumbnailUrl,
    screenshots: product.screenshots,
    technologies: product.technologies,
    features: product.features,
    version: product.version,
    requirements: product.requirements,
    demoUrl: product.demoUrl ?? null,
    documentationUrl: product.documentationUrl ?? null,
    status: product.status,
    featured: product.featured,
    views: product.views,
    downloads: product.downloads,
    purchases: product.purchases,
    r2ObjectKey: product.r2ObjectKey ?? null,
    lemonSqueezyVariantId: product.lemonSqueezyVariantId ?? null,
    searchKeywords: product.searchKeywords,
  };
}
