import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius)] border border-red-500/15 bg-red-500/[0.04] px-6 py-14 text-center sm:py-16",
        className
      )}
      role="alert"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-md border border-red-500/20 bg-red-500/10 text-red-400">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-subheading">{title}</h3>
      <p className="mt-2 max-w-md text-body text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
