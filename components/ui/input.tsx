import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          className={cn(
            "flex h-10 w-full rounded-md border bg-[var(--surface)] px-3 py-2 text-sm text-zinc-100",
            "placeholder:text-zinc-600 transition-colors duration-150",
            "focus-ring focus:border-violet-500/40",
            error
              ? "border-red-500/40"
              : "border-[var(--border)] hover:border-[var(--border-hover)]",
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
