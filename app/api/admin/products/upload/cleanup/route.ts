import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/server";
import { cleanupOrphanedUpload } from "@/lib/products/r2-metadata";
import { getProductService } from "@/lib/products/service";
import { isR2Configured } from "@/lib/r2/config";
import { isValidProductObjectKey } from "@/lib/r2/object-keys";

export async function POST(request: Request) {
  try {
    await requireAdminUser();

    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "Cloudflare R2 is not configured." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      objectKey?: string;
      productId?: string;
    };

    if (!body.objectKey || !isValidProductObjectKey(body.objectKey)) {
      return NextResponse.json({ error: "Invalid object key." }, { status: 400 });
    }

    const protectObjectKeys: string[] = [];

    if (body.productId) {
      const product = await getProductService().getByIdAdmin(body.productId);
      if (product?.r2ObjectKey) {
        protectObjectKeys.push(product.r2ObjectKey);
      }
    }

    if (protectObjectKeys.includes(body.objectKey)) {
      return NextResponse.json(
        { error: "Cannot delete the current production software file." },
        { status: 400 }
      );
    }

    await cleanupOrphanedUpload(body.objectKey, { protectObjectKeys });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }
    }

    console.error("[admin/products/upload/cleanup]", error);
    return NextResponse.json(
      { error: "Unable to clean up upload." },
      { status: 500 }
    );
  }
}
