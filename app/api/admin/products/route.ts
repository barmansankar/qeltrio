import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/server";
import { getProductService } from "@/lib/products/service";
import {
  formatZodErrors,
  parseProductFormInput,
} from "@/lib/products/validation";
import { slugifyProductName } from "@/lib/products/utils";
import type { ProductListQuery } from "@/lib/products/types";
import type { ProductSortOption } from "@/constants/products";

function mapApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "SLUG_EXISTS") {
      return NextResponse.json(
        { error: "A product with this slug already exists." },
        { status: 409 }
      );
    }
    if (error.message === "UNAUTHENTICATED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
  }
  console.error("[admin/products]", error);
  return NextResponse.json(
    { error: "Unable to process the request. Please try again." },
    { status: 500 }
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminUser();
    const { searchParams } = new URL(request.url);

    const query: ProductListQuery = {
      admin: true,
      limit: Number(searchParams.get("limit") ?? 50),
      cursor: searchParams.get("cursor") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      search: searchParams.get("q") ?? undefined,
      sort: (searchParams.get("sort") as ProductSortOption) ?? "newest",
    };

    const status = searchParams.get("status");
    if (status === "draft" || status === "published" || status === "archived") {
      query.status = status;
    }

    const result = await getProductService().listAdmin(query);
    return NextResponse.json(result);
  } catch (error) {
    return mapApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const body = await request.json();
    const parsed = parseProductFormInput({
      ...body,
      slug: body.slug || slugifyProductName(body.name ?? ""),
      screenshots: normalizeList(body.screenshots),
      technologies: normalizeList(body.technologies),
      features: normalizeList(body.features),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", fieldErrors: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const product = await getProductService().create(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return mapApiError(error);
  }
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}
