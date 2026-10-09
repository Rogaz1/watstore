import type { Metadata } from "next";
import { LegalDoc } from "../_components/LegalDoc";
import { Accent } from "../_components/ui";
import { LEGAL_UPDATED, TERMS_SECTIONS, TERMS_SUMMARY } from "../_lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using Floxto: your account, the free trial and plans, your store content, your customers and what is not allowed.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDoc
      lead="These are the rules for using Floxto. We have written them in plain language so you know where you stand."
      sections={TERMS_SECTIONS}
      summary={TERMS_SUMMARY}
      title={
        <>
          Terms of <Accent>Service.</Accent>
        </>
      }
      updated={LEGAL_UPDATED}
    />
  );
}
