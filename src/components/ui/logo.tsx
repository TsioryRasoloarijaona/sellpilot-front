import Link from "next/link";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-glow">
        <Bot className="h-5 w-5" />
      </span>
      <span>SellPilot</span>
    </Link>
  );
}
