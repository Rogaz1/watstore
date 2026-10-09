import type { Metadata } from "next";
import { Faq } from "../_components/Faq";
import { PricingPlans } from "../_components/PricingPlans";
import { FinalCta, PageIntro } from "../_components/sections";
import { Accent, Container, SectionHeading } from "../_components/ui";
import { PRICING, type FaqItem } from "../_lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Try Floxto free for 30 days with no payment needed. Then ₵39 a month or ₵299 a year, with every feature included.",
  alternates: { canonical: "/pricing" },
};

const PAYING_STEPS = [
  {
    title: "Create your account",
    body: "Sign up and your store is ready to use right away. No payment needed to start.",
  },
  {
    title: "Message us to subscribe",
    body: "When you are ready, tap upgrade in your dashboard. It opens a WhatsApp chat with our team.",
  },
  {
    title: "We activate your plan",
    body: "Once your payment is confirmed, we switch on your monthly or annual plan and your store keeps running.",
  },
];

const PRICING_FAQS: FaqItem[] = [
  {
    question: "Do I need to pay to start?",
    answer:
      "No. You sign up with an email address and a password. There is no payment form anywhere on Floxto.",
  },
  {
    question: "Does Floxto take a percentage of my sales?",
    answer:
      "No. Floxto never handles your customers' money, so there is no commission and no fee per order. You pay the plan price and nothing else.",
  },
  {
    question: "What is the difference between monthly and annual?",
    answer: `Nothing except the price. Both include every feature. The annual plan costs ${PRICING.symbol}${PRICING.annual} and saves you ${PRICING.symbol}${PRICING.annualSaving} compared with paying monthly for a year.`,
  },
  {
    question: "What happens if I do not subscribe after the trial?",
    answer:
      "Your store goes offline and customers see a message that it is temporarily unavailable. Subscribe at any time to bring it back.",
  },
  {
    question: "How do I renew?",
    answer:
      "Message us on WhatsApp before your plan ends. Your dashboard shows your plan and when it renews.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageIntro
        lead="Every feature is included, whichever plan you choose. Pay monthly or annually, however suits your business."
        title={
          <>
            One simple price. <Accent>Everything</Accent> included.
          </>
        }
      />

      <section className="py-12 lg:py-20">
        <Container>
          <div className="mx-auto max-w-xl">
            <PricingPlans />
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <Container>
          <SectionHeading className="mk-reveal max-w-2xl">
            How paying <Accent>works.</Accent>
          </SectionHeading>
          <ol className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
            {PAYING_STEPS.map((step, index) => (
              <li
                className="mk-reveal rounded-[28px] border border-line bg-paper p-6 sm:p-8"
                key={step.title}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-[15px] font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-[22px] font-bold leading-tight tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading className="mk-reveal lg:sticky lg:top-32 lg:self-start">
            Pricing <Accent>questions.</Accent>
          </SectionHeading>
          <div className="mk-reveal">
            <Faq items={PRICING_FAQS} />
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
