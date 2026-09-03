import { cn } from "@/lib/utils";

export function AuthShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">{children}</div>
        <h1 className="sr-only">{title}</h1>
        <p className="sr-only">{description}</p>
      </div>
    </div>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface-card p-5 sm:p-6", className)}>{children}</div>
  );
}

export function AuthAlert({
  children,
  variant = "error",
}: {
  children: React.ReactNode;
  variant?: "error" | "success";
}) {
  return (
    <div
      className={cn(
        "mb-4 rounded-md border px-3 py-2.5 text-sm",
        variant === "error"
          ? "border-red-500/20 bg-red-500/[0.06] text-red-400"
          : "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400"
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
