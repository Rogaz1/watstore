import type { ReactNode } from "react";
import { Faq } from "./Faq";
import { PricingPlans } from "./PricingPlans";
import { StepList } from "./Steps";
import { Accent, Container, Cta, Lead, SectionHeading, TextLink, WhatsAppGlyph } from "./ui";
import { FAQS, PRICING, SIGNUP_HREF, supportUrl } from "../_lib/site";

/** Top of every inner page. */
export function PageIntro({ title, lead }: { title: ReactNode; lead: string }) {
  return (
    <section className="pt-[calc(108px+env(safe-area-inset-top))] lg:pt-[168px]">
      <Container>
        <h1 className="mk-enter max-w-3xl text-balance text-[40px] font-bold leading-[1.02] tracking-[-0.04em] sm:text-[56px] lg:text-[68px]">
          {title}
        </h1>
        <div className="mk-enter mt-5" style={{ "--i": 1 } as React.CSSProperties}>
          <Lead className="max-w-[46ch]">{lead}</Lead>
        </div>
      </Container>
    </section>
  );
}

export function StepsSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="mk-reveal lg:sticky lg:top-32 lg:self-start">
          <SectionHeading>
            Set up once. Share <Accent>one link.</Accent>
          </SectionHeading>
          <Lead className="mt-4 max-w-[40ch]">
            You do not need a designer or a developer. If you can post on WhatsApp, you can
            open a Floxto store.
          </Lead>
          <TextLink className="mt-4" href="/how-it-works">
            See each step in detail
          </TextLink>
        </div>
        <StepList />
      </Container>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="py-20 lg:py-28" id="pricing">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div className="mk-reveal">
          <SectionHeading>
            One plan. <Accent>Two ways</Accent> to pay.
          </SectionHeading>
          <Lead className="mt-4 max-w-[40ch]">
            Pay {PRICING.symbol}
            {PRICING.monthly} a month, or {PRICING.symbol}
            {PRICING.annual} for the whole year, with every feature included.
          </Lead>
        </div>
        <div className="mk-reveal">
          <PricingPlans />
        </div>
      </Container>
    </section>
  );
}

export function FaqSection({ limit }: { limit?: number }) {
  const items = limit ? FAQS.slice(0, limit) : FAQS;

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="mk-reveal lg:sticky lg:top-32 lg:self-start">
          <SectionHeading>
            Questions, <Accent>answered.</Accent>
          </SectionHeading>
          <Lead className="mt-4 max-w-[36ch]">
            Not sure about something? Send us a message and we will reply.
          </Lead>
          <a
            className="mt-5 inline-flex h-12 items-center gap-2.5 rounded-full border border-line bg-paper px-5 text-[15px] font-semibold transition-colors hover:border-ink/30"
            href={supportUrl()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <WhatsAppGlyph className="h-[18px] w-[18px] text-brand-deep" />
            Ask us on WhatsApp
          </a>
        </div>
        <div className="mk-reveal">
          <Faq items={items} />
          {limit ? (
            <TextLink className="mt-5" href="/faq">
              Read all questions
            </TextLink>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-3 py-3 sm:px-5 sm:py-5" data-cta-zone>
      <div className="mk-reveal mx-auto max-w-[1120px] overflow-hidden rounded-[36px] bg-brand px-6 py-16 text-center text-ink sm:px-10 lg:rounded-[44px] lg:py-24">
        <h2 className="mx-auto max-w-[14ch] text-balance text-[40px] font-bold leading-[1] tracking-[-0.04em] sm:text-[56px] lg:text-[72px]">
          Open your store <Accent>today.</Accent>
        </h2>
        <p className="mx-auto mt-5 max-w-[30ch] text-[17px] leading-relaxed text-ink/80 sm:text-lg">
          Free for {PRICING.trialDays} days. No payment needed. Setting up takes a few minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Cta className="max-w-sm" href={SIGNUP_HREF}>
            Create my store
          </Cta>
          <a
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold underline decoration-ink/30 decoration-2 underline-offset-[6px] hover:decoration-ink"
            href={supportUrl()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <WhatsAppGlyph className="h-[18px] w-[18px]" />
            Or talk to us first
          </a>
        </div>
      </div>
    </section>
  );
}
