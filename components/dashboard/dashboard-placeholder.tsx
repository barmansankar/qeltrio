"use client";

import Link from "next/link";
import {
  BarChart3,
  Download,
  Package,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

const iconMap = {
  package: Package,
  users: Users,
  orders: ShoppingCart,
  downloads: Download,
  analytics: BarChart3,
  settings: Settings,
} as const;

export type DashboardIconName = keyof typeof iconMap;

interface DashboardPlaceholderProps {
  title: string;
  description: string;
  icon: DashboardIconName;
  emptyTitle: string;
  emptyDescription: string;
  action?: { label: string; href: string };
  headerActions?: React.ReactNode;
}

export function DashboardPlaceholder({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
  action,
  headerActions,
}: DashboardPlaceholderProps) {
  const Icon = iconMap[icon];

  return (
    <DashboardPage
      title={title}
      description={description}
      actions={headerActions}
    >
      <EmptyState
        icon={Icon}
        title={emptyTitle}
        description={emptyDescription}
        action={action}
      />
    </DashboardPage>
  );
}

export function DashboardAddButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <Button variant="primary" size="sm">
        {label}
      </Button>
    </Link>
  );
}
