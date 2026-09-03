"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmpty } from "@/components/analytics/chart-empty";
import { CHART_AXIS_TICK, CHART_GRID_STROKE, CHART_TOOLTIP_STYLE } from "@/lib/chart-styles";
import type { ProductPerformancePoint } from "@/types/analytics";

interface ProductPerformanceChartProps {
  data: ProductPerformancePoint[];
}

export function ProductPerformanceChart({ data }: ProductPerformanceChartProps) {
  if (data.every((item) => item.views === 0 && item.downloads === 0 && item.purchases === 0)) {
    return <ChartEmpty message="No product performance data yet" />;
  }

  const chartData = data.map((item) => ({
    ...item,
    shortName: item.name.length > 18 ? `${item.name.slice(0, 18)}…` : item.name,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="shortName"
            tick={{ ...CHART_AXIS_TICK, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={70}
          />
          <YAxis
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }} />
          <Bar dataKey="views" name="Views" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="downloads" name="Downloads" fill="#22c55e" radius={[3, 3, 0, 0]} />
          <Bar dataKey="purchases" name="Purchases" fill="#f59e0b" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
