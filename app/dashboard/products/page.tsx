import Link from "next/link";
import { DashboardAddButton } from "@/components/dashboard/dashboard-placeholder";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { ProductTable } from "@/components/products/product-table";

export const metadata = {
  title: "Products | Dashboard | Qeltrio",
};

export default function DashboardProductsPage() {
  return (
    <DashboardPage
      title="Products"
      description="Manage your marketplace product listings."
      actions={<DashboardAddButton href="/dashboard/products/new" label="Add Product" />}
    >
      <ProductTable />
    </DashboardPage>
  );
}
