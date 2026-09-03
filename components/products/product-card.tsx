import Link from "next/link";
import { Download, Eye, FolderOpen, ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import type { ProductWithRatings } from "@/types/product";

interface ProductCardProps {
  product: ProductWithRatings;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden surface-card card-hover",
        className
      )}
    >
      <div className="flex flex-col p-3 sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Badge variant="outline">{product.category}</Badge>
            {product.featured && <Badge variant="accent">Featured</Badge>}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-[11px] text-amber-400/90">
            <Star className="h-3 w-3 fill-amber-400" aria-hidden="true" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-zinc-600">({product.ratingCount})</span>
          </div>
        </div>

        <div className="flex items-stretch gap-2 sm:gap-3">
          <div className="flex w-[60%] min-w-0 flex-col">
            <Link href={`/products/${product.slug}`} className="cursor-pointer">
              <h3 className="line-clamp-1 text-sm font-medium text-zinc-100 transition-colors group-hover:text-white">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-zinc-500">
              {product.shortDescription}
            </p>

            <div className="mt-2 flex flex-wrap gap-1">
              {product.technologies.slice(0, 2).map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-px text-[10px] text-zinc-500"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" aria-hidden="true" />
                {formatNumber(product.views)}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" aria-hidden="true" />
                {formatNumber(product.downloads)}
              </span>
            </div>
          </div>

          <div
            className="flex w-[40%] shrink-0 items-end justify-center overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-elevated)]/60"
            aria-hidden="true"
          >
            <FolderOpen className="h-20 w-20 shrink-0 translate-y-[40%] text-zinc-600/80 transition-colors group-hover:text-zinc-500 sm:h-24 sm:w-24" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] px-3 py-2.5 sm:px-4">
        <p className="text-sm font-semibold text-zinc-50">
          {formatCurrency(product.price, product.currency)}
        </p>
        <div className="flex gap-1.5">
          <Link href={`/products/${product.slug}`} className="cursor-pointer">
            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
              Details
            </Button>
          </Link>
          <Link href={`/products/${product.slug}`} scroll className="cursor-pointer">
            <Button variant="primary" size="sm" className="h-8 px-2.5 text-xs">
              <ShoppingCart className="h-3 w-3" aria-hidden="true" />
              Buy
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
