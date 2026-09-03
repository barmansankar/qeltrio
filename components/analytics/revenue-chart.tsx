"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { CHART_AXIS_TICK, CHART_GRID_STROKE, CHART_TOOLTIP_STYLE } from "@/lib/chart-styles";
import { formatCurrency } from "@/lib/utils";
import type { RevenuePoint } from "@/types/analytics";

interface RevenueChartProps {
  data: RevenuePoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-500/15 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-200/90">
        Placeholder revenue data only. Real transactions will be recorded after Lemon
        Squeezy checkout and webhooks are connected.
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="label"
              tick={CHART_AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={CHART_AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue (placeholder)"
              stroke="#f59e0b"
              fill="url(#revenueGradient)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 text-caption">
        <Badge variant="warning">Placeholder</Badge>
        <span>Not connected to Lemon Squeezy yet</span>
      </div>
    </div>
  );
}
