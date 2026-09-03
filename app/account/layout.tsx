import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AccountNav } from "@/components/account/account-nav";
import { ProductSearchProvider } from "@/components/products/product-search-provider";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedUser } from "@/lib/auth/server";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/signin?redirect=/account");
  }

  return (
    <ProductSearchProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
      <div className="page-container flex flex-1 flex-col gap-8 py-8 sm:py-10 lg:flex-row lg:gap-12">
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="surface-card p-4">
              <p className="text-label truncate">{user.profile.name}</p>
              <p className="mt-0.5 truncate text-caption">
                {user.profile.email}
              </p>
              {user.profile.role === "admin" && (
                <Badge variant="accent" className="mt-2.5">
                  Admin
                </Badge>
              )}
            </div>

            <AccountNav />

            {user.profile.role === "admin" && (
              <Link
                href="/dashboard"
                className="block text-sm text-violet-400/90 transition-colors hover:text-violet-300 focus-ring rounded-sm"
              >
                Go to Admin Dashboard →
              </Link>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />
    </div>
    </ProductSearchProvider>
  );
}
