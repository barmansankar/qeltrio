"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  onMenuClick,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--background)] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 lg:hidden focus-ring"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <h1 className="page-title text-xl sm:text-2xl">{title}</h1>
          {description && (
            <p className="page-description mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function DashboardHeaderAction({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { Button };
