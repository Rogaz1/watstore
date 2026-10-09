"use client";

import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { DEMO_STORE, type DemoStore } from "./mock/demo";
import { Phone } from "./mock/Phone";
import { ChatScreen, DashboardScreen, ProductScreen, StorefrontScreen } from "./mock/screens";
import { Accent, cn } from "./ui";
import { PENDING_STORE_NAME_KEY, SIGNUP_HREF } from "../_lib/site";

const SLIDES = [
  { id: "store", caption: "Your storefront" },
  { id: "product", caption: "A page for every product" },
  { id: "order", caption: "A short order form" },
  { id: "chat", caption: "The order, in your WhatsApp" },
  { id: "dashboard", caption: "Every order saved for you" },
] as const;

const SLIDE_MS = 3600;
const NAME_MAX = 32;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Signed distance of a slide from the one in front, wrapped around the ring. */
function ringOffset(index: number, active: number) {
  const count = SLIDES.length;
  let distance = index - active;
  if (distance > count / 2) distance -= count;
  if (distance < -count / 2) distance += count;
  return distance;
}

function slideStyle(distance: number): React.CSSProperties {
  const side = Math.sign(distance);
  const far = Math.abs(distance) > 1;

  if (distance === 0) {
    return { transform: "translateX(-50%)", opacity: 1, zIndex: 30 };
  }

  return {
    transform: `translateX(calc(-50% + ${side} * var(--hero-gap) * ${far ? 1.75 : 1})) translateY(${far ? 9 : 5}%) rotateY(${-side * (far ? 42 : 30)}deg) scale(${far ? 0.66 : 0.82})`,
    opacity: far ? 0 : 0.5,
    zIndex: far ? 10 : 20,
  };
}

/**
 * The homepage hero. A visitor types their business name and sees it become
 * a store in the screens above, then carries that name into signup.
 */
