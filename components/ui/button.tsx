import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-zinc-100 text-zinc-900 hover:bg-white active:bg-zinc-200 border border-transparent",
  secondary:
    "bg-[var(--surface-elevated)] text-zinc-100 hover:bg-[var(--surface-hover)] border border-[var(--border)]",
  ghost: "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100 border border-transparent",
  danger:
    "bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/20",
  outline:
    "border border-[var(--border)] bg-transparent text-zinc-300 hover:bg-white/[0.03] hover:border-[var(--border-hover)] hover:text-zinc-100",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-9 px-4 text-sm gap-2 rounded-md",
  lg: "h-11 px-5 text-sm gap-2 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer",
        "focus-ring disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
