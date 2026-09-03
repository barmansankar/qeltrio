"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { StarRating } from "@/components/products/star-rating";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { ProductRatingState } from "@/types/rating";

interface ProductRatingSectionProps {
  productId: string;
  productSlug: string;
  initialAverage: number;
  initialCount: number;
}

export function ProductRatingSection({
  productId,
  productSlug,
  initialAverage,
  initialCount,
}: ProductRatingSectionProps) {
  const { isAuthenticated, loading } = useAuth();
  const [state, setState] = useState<ProductRatingState>({
    summary: {
      productId,
      averageRating: initialAverage,
      ratingCount: initialCount,
    },
    userRating: null,
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadRatings() {
      try {
        const response = await fetch(`/api/products/${productId}/ratings`);
        if (!response.ok) return;
        const data = (await response.json()) as ProductRatingState;
        if (!cancelled) {
          setState(data);
          setSelectedRating(data.userRating);
        }
      } catch {
        // Keep initial fallback values.
      }
    }

    void loadRatings();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  function handleRate(rating: number) {
    if (!isAuthenticated) return;

    setError(null);
    setMessage(null);
    setSelectedRating(rating);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/products/${productId}/ratings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating }),
        });

        const data = (await response.json()) as ProductRatingState & { error?: string };

        if (!response.ok) {
          setError(data.error ?? "Unable to save your rating.");
          setSelectedRating(state.userRating);
          return;
        }

        setState(data);
        setSelectedRating(data.userRating);
        setMessage(
          data.userRating === rating
            ? "Thanks for rating this product."
            : "Your rating has been updated."
        );
      } catch {
        setError("Unable to save your rating. Please try again.");
        setSelectedRating(state.userRating);
      }
    });
  }

  const displayValue = hoverRating ?? selectedRating ?? 0;
  const { summary } = state;

  return (
    <section
      className="mt-8 surface-card p-5 sm:mt-10 sm:p-6"
      aria-labelledby="ratings-heading"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="ratings-heading" className="text-subheading">
            Ratings
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <StarRating value={summary.averageRating} readOnly size="lg" />
            <div>
              <p className="text-2xl font-semibold tracking-tight text-zinc-50">
                {summary.averageRating.toFixed(1)}
              </p>
              <p className="text-caption">
                {summary.ratingCount === 0
                  ? "No ratings yet"
                  : `${summary.ratingCount} rating${summary.ratingCount === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[240px] rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
          <p className="text-label">Rate this product</p>

          {loading ? (
            <p className="mt-3 text-sm text-zinc-500">Loading…</p>
          ) : isAuthenticated ? (
            <>
              <div className="mt-3">
                <StarRating
                  value={displayValue}
                  onChange={handleRate}
                  onHover={setHoverRating}
                  size="md"
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                {selectedRating
                  ? `You rated this ${selectedRating} out of 5`
                  : "Select a star to leave your rating"}
              </p>
              {isPending && (
                <p className="mt-2 text-xs text-zinc-500" aria-live="polite">
                  Saving rating…
                </p>
              )}
            </>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-zinc-500">
                Sign in to share your rating for this product.
              </p>
              <Link href={`/signin?redirect=/products/${productSlug}`}>
                <Button variant="secondary" size="sm">
                  Sign in to rate
                </Button>
              </Link>
            </div>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-400" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-3 text-xs text-emerald-400" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
