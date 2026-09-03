"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmpty } from "@/components/analytics/chart-empty";
import { CHART_AXIS_TICK, CHART_GRID_STROKE, CHART_TOOLTIP_STYLE } from "@/lib/chart-styles";
import type { UserGrowthPoint } from "@/types/analytics";

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  if (data.every((point) => point.users === 0)) {
    return <ChartEmpty message="No new user signups recorded yet" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            allowDecimals={false}
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="users"
            name="New users"
            stroke="#38bdf8"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
