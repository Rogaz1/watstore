import Link from "next/link";
import { Logo } from "./Logo";
import { Container, WhatsAppGlyph } from "./ui";
import { LOGIN_HREF, SIGNUP_HREF, supportUrl } from "../_lib/site";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/use-cases", label: "Who it's for" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: SIGNUP_HREF, label: "Start free trial" },
      { href: LOGIN_HREF, label: "Log in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mk-on-night bg-night text-night-text" data-cta-zone>
      <Container className="pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-14 lg:pb-12 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo className="h-8 w-auto" tone="dark" />
            <p className="mt-4 max-w-[26ch] text-[17px] leading-relaxed text-night-muted">
              A proper online store for businesses that sell on WhatsApp.
            </p>
            <a
              className="mt-6 inline-flex h-12 items-center gap-2.5 rounded-full border border-night-line bg-night-2 px-5 text-[15px] font-semibold transition-colors hover:border-brand/50"
              href={supportUrl()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <WhatsAppGlyph className="h-[18px] w-[18px] text-brand" />
              Chat with us
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-medium text-night-muted">{column.title}</h2>
                <ul className="mt-3 flex flex-col">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="flex min-h-11 items-center text-base font-medium transition-colors hover:text-brand"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-night-line pt-6 text-sm text-night-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Floxto. All rights reserved.</p>
          <p>Simple. Fast. Professional.</p>
        </div>
      </Container>
    </footer>
  );
}
