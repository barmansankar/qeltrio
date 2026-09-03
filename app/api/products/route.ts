import { NextResponse } from "next/server";
import { PRODUCTS_PAGE_SIZE } from "@/constants/products";
import { getProducts } from "@/lib/products/server";
import type { ProductSortOption } from "@/constants/products";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const sort = (searchParams.get("sort") as ProductSortOption) ?? "newest";
    const cursor = searchParams.get("cursor") ?? undefined;
    const featured = searchParams.get("featured");
    const limit = Number(searchParams.get("limit") ?? PRODUCTS_PAGE_SIZE);

    const result = await getProducts({
      search: q,
      category: category || undefined,
      sort,
      cursor,
      limit,
      featured: featured === "true" ? true : undefined,
    });

    return NextResponse.json({
      products: result.items,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("[api/products]", error);
    return NextResponse.json(
      { error: "Unable to load products." },
      { status: 500 }
    );
  }
}
