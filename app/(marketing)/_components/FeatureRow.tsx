import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./ui";

type FeatureRowProps = {
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
  tone?: "white" | "sand" | "night" | "tint";
  flip?: boolean;
};

const TONES = {
  white: "bg-white border border-line",
  sand: "bg-paper-2",
  night: "mk-on-night bg-night text-night-text",
  tint: "bg-brand-tint",
} as const;

/** One feature told in full: what it is, what it gives you, and how it looks. */
export function FeatureRow({ title, body, points, visual, tone = "white", flip }: FeatureRowProps) {
  const night = tone === "night";

  return (
    <article
      className={cn(
        "mk-reveal grid overflow-hidden rounded-[32px] lg:grid-cols-2 lg:items-center lg:rounded-[40px]",
        TONES[tone],
      )}
    >
      <div className={cn("px-6 pt-8 sm:px-10 lg:py-14", flip && "lg:order-2")}>
        <h2 className="text-balance text-[28px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[36px]">
          {title}
        </h2>
        <p
          className={cn(
            "mt-4 max-w-[42ch] text-[17px] leading-relaxed",
            night ? "text-night-muted" : "text-ink-2",
          )}
        >
          {body}
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {points.map((point) => (
            <li className="flex items-start gap-3 text-base leading-snug" key={point}>
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                  night ? "bg-brand text-ink" : "bg-ink text-white",
                )}
              >
                <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3.25} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div
        aria-hidden="true"
        className="mt-10 flex h-[380px] justify-center overflow-hidden lg:mt-0 lg:h-[520px] lg:items-start lg:pt-14"
      >
        {visual}
      </div>
    </article>
  );
}
