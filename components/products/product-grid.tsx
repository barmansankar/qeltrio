import { ProductCard } from "./product-card";
import type { ProductWithRatings } from "@/types/product";

interface ProductGridProps {
  products: ProductWithRatings[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
