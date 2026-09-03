"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/constants/product-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugifyProductName } from "@/lib/products/utils";
import type { Product } from "@/types/product";
import type { ProductFormValues } from "@/lib/products/validation";

interface ProductFormProps {
  mode: "create" | "edit";
  initialProduct?: Product;
}

function listToTextarea(values: string[]) {
  return values.join("\n");
}

function textareaToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

const defaultValues: ProductFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "SaaS",
  price: 0,
  currency: "USD",
  thumbnailUrl: "",
  screenshots: [],
  technologies: [],
  features: [],
  version: "1.0.0",
  requirements: "",
  demoUrl: "",
  documentationUrl: "",
  status: "draft",
  featured: false,
  r2ObjectKey: "",
  lemonSqueezyVariantId: "",
};

export function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ProductFormValues>(() => {
    if (!initialProduct) return defaultValues;
    return {
      name: initialProduct.name,
      slug: initialProduct.slug,
      shortDescription: initialProduct.shortDescription,
      description: initialProduct.description,
      category: initialProduct.category as ProductFormValues["category"],
      price: initialProduct.price,
      currency: initialProduct.currency,
      thumbnailUrl: initialProduct.thumbnailUrl,
      screenshots: initialProduct.screenshots,
      technologies: initialProduct.technologies,
      features: initialProduct.features,
      version: initialProduct.version,
      requirements: initialProduct.requirements,
      demoUrl: initialProduct.demoUrl ?? "",
      documentationUrl: initialProduct.documentationUrl ?? "",
      status: initialProduct.status,
      featured: initialProduct.featured,
      r2ObjectKey: initialProduct.r2ObjectKey ?? "",
      lemonSqueezyVariantId: initialProduct.lemonSqueezyVariantId ?? "",
    };
  });

  const [technologiesText, setTechnologiesText] = useState(
    listToTextarea(form.technologies)
  );
  const [featuresText, setFeaturesText] = useState(listToTextarea(form.features));
  const [screenshotsText, setScreenshotsText] = useState(
    listToTextarea(form.screenshots)
  );

  const slugPreview = useMemo(
    () => form.slug || slugifyProductName(form.name),
    [form.slug, form.name]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      ...form,
      slug: form.slug || slugifyProductName(form.name),
      technologies: textareaToList(technologiesText),
      features: textareaToList(featuresText),
      screenshots: textareaToList(screenshotsText),
    };

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${initialProduct!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setError(data.error ?? "Unable to save the product.");
        return;
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch {
      setError("Unable to save the product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <h2 className="text-subheading">Basic information</h2>
        <Field label="Product name" error={fieldErrors.name}>
          <Input
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((current) => ({
                ...current,
                name,
                slug:
                  mode === "create" && !current.slug
                    ? slugifyProductName(name)
                    : current.slug,
              }));
            }}
            required
          />
        </Field>
        <Field label="Slug" error={fieldErrors.slug} hint={`/products/${slugPreview}`}>
          <Input
            value={form.slug}
            onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))}
            required
          />
        </Field>
        <Field label="Short description" error={fieldErrors.shortDescription}>
          <textarea
            value={form.shortDescription}
            onChange={(e) =>
              setForm((c) => ({ ...c, shortDescription: e.target.value }))
            }
            rows={3}
            className="flex w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-zinc-100 focus-ring"
          />
        </Field>
        <Field label="Full description" error={fieldErrors.description}>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((c) => ({ ...c, description: e.target.value }))
            }
            rows={8}
            className="flex w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-zinc-100 focus-ring"
          />
        </Field>
        <Field label="Category" error={fieldErrors.category}>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                category: e.target.value as ProductFormValues["category"],
              }))
            }
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-zinc-100 focus-ring"
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <h2 className="text-subheading">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price" error={fieldErrors.price}>
            <Input
              type="number"
              min={0}
              step="1"
              value={form.price}
              onChange={(e) =>
                setForm((c) => ({ ...c, price: Number(e.target.value) }))
              }
            />
          </Field>
          <Field label="Currency" error={fieldErrors.currency}>
            <Input
              value={form.currency}
              onChange={(e) =>
                setForm((c) => ({ ...c, currency: e.target.value.toUpperCase() }))
              }
              maxLength={3}
            />
          </Field>
        </div>
      </section>

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <h2 className="text-subheading">Media</h2>
        <Field label="Thumbnail URL" error={fieldErrors.thumbnailUrl}>
          <Input
            value={form.thumbnailUrl}
            onChange={(e) =>
              setForm((c) => ({ ...c, thumbnailUrl: e.target.value }))
            }
            placeholder="https://..."
          />
        </Field>
        <Field label="Screenshot URLs" error={fieldErrors.screenshots} hint="One URL per line">
          <textarea
            value={screenshotsText}
            onChange={(e) => setScreenshotsText(e.target.value)}
            rows={4}
            className="flex w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-zinc-100 focus-ring"
          />
        </Field>
      </section>

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <h2 className="text-subheading">Product information</h2>
        <Field label="Technologies" error={fieldErrors.technologies} hint="One per line">
          <textarea
            value={technologiesText}
            onChange={(e) => setTechnologiesText(e.target.value)}
            rows={4}
            className="flex w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-zinc-100 focus-ring"
          />
        </Field>
        <Field label="Features" error={fieldErrors.features} hint="One per line">
          <textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={5}
            className="flex w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-zinc-100 focus-ring"
          />
        </Field>
        <Field label="Version" error={fieldErrors.version}>
          <Input
            value={form.version}
            onChange={(e) => setForm((c) => ({ ...c, version: e.target.value }))}
          />
        </Field>
        <Field label="Requirements" error={fieldErrors.requirements}>
          <textarea
            value={form.requirements}
            onChange={(e) =>
              setForm((c) => ({ ...c, requirements: e.target.value }))
            }
            rows={4}
            className="flex w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-zinc-100 focus-ring"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Demo URL" error={fieldErrors.demoUrl}>
            <Input
              value={form.demoUrl ?? ""}
              onChange={(e) => setForm((c) => ({ ...c, demoUrl: e.target.value }))}
            />
          </Field>
          <Field label="Documentation URL" error={fieldErrors.documentationUrl}>
            <Input
              value={form.documentationUrl ?? ""}
              onChange={(e) =>
                setForm((c) => ({ ...c, documentationUrl: e.target.value }))
              }
            />
          </Field>
        </div>
      </section>

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <h2 className="text-subheading">Marketplace settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" error={fieldErrors.status}>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((c) => ({
                  ...c,
                  status: e.target.value as ProductFormValues["status"],
                }))
              }
              className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-zinc-100 focus-ring"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 pt-8 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((c) => ({ ...c, featured: e.target.checked }))
              }
              className="rounded border-[var(--border)]"
            />
            Featured product
          </label>
        </div>
        <Field
          label="R2 Object Key"
          error={fieldErrors.r2ObjectKey}
          hint="Future download storage path (optional)"
        >
          <Input
            value={form.r2ObjectKey ?? ""}
            onChange={(e) => setForm((c) => ({ ...c, r2ObjectKey: e.target.value }))}
            placeholder="products/my-product/v1.0.0/product.zip"
          />
        </Field>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => router.push("/dashboard/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-label">{label}</span>
      {children}
      {hint && <p className="mt-1 text-caption">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
