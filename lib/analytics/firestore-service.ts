import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getProductService } from "@/lib/products/service";
import {
  getAllDateKeysBetween,
  getDateKeysInRange,
  getDateRangeBounds,
  percentChange,
} from "@/lib/analytics/date-range";
import type { AnalyticsService } from "@/lib/analytics/types";
import type {
  AnalyticsDateRange,
  DailyAnalyticsDoc,
  DashboardAnalyticsData,
  KpiMetric,
  ProductPerformancePoint,
  RevenuePoint,
  TimeSeriesPoint,
  TrackAnalyticsPayload,
  UserGrowthPoint,
} from "@/types/analytics";

const DAILY_COLLECTION = "analytics_daily";
const PRODUCT_DAILY_COLLECTION = "analytics_product_daily";
const USERS_COLLECTION = "users";

const emptyDaily = (): DailyAnalyticsDoc => ({
  pageViews: 0,
  productViews: 0,
  downloads: 0,
  signups: 0,
  purchases: 0,
  updatedAt: new Date().toISOString(),
});

async function getDailyDoc(date: string): Promise<DailyAnalyticsDoc> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(DAILY_COLLECTION).doc(date).get();

  if (!snapshot.exists) {
    return emptyDaily();
  }

  const data = snapshot.data()!;
  return {
    pageViews: Number(data.pageViews ?? 0),
    productViews: Number(data.productViews ?? 0),
    downloads: Number(data.downloads ?? 0),
    signups: Number(data.signups ?? 0),
    purchases: Number(data.purchases ?? 0),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : String(data.updatedAt ?? new Date().toISOString()),
  };
}

async function sumDailyMetrics(start: Date, end: Date) {
  const keys = getAllDateKeysBetween(start, end);
  const dailyDocs = await Promise.all(keys.map((date) => getDailyDoc(date)));

  let totals = { views: 0, downloads: 0, signups: 0, purchases: 0 };
  for (const daily of dailyDocs) {
    totals.views += daily.pageViews + daily.productViews;
    totals.downloads += daily.downloads;
    totals.signups += daily.signups;
    totals.purchases += daily.purchases;
  }

  return totals;
}

async function getUserCount(): Promise<number> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(USERS_COLLECTION).count().get();
  return snapshot.data().count;
}

function buildPlaceholderRevenue(
  range: AnalyticsDateRange,
  start: Date,
  end: Date
): RevenuePoint[] {
  const keys = getDateKeysInRange(start, end, range);
  const base = 420;

  return keys.map(({ date, label }, index) => ({
    date,
    label,
    revenue: Math.round(base + Math.sin(index / 2) * 80 + index * 12),
    isPlaceholder: true as const,
  }));
}

