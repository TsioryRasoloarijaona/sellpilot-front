"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Bot, Boxes, ChartNoAxesCombined, LayoutDashboard,
  LogOut, Menu, Package, Search, Settings, ShoppingBag, Store, Tags, X
} from "lucide-react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const nav = [
  { href: "/dashboard",            label: "Dashboard",    icon: LayoutDashboard },
  { href: "/dashboard/shops",      label: "Shops",        icon: Store },
  { href: "/dashboard/products",   label: "Products",     icon: Package },
  { href: "/dashboard/categories", label: "Categories",   icon: Tags },
  { href: "/dashboard/orders",     label: "Orders",       icon: ShoppingBag },
  { href: "/dashboard/analytics",  label: "Analytics",    icon: ChartNoAxesCombined },
  { href: "/dashboard/assistant",  label: "AI Assistant", icon: Bot },
  { href: "/dashboard/settings",   label: "Settings",     icon: Settings }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const owner = useAuthStore((state) => state.owner);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [open, setOpen] = useState(false);

  async function logout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    toast.success("Logged out");
    router.push("/");
  }

  const initials = (owner?.email || "SP").slice(0, 2).toUpperCase();

  const sidebar = (
    <aside className="flex h-full flex-col bg-card">
      {/* Brand */}
      <div className="flex h-14 items-center justify-between px-4 border-b">
        <Logo />
        <button className="lg:hidden rounded-lg p-1 text-muted-foreground hover:bg-muted" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Workspace</p>
        {nav.slice(0, 6).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-primary/[0.08] text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}

        <p className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Tools</p>
        {nav.slice(6).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-primary/[0.08] text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / logout */}
      <div className="border-t p-3 space-y-1">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {initials}
          </div>
          <p className="truncate text-xs font-medium text-foreground">{owner?.email || "owner@sellpilot.ai"}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 hidden w-56 border-r lg:block">{sidebar}</div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-56 border-r transform transition-transform duration-200 lg:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebar}
      </div>

      {/* Main */}
      <div className="lg:pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-md sm:px-5">
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="relative hidden flex-1 sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className="h-9 w-full max-w-sm rounded-lg border bg-muted/50 pl-8 pr-3 text-sm outline-none transition focus:bg-card focus:ring-2 focus:ring-ring"
              placeholder="Search…"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button size="icon" variant="ghost" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  text,
  action
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
      <Boxes className="mb-3 h-8 w-8 text-muted-foreground/50" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
