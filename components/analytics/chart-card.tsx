import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  action,
  badge,
  children,
  className,
}: ChartCardProps) {
  return (
    <section className={cn("surface-card p-5 sm:p-6", className)}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-subheading text-base">{title}</h2>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-body text-sm">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
