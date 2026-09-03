"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoading } from "@/components/auth/auth-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AccountOverview() {
  const { profile, loading, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (loading) {
    return <AuthLoading className="py-16" />;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header className="page-header mb-0">
        <h1 className="page-title text-2xl">Account</h1>
        <p className="page-description text-sm">
          Manage your profile and marketplace activity.
        </p>
      </header>

      {error === "admin_required" && (
        <div
          className="rounded-md border border-amber-500/15 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300"
          role="alert"
        >
          You don&apos;t have permission to access the admin dashboard.
        </div>
      )}

      <div className="surface-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-zinc-100">{profile.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">{profile.email}</p>
          </div>
          <Badge variant={isAdmin ? "accent" : "outline"}>
            {isAdmin ? "Admin" : "Member"}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-600">Member since</dt>
            <dd className="mt-1 text-sm text-zinc-300">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-600">Last sign in</dt>
            <dd className="mt-1 text-sm text-zinc-300">
              {new Date(profile.lastLoginAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/account/purchases">
            <Button variant="secondary" size="sm">
              View Purchases
            </Button>
          </Link>
          <Link href="/account/settings">
            <Button variant="outline" size="sm">
              Account Settings
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Admin Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
