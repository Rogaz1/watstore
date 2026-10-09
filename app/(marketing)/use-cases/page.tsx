import type { Metadata } from "next";
import { Check } from "lucide-react";
import { FinalCta, PageIntro } from "../_components/sections";
import { Accent, cn, Container } from "../_components/ui";
import { USE_CASES } from "../_lib/useCases";

export const metadata: Metadata = {
  title: "Who it's for",
  description:
    "Floxto is made for small businesses that sell on WhatsApp: fashion, beauty, food, supplements, electronics and handmade goods.",
  alternates: { canonical: "/use-cases" },
};

export default function UseCasesPage() {
  return (
    <>
      <PageIntro
        lead="If your customers message you to buy, Floxto fits. Here is how different sellers use it."
        title={
          <>
            Built for businesses that sell <Accent>in the chat.</Accent>
          </>
        }
      />

      <nav aria-label="Business types" className="mt-8">
        <ul className="mk-rail mx-auto flex max-w-[1120px] gap-2 overflow-x-auto px-5 pb-1 sm:px-8">
          {USE_CASES.map((useCase) => (
            <li className="shrink-0" key={useCase.id}>
              <a
                className="flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-[15px] font-semibold transition-colors hover:border-ink/30"
                href={`#${useCase.id}`}
              >
                <useCase.icon aria-hidden="true" className="h-4 w-4 text-brand-deep" strokeWidth={2.25} />
                {useCase.title.split(" and ")[0]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="py-10 lg:py-16">
        <Container className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {USE_CASES.map((useCase, index) => {
            const night = index % 3 === 1;

            return (
              <article
                className={cn(
                  "mk-reveal scroll-mt-28 rounded-[32px] p-6 sm:p-9",
                  night ? "mk-on-night bg-night text-night-text" : "border border-line bg-white",
                )}
                id={useCase.id}
                key={useCase.id}
              >
                <span
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-full",
                    night ? "bg-brand text-ink" : "bg-brand-tint text-brand-deep",
                  )}
                >
                  <useCase.icon aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
                </span>
                <h2 className="mt-7 text-[28px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[32px]">
                  {useCase.title}
                </h2>
                <p
                  className={cn(
                    "mt-3 max-w-[44ch] text-[17px] leading-relaxed",
                    night ? "text-night-muted" : "text-ink-2",
                  )}
                >
                  {useCase.body}
                </p>
                <ul
                  className={cn(
                    "mt-6 flex flex-col gap-3 border-t pt-6",
                    night ? "border-night-line" : "border-line",
                  )}
                >
                  {useCase.points.map((point) => (
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
              </article>
            );
          })}
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
