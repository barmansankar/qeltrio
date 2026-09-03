import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/firestore-service";
import type { TrackAnalyticsPayload } from "@/types/analytics";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "product_view",
  "download",
  "signup",
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrackAnalyticsPayload;

    if (!body?.type || !ALLOWED_EVENTS.has(body.type)) {
      return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
    }

    if (body.type === "product_view" || body.type === "download") {
      if (!body.productId || typeof body.productId !== "string") {
        return NextResponse.json(
          { error: "Product ID is required for this event." },
          { status: 400 }
        );
      }
    }

    await recordAnalyticsEvent(body);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to record analytics event." },
      { status: 500 }
    );
  }
}
