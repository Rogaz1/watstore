import { Copy, ImagePlus, Link2 } from "lucide-react";
import type { ReactNode } from "react";
import { DEMO_GALLERY, DEMO_PRODUCTS, DEMO_STORE } from "./mock/demo";
import { ProductPhoto } from "./mock/ProductPhoto";
import { OrderMessage, StatusPill } from "./mock/screens";
import { cn } from "./ui";

function LinkVisual() {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 shadow-[0_0_0_1px_var(--color-line)]">
      <Link2 aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={2.25} />
      <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink-3">
        floxto.com/store/<span className="font-bold text-ink">{DEMO_STORE.slug}</span>
      </p>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
        <Copy aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
      </span>
    </div>
  );
}

function ProductVisual() {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-[0_0_0_1px_var(--color-line)]">
      <div className="flex gap-2">
        {DEMO_GALLERY.map((photo, index) => (
          <span
            className="relative h-[72px] flex-1 overflow-hidden rounded-xl"
            key={photo}
            style={{ backgroundColor: DEMO_PRODUCTS[0].tile }}
          >
            <ProductPhoto sizes="96px" src={photo} />
            {index === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">
                Cover
              </span>
            ) : null}
          </span>
        ))}
        <span className="grid h-[72px] flex-1 place-items-center rounded-xl border border-dashed border-line text-ink-3">
          <ImagePlus aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <p className="truncate text-[15px] font-semibold">{DEMO_PRODUCTS[0].name}</p>
        <p className="text-[15px] font-bold">{DEMO_PRODUCTS[0].price}</p>
      </div>
    </div>
  );
}

const SHARE_PLACES = ["Instagram bio", "TikTok profile", "WhatsApp status", "Facebook page", "Your ads"];

function ShareVisual() {
  return (
    <ul className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_var(--color-line)]">
      {SHARE_PLACES.map((place, index) => (
        <li
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-[15px] font-medium",
            index > 0 && "border-t border-line",
          )}
          key={place}
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-deep" />
          {place}
        </li>
      ))}
    </ul>
  );
}

function OrderVisual() {
  return (
    <div className="rounded-2xl bg-[#EFE9E0] p-4">
      <div className="[zoom:1.18]">
        <OrderMessage className="max-w-[220px]" />
      </div>
      <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-ink-2">
        In your dashboard
        <StatusPill className="[zoom:1.2]" status="Pending" />
      </p>
    </div>
  );
}

export const STEPS: Array<{ title: string; body: string; visual: ReactNode }> = [
  {
    title: "Create your store",
    body: "Choose your store name and link, then add your logo and the WhatsApp number where orders should go.",
    visual: <LinkVisual />,
  },
  {
    title: "Add your products",
    body: "Up to five photos, a price, a short description, the key benefits and answers to common questions.",
    visual: <ProductVisual />,
  },
  {
    title: "Share one link",
    body: "Put your store link wherever your customers already find you.",
    visual: <ShareVisual />,
  },
  {
    title: "Receive tidy orders",
    body: "Each order reaches your WhatsApp as one clear message and is saved in your dashboard with an order number.",
    visual: <OrderVisual />,
  },
];

export function StepList({ className }: { className?: string }) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {STEPS.map((step, index) => (
        <li className="mk-reveal relative grid grid-cols-[44px_1fr] gap-x-4 pb-12 last:pb-0" key={step.title}>
          {index < STEPS.length - 1 ? (
            <span aria-hidden="true" className="absolute bottom-0 left-[21.5px] top-12 w-px bg-line" />
          ) : null}
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-[15px] font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 pt-2">
            <h3 className="text-[22px] font-bold leading-tight tracking-[-0.02em]">{step.title}</h3>
            <p className="mt-2 max-w-[44ch] text-base leading-relaxed text-ink-2">{step.body}</p>
            <div className="mt-5 max-w-md">{step.visual}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
