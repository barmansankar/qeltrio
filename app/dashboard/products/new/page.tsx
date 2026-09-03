import { DashboardPage } from "@/components/layout/dashboard-page";
import { ProductForm } from "@/components/products/product-form";

export const metadata = {
  title: "Add Product | Dashboard | Qeltrio",
};

export default function NewProductPage() {
  return (
    <DashboardPage
      title="Add Product"
      description="Create a new marketplace listing."
    >
      <ProductForm mode="create" />
    </DashboardPage>
  );
}
