import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "muted" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
        variant === "default" && "bg-primary/10 text-primary dark:text-primary",
        variant === "success" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
        variant === "warning" && "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
        variant === "danger"  && "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
        variant === "muted"   && "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
