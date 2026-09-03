import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products/server";
import { getProductRatingState, submitProductRating } from "@/lib/ratings/server";
import { getAuthenticatedUser } from "@/lib/auth/server";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const product = await getProductById(productId);
    const authUser = await getAuthenticatedUser();

    const state = await getProductRatingState(
      productId,
      authUser?.uid ?? null,
      product?.rating ?? 0,
      product?.ratingCount ?? 0
    );

    return NextResponse.json(state);
  } catch {
    return NextResponse.json(
      { error: "Unable to load product ratings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Sign in to rate this product." }, { status: 401 });
    }

    const { productId } = await params;
    const body = (await request.json()) as { rating?: number };

    if (!body.rating) {
      return NextResponse.json({ error: "Rating is required." }, { status: 400 });
    }

    const state = await submitProductRating(productId, authUser.uid, body.rating);
    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_RATING") {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unable to save your rating." },
      { status: 500 }
    );
  }
}
