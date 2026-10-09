import type { Metadata } from "next";
import { CircleHelp, Store, Wallet } from "lucide-react";
import { FinalCta, PageIntro } from "../_components/sections";
import { Accent, Container, Cta, TextLink, WhatsAppGlyph } from "../_components/ui";
import { supportUrl } from "../_lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Floxto team on WhatsApp for help with setting up your store, subscribing or renewing.",
  alternates: { canonical: "/contact" },
};

const TOPICS = [
  {
    icon: Store,
    title: "Setting up your store",
    body: "Stuck on a step or not sure what to add? We will walk you through it.",
    message: "Hello Floxto, I need help setting up my store.",
  },
  {
    icon: Wallet,
    title: "Subscribing or renewing",
    body: "Tell us which plan you want and we will activate it for you.",
    message: "Hello Floxto, I would like to subscribe or renew my plan.",
  },
  {
    icon: CircleHelp,
    title: "Anything else",
    body: "Questions before you sign up, feedback or a problem with your account.",
    message: "Hello Floxto, I have a question.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageIntro
        lead="We do support the same way you sell: on WhatsApp. Send us a message and we will reply."
        title={
          <>
            Talk to us on <Accent>WhatsApp.</Accent>
          </>
        }
      />

      <section className="py-12 lg:py-20">
        <Container>
          <div
            className="mk-enter flex flex-col gap-6 rounded-[32px] bg-brand p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:rounded-[40px]"
            data-cta-zone
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-brand">
                <WhatsAppGlyph className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-[26px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[32px]">
                  Chat with the Floxto team
                </h2>
                <p className="mt-2 max-w-[38ch] text-[17px] leading-relaxed text-ink/80">
                  Tap the button and WhatsApp opens with our number ready.
                </p>
              </div>
            </div>
            <Cta external href={supportUrl()}>
              Open WhatsApp
            </Cta>
          </div>

          <ul className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-3 lg:gap-6">
            {TOPICS.map((topic) => (
              <li className="mk-reveal" key={topic.title}>
                <a
                  className="group flex h-full flex-col rounded-[28px] border border-line bg-white p-6 transition-colors hover:border-ink/30 sm:p-8"
                  href={supportUrl(topic.message)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-tint text-brand-deep">
                    <topic.icon aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={2} />
                  </span>
                  <span className="mt-6 block text-[21px] font-bold leading-tight tracking-[-0.02em]">
                    {topic.title}
                  </span>
                  <span className="mt-2 block text-base leading-relaxed text-ink-2">
                    {topic.body}
                  </span>
                  <span className="mt-5 block text-[15px] font-semibold text-brand-deep underline decoration-brand-deep/30 decoration-2 underline-offset-[6px] group-hover:decoration-brand-deep">
                    Start this chat
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-ink-2">
            Looking for a quick answer?
            <TextLink href="/faq">Read the FAQ</TextLink>
          </p>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
