"use client";

import { cn } from "@/lib/utils";
import { DATE_RANGE_OPTIONS } from "@/lib/analytics/date-range";
import type { AnalyticsDateRange } from "@/types/analytics";

interface DateRangeFilterProps {
  value: AnalyticsDateRange;
  onChange: (value: AnalyticsDateRange) => void;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-md border border-[var(--border)] bg-[var(--surface)] p-0.5",
        className
      )}
      role="group"
      aria-label="Date range filter"
    >
      {DATE_RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-ring",
            value === option.value
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-500 hover:text-zinc-300"
          )}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
