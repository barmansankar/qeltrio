import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 focus-ring rounded-md",
        className
      )}
      aria-label="Qeltrio.AI home"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md accent-gradient text-xs font-semibold text-white">
        Q
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-white">
        Qeltrio<span className="text-violet-400/90">.AI</span>
      </span>
    </Link>
  );
}
