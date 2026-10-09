import type { Metadata } from "next";
import { Phone } from "../_components/mock/Phone";
import {
  ChatScreen,
  DashboardScreen,
  ProductScreen,
  StorefrontScreen,
} from "../_components/mock/screens";
import { FaqSection, FinalCta, PageIntro } from "../_components/sections";
import { StepList } from "../_components/Steps";
import { Accent, Container, Lead, SectionHeading } from "../_components/ui";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Create your store, add your products and share one link. Customers browse and send their order to your WhatsApp. See how Floxto works, step by step.",
  alternates: { canonical: "/how-it-works" },
};

const JOURNEY = [
  {
    caption: "They open your link",
    detail: "From your bio, a status or an ad.",
    screen: <StorefrontScreen />,
  },
  {
    caption: "They choose a product",
    detail: "Photos, price and details in one place.",
    screen: <ProductScreen />,
  },
  {
    caption: "They fill a short form",
    detail: "Quantity, name and delivery location.",
    screen: <ProductScreen sheetOpen />,
  },
  {
    caption: "You get the order",
    detail: "One clear message in your WhatsApp.",
    screen: <ChatScreen />,
  },
  {
    caption: "You keep track",
    detail: "The order is saved in your dashboard.",
    screen: <DashboardScreen />,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        lead="There is no website to build and nothing technical to learn. You fill in a few details, add your products and share your link."
        title={
          <>
            From sign up to first order, in <Accent>four steps.</Accent>
          </>
        }
      />

      <section className="py-14 lg:py-24">
        <Container>
          <div className="rounded-[32px] border border-line bg-white px-5 py-10 sm:px-10 lg:rounded-[40px] lg:px-16 lg:py-16">
            <StepList className="mx-auto max-w-2xl" />
          </div>
        </Container>
      </section>

      <section className="mk-on-night overflow-hidden bg-night py-20 text-night-text lg:py-28">
        <Container>
          <SectionHeading className="mk-reveal max-w-2xl">
            What your customer <Accent>sees.</Accent>
          </SectionHeading>
          <Lead className="mk-reveal mt-4 max-w-[44ch]" tone="night">
            An order takes a few taps. Swipe through to follow one from the first tap to your
            dashboard.
          </Lead>
        </Container>
        <ol className="mk-rail mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8 lg:justify-center">
          {JOURNEY.map((stage, index) => (
            <li className="shrink-0 snap-center" key={stage.caption}>
              <div aria-hidden="true">
                <Phone>{stage.screen}</Phone>
              </div>
              <p className="mt-5 flex items-baseline gap-2 text-[19px] font-bold tracking-[-0.02em]">
                <span className="text-brand">{index + 1}.</span>
                {stage.caption}
              </p>
              <p className="mt-1 max-w-[286px] text-[15px] leading-snug text-night-muted">
                {stage.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <FaqSection limit={4} />
      <FinalCta />
    </>
  );
}