async function getProductPerformance(
  start: Date,
  end: Date
): Promise<ProductPerformancePoint[]> {
  const db = getAdminFirestore();
  const keys = getAllDateKeysBetween(start, end);
  const catalog = await getProductService().getCatalogIds();
  const productMap = new Map<string, ProductPerformancePoint>();

  for (const product of catalog) {
    productMap.set(product.id, {
      productId: product.id,
      name: product.name,
      views: 0,
      downloads: 0,
      purchases: 0,
    });
  }

  const docRefs = catalog.flatMap((product) =>
    keys.map((date) => ({
      productId: product.id,
      ref: db.collection(PRODUCT_DAILY_COLLECTION).doc(`${product.id}_${date}`),
    }))
  );

  const FIRESTORE_GET_ALL_LIMIT = 10;
  for (let i = 0; i < docRefs.length; i += FIRESTORE_GET_ALL_LIMIT) {
    const chunk = docRefs.slice(i, i + FIRESTORE_GET_ALL_LIMIT);
    const snapshots = await db.getAll(...chunk.map((item) => item.ref));

    snapshots.forEach((snapshot, index) => {
      if (!snapshot.exists) return;

      const { productId } = chunk[index];
      const entry = productMap.get(productId);
      if (!entry) return;

      const data = snapshot.data()!;
      entry.views += Number(data.views ?? 0);
      entry.downloads += Number(data.downloads ?? 0);
      entry.purchases += Number(data.purchases ?? 0);
    });
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

async function buildViewsDownloadsSeries(
  range: AnalyticsDateRange,
  start: Date,
  end: Date
): Promise<TimeSeriesPoint[]> {
  const keys = getDateKeysInRange(start, end, range);
  const series: TimeSeriesPoint[] = [];

  const dailyByDate = await Promise.all(
    keys.map(async ({ date, label }) => {
      const daily = await getDailyDoc(date);
      return {
        date,
        label,
        views: daily.pageViews + daily.productViews,
        downloads: daily.downloads,
      };
    })
  );
  series.push(...dailyByDate);

  return series;
}

async function buildUserGrowthSeries(
  range: AnalyticsDateRange,
  start: Date,
  end: Date
): Promise<UserGrowthPoint[]> {
  const keys = getDateKeysInRange(start, end, range);
  const series: UserGrowthPoint[] = [];

  const points = await Promise.all(
    keys.map(async ({ date, label }) => {
      const daily = await getDailyDoc(date);
      return { date, label, users: daily.signups };
    })
  );
  series.push(...points);

  return series;
}

async function buildKpis(
  range: AnalyticsDateRange,
  start: Date,
  end: Date,
  previousStart: Date,
  previousEnd: Date
): Promise<KpiMetric[]> {
  const [current, previous, totalUsers] = await Promise.all([
    sumDailyMetrics(start, end),
    sumDailyMetrics(previousStart, previousEnd),
    getUserCount(),
  ]);

  const periodLabel = "vs previous period";

  return [
    {
      id: "views",
      label: "Total Views",
      value: current.views,
      change: percentChange(current.views, previous.views),
      period: periodLabel,
    },
    {
      id: "downloads",
      label: "Total Downloads",
      value: current.downloads,
      change: percentChange(current.downloads, previous.downloads),
      period: periodLabel,
    },
    {
      id: "users",
      label: "Total Users",
      value: totalUsers,
      change: percentChange(current.signups, previous.signups),
      period: periodLabel,
    },
    {
      id: "revenue",
      label: "Total Revenue",
      value: 24850,
      change: 18.3,
      period: periodLabel,
      format: "currency",
      isPlaceholder: true,
      placeholderLabel: "Placeholder until Lemon Squeezy is connected",
    },
  ];
}

export const firestoreAnalyticsService: AnalyticsService = {
  async getDashboardAnalytics(range: AnalyticsDateRange): Promise<DashboardAnalyticsData> {
    const { start, end, previousStart, previousEnd } = getDateRangeBounds(range);

    const [kpis, viewsDownloads, userGrowth, productPerformance, revenue] =
      await Promise.all([
        buildKpis(range, start, end, previousStart, previousEnd),
        buildViewsDownloadsSeries(range, start, end),
        buildUserGrowthSeries(range, start, end),
        getProductPerformance(start, end),
        Promise.resolve(buildPlaceholderRevenue(range, start, end)),
      ]);

    return {
      kpis,
      viewsDownloads,
      userGrowth,
      productPerformance,
      revenue,
      range,
      lastUpdated: new Date().toISOString(),
    };
  },
};

export async function recordAnalyticsEvent(payload: TrackAnalyticsPayload) {
  const db = getAdminFirestore();
  const date = new Date().toISOString().slice(0, 10);
  const dailyRef = db.collection(DAILY_COLLECTION).doc(date);

  const dailyUpdates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  switch (payload.type) {
    case "page_view":
      dailyUpdates.pageViews = FieldValue.increment(1);
      break;
    case "product_view":
      dailyUpdates.productViews = FieldValue.increment(1);
      break;
    case "download":
      dailyUpdates.downloads = FieldValue.increment(1);
      break;
    case "signup":
      dailyUpdates.signups = FieldValue.increment(1);
      break;
  }

  await dailyRef.set(dailyUpdates, { merge: true });

  if (payload.productId && (payload.type === "product_view" || payload.type === "download")) {
    const productDocId = `${payload.productId}_${date}`;
    const productRef = db.collection(PRODUCT_DAILY_COLLECTION).doc(productDocId);
    const field = payload.type === "product_view" ? "views" : "downloads";

    await productRef.set(
      {
        productId: payload.productId,
        date,
        [field]: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
}
