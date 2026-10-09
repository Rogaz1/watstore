"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "./ui";
import { SIGNUP_HREF } from "../_lib/site";

/**
 * Phone-only bar that keeps signup one tap away. It stays out of the way
 * whenever a section marked with `data-cta-zone` already shows a signup button.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const zones = Array.from(document.querySelectorAll("[data-cta-zone]"));
    const inView = new Set<Element>();
    let pastTop = false;

    const update = () => setVisible(pastTop && inView.size === 0);

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          inView.add(entry.target);
        } else {
          inView.delete(entry.target);
        }
      }
      update();
    });
    zones.forEach((zone) => observer.observe(zone));

    const onScroll = () => {
      const next = window.scrollY > 320;
      if (next !== pastTop) {
        pastTop = next;
        update();
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[130%] opacity-0",
      )}
    >
      <Link
        className="mx-auto flex h-[60px] max-w-md items-center justify-between rounded-full bg-ink pl-6 pr-2 text-white shadow-[0_18px_40px_-12px_rgba(17,17,16,0.55)]"
        href={SIGNUP_HREF}
        tabIndex={visible ? 0 : -1}
      >
        <span className="text-[15px] font-semibold">Create your Floxto store</span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-ink">
          <ArrowRight aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
        </span>
      </Link>
    </div>
  );
}
