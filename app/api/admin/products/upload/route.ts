import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/server";
import { isR2Configured } from "@/lib/r2/config";
import { ensureR2UploadCors } from "@/lib/r2/cors";
import { createProductUploadUrl } from "@/lib/r2/products";
import { slugifyProductName } from "@/lib/products/utils";

function mapUploadError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
    if (error.message === "R2_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Cloudflare R2 is not configured." },
        { status: 503 }
      );
    }
    if (
      error.message === "INVALID_FILE_EXTENSION" ||
      error.message === "INVALID_FILE_NAME" ||
      error.message === "INVALID_SLUG" ||
      error.message === "INVALID_OBJECT_KEY"
    ) {
      return NextResponse.json({ error: "Invalid file or product slug." }, { status: 400 });
    }
    if (
      error.message.includes("Only .zip") ||
      error.message.includes("exceeds") ||
      error.message.includes("not allowed")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  console.error("[admin/products/upload]", error);
  return NextResponse.json(
    { error: "Unable to prepare upload. Please try again." },
    { status: 500 }
  );
}

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
      slug?: string;
      fileName?: string;
      fileSize?: number;
      contentType?: string;
      productId?: string;
    };

    if (!body.slug || !body.fileName || body.fileSize === undefined) {
      return NextResponse.json(
        { error: "slug, fileName, and fileSize are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(body.fileSize) || body.fileSize <= 0) {
      return NextResponse.json({ error: "A valid file size is required." }, { status: 400 });
    }

    const slug = slugifyProductName(body.slug);
    if (!slug) {
      return NextResponse.json({ error: "A valid product slug is required." }, { status: 400 });
    }

    await ensureR2UploadCors(request.headers.get("origin"));

    const result = await createProductUploadUrl({
      slug,
      fileName: body.fileName,
      fileSize: body.fileSize,
      contentType: body.contentType,
      productId: body.productId,
    });

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      objectKey: result.objectKey,
      prepareToken: result.prepareToken,
      expiresIn: result.expiresIn,
      uploadMode: "presigned",
    });
  } catch (error) {
    return mapUploadError(error);
  }
}
