import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center sm:py-16",
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-zinc-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-subheading">{title}</h3>
      <p className="mt-2 max-w-md text-body text-sm">{description}</p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href}>
              <Button variant="secondary" size="sm">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
