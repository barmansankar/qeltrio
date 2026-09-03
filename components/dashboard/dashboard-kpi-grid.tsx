"use client";

import { Eye, Download, Users, DollarSign } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import type { KpiMetric } from "@/types/analytics";

const iconMap = {
  views: Eye,
  downloads: Download,
  users: Users,
  revenue: DollarSign,
} as const;

interface DashboardKpiGridProps {
  kpis: KpiMetric[];
}

export function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.id as keyof typeof iconMap] ?? DollarSign;
        return (
          <StatCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            period={kpi.period}
            format={kpi.format}
            isPlaceholder={kpi.isPlaceholder}
            placeholderLabel={kpi.placeholderLabel}
            icon={Icon}
          />
        );
      })}
    </div>
  );
}
