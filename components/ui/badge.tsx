import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "accent" | "outline";
  className?: string;
}

const variants = {
  default: "bg-zinc-800/80 text-zinc-300 border border-[var(--border)]",
  success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/15",
  danger: "bg-red-500/10 text-red-400 border border-red-500/15",
  accent: "bg-[var(--accent-subtle)] text-violet-300 border border-violet-500/15",
  outline: "bg-transparent text-zinc-500 border border-[var(--border)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
