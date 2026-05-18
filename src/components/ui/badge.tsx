import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "muted" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "default" && "bg-blue-500/10 text-blue-600 dark:text-blue-300",
        variant === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
        variant === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-300",
        variant === "danger" && "bg-red-500/10 text-red-600 dark:text-red-300",
        variant === "muted" && "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
