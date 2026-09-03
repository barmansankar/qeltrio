import { z } from "zod";
import { PRODUCT_CATEGORIES } from "@/constants/product-categories";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined)
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
    message: "Must be a valid URL starting with http:// or https://",
  });

const stringList = z.array(z.string().trim().min(1)).max(50);

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  shortDescription: z.string().trim().min(10, "Short description is required").max(280),
  description: z.string().trim().min(20, "Description is required").max(10000),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.coerce.number().min(0, "Price must be 0 or greater").max(1_000_000),
  currency: z.string().trim().length(3, "Currency must be a 3-letter code").default("USD"),
  thumbnailUrl: z.string().trim().max(500).default(""),
  screenshots: stringList.default([]),
  technologies: stringList.min(1, "Add at least one technology"),
  features: stringList.min(1, "Add at least one feature"),
  version: z.string().trim().min(1, "Version is required").max(32),
  requirements: z.string().trim().min(1, "Requirements are required").max(2000),
  demoUrl: optionalUrl,
  documentationUrl: optionalUrl,
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean().default(false),
  r2ObjectKey: z.string().trim().max(500).optional().or(z.literal("")),
  lemonSqueezyVariantId: z.string().trim().max(120).optional().or(z.literal("")),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function parseProductFormInput(data: unknown) {
  return productFormSchema.safeParse(data);
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
