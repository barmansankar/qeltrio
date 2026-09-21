import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/server";
import { PRODUCT_ZIP_CONTENT_TYPE } from "@/constants/product-files";
import { isR2Configured } from "@/lib/r2/config";
import { isValidProductObjectKey } from "@/lib/r2/object-keys";
import {
  deleteProductObject,
  verifyUploadedProductZip,
} from "@/lib/r2/products";
import {
  createUploadToken,
  verifyPrepareUploadToken,
} from "@/lib/r2/upload-token";
import { slugifyProductName } from "@/lib/products/utils";

function mapCompleteError(error: unknown) {
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
  }

  console.error("[admin/products/upload/complete]", error);
  return NextResponse.json(
    { error: "Unable to verify upload. Please try again." },
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
      prepareToken?: string;
      objectKey?: string;
      fileName?: string;
      fileSize?: number;
      contentType?: string;
      slug?: string;
      productId?: string;
    };

    if (!body.prepareToken) {
      return NextResponse.json({ error: "prepareToken is required." }, { status: 400 });
    }

    const preparePayload = verifyPrepareUploadToken(body.prepareToken);
    if (!preparePayload) {
      return NextResponse.json(
        { error: "Upload authorization expired or invalid. Please try again." },
        { status: 400 }
      );
    }

    const slug = slugifyProductName(body.slug ?? preparePayload.slug);
    if (!slug || slug !== preparePayload.slug) {
      return NextResponse.json({ error: "Upload slug mismatch." }, { status: 400 });
    }

    if (body.objectKey && body.objectKey !== preparePayload.objectKey) {
      return NextResponse.json({ error: "Upload object key mismatch." }, { status: 400 });
    }

    if (
      body.fileSize !== undefined &&
      body.fileSize !== preparePayload.fileSize
    ) {
      return NextResponse.json({ error: "Upload file size mismatch." }, { status: 400 });
    }

    if (
      body.productId &&
      preparePayload.productId &&
      body.productId !== preparePayload.productId
    ) {
      return NextResponse.json({ error: "Upload product mismatch." }, { status: 400 });
    }

    const objectKey = preparePayload.objectKey;

    if (!isValidProductObjectKey(objectKey)) {
      return NextResponse.json({ error: "Invalid object key." }, { status: 400 });
    }

    const verification = await verifyUploadedProductZip(
      objectKey,
      preparePayload.fileSize
    );

    if (!verification.valid) {
      await deleteProductObject(objectKey).catch(() => undefined);

      if (verification.error === "INVALID_ZIP_SIGNATURE") {
        return NextResponse.json(
          { error: "Uploaded file is not a valid ZIP archive." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Upload not found or file size mismatch. Please try uploading again." },
        { status: 400 }
      );
    }

    const uploadToken = createUploadToken({
      objectKey,
      fileName: preparePayload.fileName,
      fileSize: preparePayload.fileSize,
      contentType: preparePayload.contentType ?? PRODUCT_ZIP_CONTENT_TYPE,
      slug: preparePayload.slug,
      productId: preparePayload.productId ?? body.productId,
      uploadStatus: "uploaded",
    });

    return NextResponse.json({
      uploadToken,
      objectKey,
      fileName: preparePayload.fileName,
      fileSize: preparePayload.fileSize,
      contentType: preparePayload.contentType ?? PRODUCT_ZIP_CONTENT_TYPE,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    return mapCompleteError(error);
  }
}
