import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/server";
import { getProductService } from "@/lib/products/service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function mapStatusError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    if (error.message === "ZIP_REQUIRED_FOR_PUBLISH") {
      return NextResponse.json(
        { error: "A software ZIP file is required before publishing this product." },
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
  console.error("[admin/products/status]", error);
  return NextResponse.json(
    { error: "Unable to update product status." },
    { status: 500 }
  );
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const body = (await request.json()) as { action?: string };

    switch (body.action) {
      case "publish": {
        const product = await getProductService().publish(id);
        return NextResponse.json({ product });
      }
      case "archive": {
        const product = await getProductService().archive(id);
        return NextResponse.json({ product });
      }
      default:
        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
  } catch (error) {
    return mapStatusError(error);
  }
}
