"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Downloads", href: "/dashboard/downloads", icon: Download },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      <div
        className={cn(
          "flex h-14 items-center border-b border-[var(--border)] px-3 sm:h-16",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && <Logo />}
        <button
          type="button"
          onClick={onToggle}
          className="hidden h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 lg:inline-flex focus-ring"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onMobileClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 lg:hidden focus-ring"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Dashboard">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-ring",
                active
                  ? "bg-white/[0.06] text-zinc-100"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
                collapsed && "justify-center px-2"
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-violet-400"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={cn("h-4 w-4 shrink-0", active ? "text-violet-400" : "")}
                aria-hidden="true"
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-[var(--border)] p-4">
          <p className="text-caption font-medium text-zinc-500">Qeltrio Admin</p>
          <p className="mt-0.5 text-caption">Built. Owned. Launched.</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Dashboard navigation"
      >
        {navContent}
      </aside>

      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:border-r lg:border-[var(--border)] lg:bg-[var(--surface)] lg:transition-[width] lg:duration-200",
          collapsed ? "lg:w-[60px]" : "lg:w-60"
        )}
        aria-label="Dashboard navigation"
      >
        {navContent}
      </aside>
    </>
  );
}
