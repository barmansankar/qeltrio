"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Settings, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const accountLinks = [
  { label: "Overview", href: "/account", icon: User, exact: true },
  { label: "Purchases", href: "/account/purchases", icon: ShoppingBag },
  { label: "Downloads", href: "/account/downloads", icon: Download },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="space-y-0.5" aria-label="Account">
      {accountLinks.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.href, link.exact);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-ring",
              active
                ? "bg-white/[0.06] text-zinc-100"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-violet-400"
                aria-hidden="true"
              />
            )}
            <Icon className={cn("h-4 w-4", active && "text-violet-400")} aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
