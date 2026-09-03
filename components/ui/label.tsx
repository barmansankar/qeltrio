import { cn } from "@/lib/utils";

export function Label({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-label", className)}
    >
      {children}
    </label>
  );
}
