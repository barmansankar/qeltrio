import { DollarSign, type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import type { KpiFormat } from "@/types/analytics";

export interface StatCardProps {
  label: string;
  value: number;
  change: number;
  period: string;
  icon: LucideIcon;
  format?: KpiFormat;
  isPlaceholder?: boolean;
  placeholderLabel?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  period,
  icon: Icon,
  format = "number",
  isPlaceholder = false,
  placeholderLabel,
  className,
}: StatCardProps) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const DisplayIcon = format === "currency" ? DollarSign : Icon;

  return (
    <article className={cn("surface-card p-5 sm:p-6 card-hover", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-zinc-400">
          <DisplayIcon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          <TrendIcon className="h-3 w-3" aria-hidden="true" />
          <span>{formatPercent(change)}</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2">
          <p className="text-caption text-zinc-500">{label}</p>
          {isPlaceholder && (
            <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              Placeholder
            </span>
          )}
        </div>
        {format === "currency" ? (
          <p className="mt-1 flex items-baseline gap-0.5 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            <span className="text-lg text-zinc-500">$</span>
            {formatNumber(value)}
          </p>
        ) : (
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            {formatNumber(value)}
          </p>
        )}
        <p className="mt-1 text-caption">{period}</p>
        {isPlaceholder && placeholderLabel && (
          <p className="mt-2 text-[11px] leading-relaxed text-amber-500/80">
            {placeholderLabel}
          </p>
        )}
      </div>
    </article>
  );
}
