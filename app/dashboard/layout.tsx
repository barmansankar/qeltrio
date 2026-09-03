import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DashboardLayoutClient } from "@/components/layout/dashboard-shell";
import { getAuthenticatedUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Dashboard | Qeltrio",
  description: "Manage your Qeltrio marketplace",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/signin?redirect=/dashboard");
  }

  if (user.profile.role !== "admin") {
    redirect("/account?error=admin_required");
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
