import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { cn } from "../ui";

export function Phone({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "relative w-[286px] shrink-0 rounded-[46px] bg-[#1a1c1b] p-[9px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_40px_70px_-30px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      <div className="relative h-[580px] overflow-hidden rounded-[37px] bg-white text-[#111111]">
        {children}
        <div className="pointer-events-none absolute left-1/2 top-[9px] z-30 h-[22px] w-[76px] -translate-x-1/2 rounded-full bg-[#0b0b0b]" />
      </div>
    </div>
  );
}

export function StatusBar({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div
      className={cn(
        "relative z-20 flex h-10 shrink-0 items-center justify-between px-6 text-[11px] font-semibold",
        tone === "dark" ? "text-[#111111]" : "text-white",
      )}
    >
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <Signal className="h-3 w-3" strokeWidth={2.5} />
        <Wifi className="h-3 w-3" strokeWidth={2.5} />
        <BatteryFull className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    </div>
  );
}
