import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <Image src="/bubble.svg" alt="SellPilot" width={36} height={36} className="rounded-xl shadow-glow" />
      <span>SellPilot</span>
    </Link>
  );
}
