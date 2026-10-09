import type { Metadata } from "next";
import { Faq } from "../_components/Faq";
import { FinalCta, PageIntro } from "../_components/sections";
import { Accent, Container, WhatsAppGlyph } from "../_components/ui";
import { FAQS, supportUrl } from "../_lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Floxto: how orders work, how you get paid, pricing, currencies, languages and support.",
  alternates: { canonical: "/faq" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <PageIntro
        lead="Short, straight answers. If yours is not here, message us and we will help."
        title={
          <>
            Questions, <Accent>answered.</Accent>
          </>
        }
      />

      <section className="py-12 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Faq items={FAQS} />

            <div className="mk-reveal mt-6 flex flex-col gap-5 rounded-[28px] bg-brand-tint p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="text-[22px] font-bold leading-tight tracking-[-0.02em]">
                  Still have a question?
                </h2>
                <p className="mt-1.5 text-base text-ink-2">We reply on WhatsApp.</p>
              </div>
              <a
                className="inline-flex h-14 shrink-0 items-center justify-center gap-2.5 rounded-full bg-ink px-6 text-base font-semibold text-white transition-transform active:scale-[0.98]"
                href={supportUrl()}
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

      <FinalCta />
    </>
  );
}
