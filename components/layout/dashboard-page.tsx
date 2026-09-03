"use client";

import { useMobileMenu } from "./dashboard-shell";
import { DashboardHeader } from "./dashboard-header";

interface DashboardPageProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardPage({
  title,
  description,
  actions,
  children,
}: DashboardPageProps) {
  const { openMobileMenu } = useMobileMenu();

  return (
    <>
      <DashboardHeader
        title={title}
        description={description}
        onMenuClick={openMobileMenu}
        actions={actions}
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
    </>
  );
}
