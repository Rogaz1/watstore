"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn, WhatsAppGlyph } from "./ui";
import { LOGIN_HREF, NAV_LINKS, SIGNUP_HREF, supportUrl } from "../_lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-5">
      <div className="pointer-events-auto mx-auto flex h-[60px] max-w-[1120px] items-center justify-between gap-3 rounded-full border border-line/80 bg-white/85 pl-5 pr-2 shadow-[0_1px_0_rgba(17,17,16,0.02),0_10px_30px_-12px_rgba(17,17,16,0.18)] backdrop-blur-xl">
        <Link aria-label="Floxto home" className="flex h-11 items-center" href="/">
          <Logo priority />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2.5 text-[15px] font-medium text-ink-2 transition-colors hover:bg-paper hover:text-ink",
                pathname === link.href && "bg-paper text-ink",
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            className="hidden h-11 items-center rounded-full px-4 text-[15px] font-semibold text-ink transition-colors hover:bg-paper lg:flex"
            href={LOGIN_HREF}
          >
            Log in
          </Link>
          <Link
            className="flex h-11 items-center rounded-full bg-ink px-5 text-[15px] font-semibold text-white transition-transform duration-200 active:scale-[0.97]"
            href={SIGNUP_HREF}
          >
            Sign up
          </Link>

          <Dialog.Root onOpenChange={setOpen} open={open}>
            <Dialog.Trigger asChild>
              <button
                aria-label="Open menu"
                className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-paper lg:hidden"
                type="button"
              >
                <Menu aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={2} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Content
                aria-describedby={undefined}
                className="mk-menu fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-paper px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.625rem,env(safe-area-inset-top))] text-ink lg:hidden"
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <div className="flex h-[60px] shrink-0 items-center justify-between pl-2">
                  <Link
                    aria-label="Floxto home"
                    className="flex h-11 items-center"
                    href="/"
                    onClick={() => setOpen(false)}
                  >
                    <Logo />
                  </Link>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Close menu"
                      className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-[0_0_0_1px_var(--color-line)]"
                      type="button"
                    >
                      <X aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
                    </button>
                  </Dialog.Close>
                </div>

                <nav aria-label="Main" className="mt-6 flex flex-col">
                  {NAV_LINKS.map((link, index) => (
                    <Link
                      aria-current={pathname === link.href ? "page" : undefined}
                      className="mk-menu-item flex items-center justify-between border-b border-line py-[18px] text-[28px] font-semibold leading-none"
                      href={link.href}
                      key={link.href}
                      onClick={() => setOpen(false)}
                      style={{ animationDelay: `${60 + index * 45}ms` }}
                    >
                      {link.label}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-6 w-6 text-ink-3"
                        strokeWidth={1.75}
                      />
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-3 pt-10">
                  <Link
                    className="flex h-14 items-center justify-center rounded-full bg-ink text-base font-semibold text-white"
                    href={SIGNUP_HREF}
                    onClick={() => setOpen(false)}
                  >
                    Create your store
                  </Link>
                  <Link
                    className="flex h-14 items-center justify-center rounded-full bg-white text-base font-semibold text-ink shadow-[0_0_0_1px_var(--color-line)]"
                    href={LOGIN_HREF}
                    onClick={() => setOpen(false)}
                  >
                    Log in
                  </Link>
                  <a
                    className="mt-2 flex min-h-11 items-center justify-center gap-2 text-[15px] font-medium text-ink-2"
                    href={supportUrl()}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <WhatsAppGlyph className="h-[18px] w-[18px] text-brand-deep" />
                    Chat with us on WhatsApp
                  </a>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
