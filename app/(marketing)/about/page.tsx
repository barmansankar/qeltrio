import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About | Qeltrio",
  description: "Learn about Qeltrio — the marketplace for builders.",
};

export default function AboutPage() {
  return (
    <div className="page-container page-section">
      <div className="mx-auto max-w-3xl">
        <header className="page-header">
          <h1 className="page-title sm:text-4xl">About Qeltrio</h1>
          <p className="mt-2 text-sm font-medium text-violet-400/90">
            Built. Owned. Launched.
          </p>
        </header>

        <div className="space-y-5 text-body">
          <p>
            Qeltrio is a modern marketplace where developers, founders, and teams
            can discover, purchase, and download ready-to-use software projects,
            SaaS applications, AI tools, templates, and digital products.
          </p>
          <p>
            We believe the best products shouldn&apos;t start from a blank
            repository. Whether you&apos;re launching your next SaaS, building an
            internal tool, or shipping a side project, Qeltrio gives you a
            production-quality foundation to build on.
          </p>
          <p>
            Every product on Qeltrio is designed to be owned outright — download
            the source, customize it, deploy it, and make it yours. No
            subscriptions to the codebase. No vendor lock-in.
          </p>
          <p className="text-label text-zinc-300">
            Don&apos;t start from zero.
          </p>
        </div>

        <div className="mt-10">
          <Link href="/products">
            <Button variant="primary" size="lg">
              Browse the Marketplace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
