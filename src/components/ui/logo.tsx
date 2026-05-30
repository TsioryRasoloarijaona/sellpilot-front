import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <Image src="/cursor.svg" alt="" width={36} height={36} />
      <span className="text-base font-bold tracking-tight">SellPilot</span>
    </Link>
  );
}
