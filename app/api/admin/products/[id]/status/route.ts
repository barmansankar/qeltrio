import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/server";
import { getProductService } from "@/lib/products/service";

interface RouteParams {
  params: Promise<{ id: string }>;
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
    console.error("[admin/products/status]", error);
    return NextResponse.json(
      { error: "Unable to update product status." },
      { status: 500 }
    );
  }
}