export function Hero() {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [typing, setTyping] = useState(false);

  const trimmedName = name.trim();
  const store: DemoStore = useMemo(
    () =>
      trimmedName
        ? {
            name: trimmedName,
            slug: toSlug(trimmedName) || "your-shop",
            tagline: "Welcome to our store.",
            initial: trimmedName.charAt(0).toUpperCase(),
          }
        : DEMO_STORE,
    [trimmedName],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onScreen = false;
    const sync = () => setPlaying(onScreen && !document.hidden && !reducedMotion.matches);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.3 },
    );
    observer.observe(stage);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  const running = playing && !typing;

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % SLIDES.length),
      SLIDE_MS,
    );

    return () => window.clearTimeout(timer);
  }, [running, active]);

  function step(direction: 1 | -1) {
    setActive((current) => (current + direction + SLIDES.length) % SLIDES.length);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (trimmedName) {
        window.localStorage.setItem(PENDING_STORE_NAME_KEY, trimmedName);
      } else {
        window.localStorage.removeItem(PENDING_STORE_NAME_KEY);
      }
    } catch {}

    track("hero_create_store", { typed_name: Boolean(trimmedName) });
    router.push(SIGNUP_HREF);
  }

  return (
    <section
      className="mk-on-night relative overflow-hidden rounded-b-[36px] bg-night text-night-text lg:rounded-b-[48px]"
      data-cta-zone
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[78%] bg-[radial-gradient(70%_60%_at_50%_30%,rgba(37,211,102,0.26),transparent_70%)]"
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1120px] flex-col pt-[calc(80px+env(safe-area-inset-top))] lg:grid lg:min-h-[780px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-16 lg:pt-[120px]">
        {/* The shop window: a ring of real screens. */}
        <div
          aria-hidden="true"
          className="mk-enter relative min-h-[230px] flex-1 touch-pan-y select-none [--hero-gap:148px] lg:order-2 lg:h-[620px] lg:flex-none lg:[--hero-gap:230px]"
          onPointerCancel={() => {
            dragStart.current = null;
          }}
          onPointerDown={(event) => {
            dragStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (dragStart.current === null) {
              return;
            }
            const moved = event.clientX - dragStart.current;
            dragStart.current = null;
            if (Math.abs(moved) > 36) {
              step(moved < 0 ? 1 : -1);
            }
          }}
          ref={stageRef}
        >
          <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_62%,transparent_97%)] [perspective:1100px] lg:[mask-image:none]">
            <div
              className="absolute left-1/2 top-[46%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07] lg:h-[560px] lg:w-[560px]"
            />
            <div
              className="absolute left-1/2 top-[46%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05] lg:h-[820px] lg:w-[820px]"
            />
            {SLIDES.map((slide, index) => {
              const distance = ringOffset(index, active);

              return (
                <div
                  className={cn(
                    "absolute left-1/2 top-1 origin-center transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
                    distance !== 0 && Math.abs(distance) === 1 && "cursor-pointer",
                  )}
                  key={slide.id}
                  onClick={() => {
                    if (distance !== 0) {
                      setActive(index);
                    }
                  }}
                  style={slideStyle(distance)}
                >
                  <Phone className="[zoom:0.6] lg:[zoom:0.96] [@media(min-height:760px)]:[zoom:0.7] lg:[@media(min-height:760px)]:[zoom:0.96]">
                    {slide.id === "store" ? <StorefrontScreen store={store} /> : null}
                    {slide.id === "product" ? <ProductScreen /> : null}
                    {slide.id === "order" ? <ProductScreen sheetOpen={distance === 0} /> : null}
                    {slide.id === "chat" ? <ChatScreen active={distance === 0} /> : null}
                    {slide.id === "dashboard" ? (
                      <DashboardScreen active={distance === 0} store={store} />
                    ) : null}
                  </Phone>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex flex-col px-5 pb-7 lg:order-1 lg:px-0 lg:pb-0">
          <div className="mb-4 flex items-center gap-3 lg:order-last lg:mb-0 lg:mt-12">
            <div className="flex gap-1">
              {SLIDES.map((slide, index) => (
                <button
                  aria-current={index === active ? "step" : undefined}
                  aria-label={`Show: ${slide.caption}`}
                  className="group flex h-11 w-6 items-center"
                  key={slide.id}
                  onClick={() => setActive(index)}
                  type="button"
                >
                  <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/20">
                    <span
                      className={cn(
                        "absolute inset-0 origin-left rounded-full bg-brand",
                        index !== active && "scale-x-0",
                        index === active && (running ? "mk-progress" : "scale-x-100"),
                      )}
                      key={index === active ? `on-${active}` : "off"}
                      style={index === active ? { animationDuration: `${SLIDE_MS}ms` } : undefined}
                    />
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[14px] font-medium text-night-muted">{SLIDES[active].caption}</p>
          </div>

          <h1
            className={cn(
              "text-balance font-bold leading-[1.0] tracking-[-0.045em] [overflow-wrap:anywhere] lg:text-[72px]",
              trimmedName.length > 16
                ? "text-[34px] sm:text-[52px]"
                : "text-[41px] sm:text-[60px] [@media(max-height:680px)]:text-[37px]",
            )}
          >
            {trimmedName || "Your WhatsApp business"}, now a <Accent>real store.</Accent>
          </h1>

          <form action={SIGNUP_HREF} className="mt-6 lg:mt-9 lg:max-w-[480px]" onSubmit={handleSubmit}>
            <div className="flex h-[62px] items-center rounded-full bg-white p-1.5 pl-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] transition-shadow focus-within:shadow-[0_0_0_3px_rgba(37,211,102,0.55)]">
              <label className="sr-only" htmlFor="hero-store-name">
                Your business name
              </label>
              <input
                autoCapitalize="words"
                autoComplete="organization"
                className="mk-bare-focus h-full min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-ink-3"
                enterKeyHint="go"
                id="hero-store-name"
                maxLength={NAME_MAX}
                name="store"
                onBlur={() => setTyping(false)}
                onChange={(event) => {
                  setName(event.target.value);
                  setActive(0);
                }}
                onFocus={() => {
                  setTyping(true);
                  setActive(0);
                }}
                placeholder="Your business name"
                type="text"
                value={name}
              />
              <button
                className="flex h-full shrink-0 items-center gap-2 rounded-full bg-brand pl-5 pr-4 text-[15px] font-bold text-ink transition-transform duration-200 active:scale-[0.97]"
                type="submit"
              >
                Create store
                <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
