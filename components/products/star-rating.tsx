"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  onHover?: (value: number | null) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({
  value,
  onChange,
  onHover,
  max = 5,
  size = "md",
  readOnly = false,
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `${value.toFixed(1)} out of ${max} stars` : "Rate this product"}
    >
      {stars.map((star) => {
        const filled = star <= Math.round(value);

        if (readOnly) {
          return (
            <Star
              key={star}
              className={cn(
                sizeClasses[size],
                filled ? "fill-amber-400 text-amber-400" : "text-zinc-700"
              )}
              aria-hidden="true"
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(star)}
            onBlur={() => onHover?.(null)}
            className="rounded-sm transition-colors focus-ring cursor-pointer"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-600 hover:text-amber-300"
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
