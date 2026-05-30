import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "brand" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
};

const variants = {
  /* Solid indigo – default interactive actions */
  primary:     "bg-primary text-primary-foreground shadow-glow-sm hover:bg-primary/90 active:scale-[.98]",
  /* Gradient – hero / marketing CTAs only */
  brand:       "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow hover:from-indigo-500 hover:to-violet-500 active:scale-[.98]",
  secondary:   "bg-muted text-foreground hover:bg-muted/70 active:scale-[.98]",
  ghost:       "text-muted-foreground hover:bg-muted hover:text-foreground",
  outline:     "border bg-transparent text-foreground hover:bg-muted active:scale-[.98]",
  destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm active:scale-[.98]"
};

const sizes = {
  sm:   "h-8 px-3 text-xs font-medium",
  md:   "h-9 px-4 text-sm",
  lg:   "h-11 px-6 text-sm font-semibold",
  icon: "h-9 w-9 p-0"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, { className: cn(classes, child.props.className) });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
