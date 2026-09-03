import { notFound } from "next/navigation";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { ProductForm } from "@/components/products/product-form";
import { getProductService } from "@/lib/products/service";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductService().getByIdAdmin(id);
  return {
    title: product ? `Edit ${product.name}` : "Edit Product",
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductService().getByIdAdmin(id);

  if (!product) notFound();

  return (
    <DashboardPage
      title="Edit Product"
      description={product.name}
    >
      <ProductForm mode="edit" initialProduct={product} />
    </DashboardPage>
  );
}
