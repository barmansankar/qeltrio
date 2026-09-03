import type { AnalyticsDateRange } from "@/types/analytics";

export const DATE_RANGE_OPTIONS: {
  value: AnalyticsDateRange;
  label: string;
}[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
];

export function getRangeDayCount(range: AnalyticsDateRange): number {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
      return 365;
  }
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatChartLabel(dateKey: string, range: AnalyticsDateRange): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  if (range === "7d") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  if (range === "1y") {
    return date.toLocaleDateString("en-US", { month: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getDateRangeBounds(range: AnalyticsDateRange, now = new Date()) {
  const end = startOfDay(now);
  const dayCount = getRangeDayCount(range);
  const start = new Date(end);
  start.setDate(start.getDate() - (dayCount - 1));

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (dayCount - 1));

  return { start, end, previousStart, previousEnd };
}

export function getAllDateKeysBetween(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    keys.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

export function getDateKeysInRange(
  start: Date,
  end: Date,
  range: AnalyticsDateRange
): { date: string; label: string }[] {
  const keys: { date: string; label: string }[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const date = formatDateKey(cursor);
    keys.push({ date, label: formatChartLabel(date, range) });
    cursor.setDate(cursor.getDate() + 1);
  }

  if (range === "1y" && keys.length > 30) {
    const step = Math.ceil(keys.length / 12);
    return keys.filter((_, index) => index % step === 0 || index === keys.length - 1);
  }

  return keys;
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}
