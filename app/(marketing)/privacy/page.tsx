import type { Metadata } from "next";
import { LegalDoc } from "../_components/LegalDoc";
import { Accent } from "../_components/ui";
import { LEGAL_UPDATED, PRIVACY_SECTIONS, PRIVACY_SUMMARY } from "../_lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What information Floxto collects from merchants, customers and visitors, why we collect it, who we share it with and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      lead="This page explains what we collect, why we collect it and the choices you have. It covers merchants, their customers and visitors to our website."
      sections={PRIVACY_SECTIONS}
      summary={PRIVACY_SUMMARY}
      title={
        <>
          Privacy <Accent>Policy.</Accent>
        </>
      }
      updated={LEGAL_UPDATED}
    />
  );
}
