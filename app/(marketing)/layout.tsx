import type { Metadata, Viewport } from "next";
import { MarketingTheme } from "./_components/MarketingTheme";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
import { StickyCta } from "./_components/StickyCta";
import "./marketing.css";

const TITLE = "Floxto: a proper online store for your WhatsApp business";
const DESCRIPTION =
  "Put your products on one clean store link. Customers browse, tap order, and every detail arrives in your WhatsApp already organised. Free for 30 days.";

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: "%s | Floxto",
  },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Floxto",
    type: "website",
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F4EE",
  viewportFit: "cover",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk flex min-h-dvh flex-col bg-paper text-ink">
      <MarketingTheme />
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        href="#main"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main className="flex-1" id="main">
        {children}
      </main>
      <SiteFooter />
      <StickyCta />
    </div>
  );
}
