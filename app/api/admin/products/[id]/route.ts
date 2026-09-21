import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/server";
import { getProductService } from "@/lib/products/service";
import {
  formatZodErrors,
  parseProductFormInput,
} from "@/lib/products/validation";
import { slugifyProductName } from "@/lib/products/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function mapApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "SLUG_EXISTS") {
      return NextResponse.json(
        { error: "A product with this slug already exists." },
        { status: 409 }
      );
    }
    if (error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    if (error.message === "ZIP_REQUIRED_FOR_PUBLISH") {
      return NextResponse.json(
        {
          error: "A software ZIP file is required before publishing this product.",
          fieldErrors: { r2UploadToken: "A software ZIP file is required before publishing this product." },
        },
        { status: 400 }
      );
    }
    if (error.message === "R2_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Cloudflare R2 is not configured." },
        { status: 503 }
      );
    }
    if (
      error.message === "INVALID_UPLOAD_TOKEN" ||
      error.message === "UPLOAD_NOT_FOUND" ||
      error.message === "UPLOAD_SLUG_MISMATCH" ||
      error.message === "UPLOAD_PRODUCT_MISMATCH"
    ) {
      return NextResponse.json(
        { error: "Invalid or expired upload. Please upload the file again." },
        { status: 400 }
      );
    }
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
  }
  console.error("[admin/products/[id]]", error);
  return NextResponse.json(
    { error: "Unable to process the request. Please try again." },
    { status: 500 }
  );
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const product = await getProductService().getByIdAdmin(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return mapApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdminUser();
    const { id } = await params;
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

    const product = await getProductService().update(id, parsed.data);
    return NextResponse.json({ product });
  } catch (error) {
    return mapApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdminUser();
    const { id } = await params;
    await getProductService().delete(id);
    return NextResponse.json({ success: true });
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
