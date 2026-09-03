"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { ProductSearchTrigger } from "@/components/products/product-search-trigger";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, signOut, loading } = useAuth();

  async function handleMobileSignOut() {
    setMobileOpen(false);
    await signOut();
    window.location.href = "/";
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="page-container flex h-14 items-center justify-between gap-4 sm:h-16">
        <div className="flex items-center gap-6 lg:gap-8">
          <Logo />

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-ring",
                  isActive(link.href)
                    ? "bg-white/[0.06] text-zinc-100"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ProductSearchTrigger className="hidden sm:inline-flex" />

          <div className="hidden sm:block">
            <UserMenu />
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 md:hidden focus-ring"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-[var(--border)] bg-[var(--surface)] md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="page-container flex flex-col gap-0.5 py-3" aria-label="Mobile">
          <div className="px-1 pb-2">
            <ProductSearchTrigger className="w-full justify-start" showShortcut={false} />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-white/[0.06] text-zinc-100"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
              )}
            >
              {link.label}
            </Link>
          ))}

          {!loading && isAuthenticated ? (
            <div className="mt-2 flex flex-col gap-0.5 border-t border-[var(--border)] pt-3">
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
              >
                Account
              </Link>
              <Link
                href="/account/purchases"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
              >
                Purchases
              </Link>
              {isAdmin && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                >
                  Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={handleMobileSignOut}
                className="rounded-md px-3 py-2.5 text-left text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            !loading && (
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--border)] pt-3">
                <Link href="/signin" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
