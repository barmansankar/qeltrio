import { NextResponse } from "next/server";
import { getDashboardAnalytics } from "@/lib/analytics";
import { requireAdminUser } from "@/lib/auth/server";
import type { AnalyticsDateRange } from "@/types/analytics";

const ALLOWED_RANGES = new Set<AnalyticsDateRange>(["7d", "30d", "90d", "1y"]);

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") ?? "30d";

    if (!ALLOWED_RANGES.has(rangeParam as AnalyticsDateRange)) {
      return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
    }

    const data = await getDashboardAnalytics(rangeParam as AnalyticsDateRange);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Unable to load analytics." },
      { status: 500 }
    );
  }
}
