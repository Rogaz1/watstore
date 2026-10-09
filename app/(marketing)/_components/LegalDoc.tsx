import type { ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Container, Lead, WhatsAppGlyph } from "./ui";
import { supportUrl } from "../_lib/site";

/** A paragraph, or a bulleted list with an optional lead-in line. */
export type LegalBlock = string | { intro?: string; items: string[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

type LegalDocProps = {
  title: ReactNode;
  lead: string;
  updated: string;
  summary: string[];
  sections: LegalSection[];
};

function Contents({ sections }: { sections: LegalSection[] }) {
  return (
    <ol className="flex flex-col">
      {sections.map((section, index) => (
        <li key={section.id}>
          <a
            className="flex min-h-11 items-center gap-3 text-[15px] font-medium leading-snug text-ink-2 transition-colors hover:text-ink"
            href={`#${section.id}`}
          >
            <span className="w-5 shrink-0 text-ink-3">{index + 1}.</span>
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function LegalDoc({ title, lead, updated, summary, sections }: LegalDocProps) {
  return (
    <>
      <section className="pt-[calc(108px+env(safe-area-inset-top))] lg:pt-[168px]">
        <Container>
          <h1 className="mk-enter max-w-3xl text-balance text-[40px] font-bold leading-[1.02] tracking-[-0.04em] sm:text-[56px] lg:text-[68px]">
            {title}
          </h1>
          <div className="mk-enter mt-5" style={{ "--i": 1 } as React.CSSProperties}>
            <Lead className="max-w-[46ch]">{lead}</Lead>
            <p className="mt-4 text-[15px] font-medium text-ink-3">Last updated: {updated}</p>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-20" data-cta-zone>
        <Container className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-16">
          <details className="group rounded-[24px] border border-line bg-white lg:hidden">
            <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-3 px-5 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
              On this page
              <ChevronDown
                aria-hidden="true"
                className="h-5 w-5 text-ink-3 transition-transform duration-300 group-open:rotate-180"
                strokeWidth={2.25}
              />
            </summary>
            <div className="px-5 pb-4">
              <Contents sections={sections} />
            </div>
          </details>

          <nav aria-label="On this page" className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <div className="rounded-[24px] border border-line bg-white p-5">
              <h2 className="text-[15px] font-bold">On this page</h2>
              <div className="mt-2">
                <Contents sections={sections} />
              </div>
            </div>
          </nav>

          <div className="min-w-0 max-w-[68ch]">
            <div className="rounded-[24px] bg-brand-tint p-6 sm:p-8">
              <h2 className="text-[20px] font-bold tracking-[-0.02em]">The short version</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {summary.map((point) => (
                  <li className="flex items-start gap-3 text-base leading-snug text-ink-2" key={point}>
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-white">
                      <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3.25} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[15px] leading-snug text-ink-3">
                This summary is here to help. The full text below is what applies.
              </p>
            </div>

            {sections.map((section, index) => (
              <section className="scroll-mt-28 border-b border-line py-10 last:border-b-0" id={section.id} key={section.id}>
                <h2 className="text-[24px] font-bold leading-tight tracking-[-0.025em] sm:text-[28px]">
                  <span className="mr-2 text-ink-3">{index + 1}.</span>
                  {section.title}
                </h2>
                <div className="mt-4 flex flex-col gap-4">
                  {section.blocks.map((block, blockIndex) =>
                    typeof block === "string" ? (
                      <p className="text-[17px] leading-[1.65] text-ink-2" key={blockIndex}>
                        {block}
                      </p>
                    ) : (
                      <div key={blockIndex}>
                        {block.intro ? (
                          <p className="text-[17px] leading-[1.65] text-ink-2">{block.intro}</p>
                        ) : null}
                        <ul className="mt-3 flex flex-col gap-2.5">
                          {block.items.map((item) => (
                            <li
                              className="flex items-start gap-3 text-[17px] leading-[1.55] text-ink-2"
                              key={item}
                            >
                              <span
                                aria-hidden="true"
                                className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-deep"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ),
                  )}
                </div>
              </section>
            ))}

            <div className="mt-4 flex flex-col gap-5 rounded-[24px] border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="text-[20px] font-bold tracking-[-0.02em]">Questions about this page?</h2>
                <p className="mt-1.5 text-base text-ink-2">Message us and we will explain.</p>
              </div>
              <a
                className="inline-flex h-14 shrink-0 items-center justify-center gap-2.5 rounded-full bg-ink px-6 text-base font-semibold text-white transition-transform active:scale-[0.98]"
                href={supportUrl("Hello Floxto, I have a question about your terms or privacy policy.")}
                rel="noopener noreferrer"
                target="_blank"
              >
                <WhatsAppGlyph className="h-5 w-5 text-brand" />
                Message us
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
