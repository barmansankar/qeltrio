import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  Eye,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductRatingSection } from "@/components/products/product-rating-section";
import { ProductViewTracker } from "@/components/analytics/product-view-tracker";
import { LicenseAgreementBox } from "@/components/products/license-agreement-box";
import { ProductPurchaseCard } from "@/components/products/product-purchase-card";
import { getProductPlaceholderGradient } from "@/lib/products";
import { getProductBySlug } from "@/lib/products/server";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const title = `${product.name} | Qeltrio`;
  const description = product.shortDescription;
  const image = product.thumbnailUrl || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const publishedDate = new Date(product.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(product.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page-container page-section">
      <ProductViewTracker productId={product.id} />
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300 focus-ring rounded-sm sm:mb-8"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <div
            className={cn(
              "relative flex h-56 items-center justify-center overflow-hidden rounded-[var(--radius)] bg-gradient-to-br sm:h-72",
              product.thumbnailUrl ? "" : getProductPlaceholderGradient(product.slug)
            )}
            style={
              product.thumbnailUrl
                ? {
                    backgroundImage: `url(${product.thumbnailUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!product.thumbnailUrl && (
              <span className="text-6xl font-semibold text-white/15 select-none sm:text-7xl">
                {product.name.charAt(0)}
              </span>
            )}
          </div>

          {product.screenshots.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.screenshots.map((screenshot) => (
                <div
                  key={screenshot}
                  className="aspect-video overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]"
                  style={{
                    backgroundImage: `url(${screenshot})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-6 sm:mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{product.category}</Badge>
              {product.featured && <Badge variant="accent">Featured</Badge>}
              <div className="flex items-center gap-1 text-sm text-amber-400/90">
                <Star className="h-4 w-4 fill-amber-400" aria-hidden="true" />
                {product.rating.toFixed(1)}
                <span className="text-zinc-600">({product.ratingCount})</span>
              </div>
            </div>

            <h1 className="mt-4 text-heading sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-body">{product.shortDescription}</p>
            <p className="mt-4 text-body">{product.description}</p>
            <p className="mt-4 text-caption">
              Published {publishedDate} · Updated {updatedDate}
            </p>
          </div>

          <section className="mt-8 sm:mt-10" aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-subheading">
              Features
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-zinc-500"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 sm:mt-10" aria-labelledby="tech-heading">
            <h2 id="tech-heading" className="text-subheading">
              Technologies
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.technologies.map((tech) => (
                <Badge key={tech} variant="default">
                  {tech}
                </Badge>
              ))}
            </div>
          </section>

          <section className="mt-8 sm:mt-10" aria-labelledby="requirements-heading">
            <h2 id="requirements-heading" className="text-subheading">
              Requirements
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm text-zinc-500">
              {product.requirements}
            </p>
          </section>

          {product.documentationUrl && (
            <section className="mt-8 sm:mt-10">
              <a
                href={product.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                View documentation →
              </a>
            </section>
          )}

          <ProductRatingSection
            productId={product.id}
            productSlug={product.slug}
            initialAverage={product.rating}
            initialCount={product.ratingCount}
          />
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-1 lg:gap-8">
          <div className="lg:sticky lg:top-24">
            <ProductPurchaseCard>
              <p className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                {formatCurrency(product.price, product.currency)}
              </p>
              <p className="mt-1 text-caption">
                One-time purchase · Version {product.version}
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" size="lg" className="w-full">
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  Proceed to purchase
                </Button>

                {product.demoUrl && (
                  <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="md" className="w-full">
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Live Demo
                    </Button>
                  </a>
                )}
              </div>

              <dl className="mt-6 space-y-3 border-t border-[var(--border)] pt-6 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-zinc-500">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    Views
                  </dt>
                  <dd className="text-zinc-300">{formatNumber(product.views)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-zinc-500">
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Downloads
                  </dt>
                  <dd className="text-zinc-300">{formatNumber(product.downloads)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Purchases</dt>
                  <dd className="text-zinc-300">{formatNumber(product.purchases)}</dd>
                </div>
              </dl>
            </ProductPurchaseCard>
          </div>

          <LicenseAgreementBox content={product.licenseAgreement} />
        </aside>
      </div>
    </div>
  );
}
