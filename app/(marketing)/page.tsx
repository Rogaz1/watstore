import type { Metadata, Viewport } from "next";
import { AuthGate } from "./_components/AuthGate";
import { ChatCompare } from "./_components/ChatCompare";
import { FeatureBento } from "./_components/FeatureBento";
import { Hero } from "./_components/Hero";
import { FaqSection, FinalCta, PricingSection, StepsSection } from "./_components/sections";
import { UseCaseRail } from "./_components/UseCaseRail";
import { PRICING } from "./_lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** The page opens on the dark hero, so the phone's status bar matches it. */
export const viewport: Viewport = {
  themeColor: "#0D110F",
  viewportFit: "cover",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Floxto",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://floxto.com",
  description:
    "An online store for businesses that sell on WhatsApp, with product pages and an order dashboard.",
  offers: [
    { "@type": "Offer", name: "Monthly", price: PRICING.monthly, priceCurrency: "GHS" },
    { "@type": "Offer", name: "Annual", price: PRICING.annual, priceCurrency: "GHS" },
  ],
};

export default function HomePage() {
  return (
    <>
      <AuthGate />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <Hero />
      <ChatCompare />
      <StepsSection />
      <FeatureBento />
      <UseCaseRail />
      <PricingSection />
      <FaqSection limit={5} />
      <FinalCta />
    </>
  );
}
