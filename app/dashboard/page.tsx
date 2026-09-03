import { Suspense } from "react";
import { ArrowUpRight, BarChart3, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import { DashboardOverviewSkeleton } from "@/components/ui/skeleton";
import { getDashboardAnalytics } from "@/lib/analytics";

async function OverviewKpis() {
  const data = await getDashboardAnalytics("30d");
  return <DashboardKpiGrid kpis={data.kpis} />;
}

export default function DashboardOverviewPage() {
  return (
    <DashboardPage
      title="Overview"
      description="Monitor your marketplace performance at a glance."
    >
      <div className="space-y-8">
        <Suspense fallback={<DashboardOverviewSkeleton />}>
          <OverviewKpis />
        </Suspense>

        <section aria-labelledby="quick-actions-heading">
          <h2
            id="quick-actions-heading"
            className="text-label text-zinc-500"
          >
            Quick actions
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <QuickActionCard
              href="/dashboard/products/new"
              icon={Package}
              title="Add Product"
              description="Create a new marketplace listing"
            />
            <QuickActionCard
              href="/dashboard/analytics"
              icon={BarChart3}
              title="View Analytics"
              description="Explore detailed performance metrics"
            />
            <QuickActionCard
              href="/dashboard/orders"
              icon={TrendingUp}
              title="Recent Orders"
              description="Review latest purchase activity"
            />
          </div>
        </section>

        <section
          className="surface-card p-5 sm:p-6"
          aria-labelledby="activity-heading"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="activity-heading"
                className="text-subheading text-base"
              >
                Recent Activity
              </h2>
              <p className="mt-1 text-body text-sm">
                Live activity feed will appear here once connected to Firestore.
              </p>
            </div>
            <Link
              href="/dashboard/analytics"
              className="text-sm text-violet-400/90 transition-colors hover:text-violet-300 focus-ring rounded-sm"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 flex h-32 items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-elevated)]">
            <p className="text-sm text-zinc-500">No recent activity yet</p>
          </div>
        </section>
      </div>
    </DashboardPage>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 surface-card p-4 sm:p-5 card-hover focus-ring"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-zinc-500 transition-colors group-hover:border-[var(--border-hover)] group-hover:text-violet-400">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <h3 className="text-label text-zinc-100">{title}</h3>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400"
            aria-hidden="true"
          />
        </div>
        <p className="mt-1 text-body text-sm">{description}</p>
      </div>
    </Link>
  );
}
