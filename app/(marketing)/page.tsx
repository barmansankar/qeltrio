import Link from "next/link";
import {
  ArrowRight,
  Box,
  Code2,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CATEGORIES } from "@/constants/product-categories";

const features = [
  {
    icon: Box,
    title: "Ready-to-launch products",
    description:
      "Browse production-quality SaaS apps, templates, and developer tools you can deploy immediately.",
  },
  {
    icon: Code2,
    title: "Built by developers",
    description:
      "Every product includes clean code, documentation, and the technical details you need to ship fast.",
  },
  {
    icon: Zap,
    title: "Skip the boilerplate",
    description:
      "Stop rebuilding auth, dashboards, and payment flows. Start from a solid foundation.",
  },
  {
    icon: Layers,
    title: "Own your stack",
    description:
      "Purchase once, download the source, and customize everything. No vendor lock-in.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="page-section border-b border-[var(--border)]">
        <div className="page-container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="accent" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              The marketplace for builders
            </Badge>

            <h1 className="text-display">
              Built. Owned. Launched.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-body">
              Discover ready-to-use software projects, SaaS applications, AI
              tools, and digital products. Don&apos;t start from zero — launch
              faster with Qeltrio.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/products">
                <Button variant="primary" size="lg">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="page-container py-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-1.5 text-sm text-zinc-500 transition-colors hover:border-[var(--border-hover)] hover:text-zinc-300 focus-ring"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-heading">Everything you need to ship</h2>
            <p className="mt-3 text-body">
              Qeltrio connects builders with premium digital products designed
              for real-world deployment.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="surface-card p-5 sm:p-6 card-hover"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-zinc-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-label text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-body text-sm">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-container pb-16 sm:pb-20 lg:pb-24">
        <div className="surface-card-elevated px-6 py-12 text-center sm:px-12 sm:py-14">
          <h2 className="text-heading text-2xl sm:text-3xl">
            Ready to launch your next project?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-body">
            Explore the marketplace and find the perfect starting point for
            your next SaaS, tool, or application.
          </p>
          <Link href="/products" className="mt-8 inline-block">
            <Button variant="primary" size="lg">
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
