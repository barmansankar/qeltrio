"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center py-2", className)}
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
    </div>
  );
}
