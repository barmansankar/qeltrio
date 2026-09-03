"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Download,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoading } from "@/components/auth/auth-loading";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu() {
  const { user, profile, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <AuthLoading />;
  }

  if (!user || !profile) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link
          href="/signin"
          className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100 focus-ring"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-100 px-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-white focus-ring"
        >
          Get Started
        </Link>
      </div>
    );
  }

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  const displayName = profile.name || user.email || "User";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] focus-ring"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/10 text-xs font-medium text-violet-300">
          {profile.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoURL}
              alt=""
              className="h-7 w-7 rounded-md object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </span>
        <span className="hidden max-w-[120px] truncate text-zinc-300 lg:inline">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-zinc-500 transition-transform duration-150",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] py-1 shadow-lg shadow-black/30"
          role="menu"
        >
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="truncate text-sm font-medium text-zinc-100">
              {displayName}
            </p>
            <p className="truncate text-caption">{profile.email}</p>
          </div>

          <div className="py-1">
            <MenuLink href="/account" icon={User} onClick={() => setOpen(false)}>
              Account
            </MenuLink>
            <MenuLink
              href="/account/purchases"
              icon={ShoppingBag}
              onClick={() => setOpen(false)}
            >
              Purchases
            </MenuLink>
            <MenuLink
              href="/account/downloads"
              icon={Download}
              onClick={() => setOpen(false)}
            >
              Downloads
            </MenuLink>
            <MenuLink
              href="/account/settings"
              icon={Settings}
              onClick={() => setOpen(false)}
            >
              Settings
            </MenuLink>
            {isAdmin && (
              <MenuLink
                href="/dashboard"
                icon={LayoutDashboard}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </MenuLink>
            )}
          </div>

          <div className="border-t border-[var(--border)] py-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 focus-ring"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300 focus-ring"
      role="menuitem"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
