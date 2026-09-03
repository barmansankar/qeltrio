"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmpty } from "@/components/analytics/chart-empty";
import { CHART_AXIS_TICK, CHART_GRID_STROKE, CHART_TOOLTIP_STYLE } from "@/lib/chart-styles";
import type { TimeSeriesPoint } from "@/types/analytics";

interface ViewsDownloadsChartProps {
  data: TimeSeriesPoint[];
}

export function ViewsDownloadsChart({ data }: ViewsDownloadsChartProps) {
  if (data.every((point) => point.views === 0 && point.downloads === 0)) {
    return <ChartEmpty message="No views or downloads recorded yet" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="downloadsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
            width={40}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Views"
            stroke="#8b5cf6"
            fill="url(#viewsGradient)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="downloads"
            name="Downloads"
            stroke="#22c55e"
            fill="url(#downloadsGradient)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
