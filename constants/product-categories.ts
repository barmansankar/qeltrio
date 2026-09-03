export const PRODUCT_CATEGORIES = [
  "AI",
  "SaaS",
  "Web Apps",
  "Mobile",
  "Developer Tools",
  "Templates",
  "Automation",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isValidProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}
