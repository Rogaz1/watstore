"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn, Cta } from "./ui";
import { PLAN_FEATURES, PRICING, SIGNUP_HREF } from "../_lib/site";

type Cycle = "monthly" | "annual";

const CYCLES: Array<{ id: Cycle; label: string }> = [
  { id: "annual", label: "Annual" },
  { id: "monthly", label: "Monthly" },
];

const ANNUAL_PER_MONTH = Math.round(PRICING.annual / 12);

export function PricingPlans() {
  const [cycle, setCycle] = useState<Cycle>("annual");
  const isAnnual = cycle === "annual";

  return (
    <div
      className="overflow-hidden rounded-[32px] border border-line bg-white shadow-[0_30px_60px_-40px_rgba(17,17,16,0.35)]"
      data-cta-zone
    >
      <div className="p-6 sm:p-8">
        <div
          aria-label="Billing period"
          className="grid grid-cols-2 rounded-full bg-paper p-1"
          role="radiogroup"
        >
          {CYCLES.map((option) => (
            <button
              aria-checked={cycle === option.id}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-300",
                cycle === option.id ? "bg-ink text-white" : "text-ink-2",
              )}
              key={option.id}
              onClick={() => setCycle(option.id)}
              role="radio"
              type="button"
            >
              {option.label}
              {option.id === "annual" ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-bold transition-colors duration-300",
                    cycle === "annual" ? "bg-brand text-ink" : "bg-brand-tint text-brand-deep",
                  )}
                >
                  Save {PRICING.symbol}
                  {PRICING.annualSaving}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <p className="mt-8 flex items-baseline gap-2">
          <span className="text-[64px] font-bold leading-none tracking-[-0.05em]">
            {PRICING.symbol}
            {isAnnual ? PRICING.annual : PRICING.monthly}
          </span>
          <span className="text-lg font-medium text-ink-3">{isAnnual ? "a year" : "a month"}</span>
        </p>
        <p className="mt-3 min-h-[1.5rem] text-base text-ink-2">
          {isAnnual ? `About ${PRICING.symbol}${ANNUAL_PER_MONTH} a month. Best value.` : "Pay month by month."}
        </p>

        <Cta className="mt-7 sm:w-full" href={SIGNUP_HREF}>
          Get the {isAnnual ? "annual" : "monthly"} plan
        </Cta>
        <p className="mt-3 text-center text-sm text-ink-3">
          Every feature included. No hidden fees.
        </p>
      </div>

      <div className="border-t border-line bg-paper/60 p-6 sm:p-8">
        <p className="text-[15px] font-semibold">Both options include everything</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {PLAN_FEATURES.map((feature) => (
            <li className="flex items-start gap-3 text-[15px] leading-snug text-ink-2" key={feature}>
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-ink">
                <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3.25} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
