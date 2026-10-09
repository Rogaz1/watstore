import { CircleCheck } from "lucide-react";
import { DEMO_ORDER, DEMO_PRODUCTS } from "./mock/demo";
import { ProductPhoto } from "./mock/ProductPhoto";
import { OrderMessage } from "./mock/screens";
import { Accent, cn, Container, Lead, SectionHeading } from "./ui";

type Bubble = { from: "customer" | "you"; text?: string; photo?: boolean };

const MESSY_CHAT: Bubble[] = [
  { from: "customer", text: "Hi, is the shea butter still available?" },
  { from: "you", text: "Yes please, it is" },
  { from: "customer", text: "How much?" },
  { from: "you", text: "₵85 for the 250g" },
  { from: "customer", text: "Send me a picture of it" },
  { from: "you", photo: true },
  { from: "customer", text: "Ok I want 2. Do you deliver to East Legon?" },
  { from: "you", text: "Yes. What name should I put on it?" },
];

function ChatBubble({ bubble }: { bubble: Bubble }) {
  const mine = bubble.from === "you";

  return (
    <div
      className={cn(
        "max-w-[78%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug text-[#111B21] shadow-[0_1px_1px_rgba(0,0,0,0.07)]",
        mine ? "self-end rounded-tr-md bg-[#D9FDD3]" : "self-start rounded-tl-md bg-white",
        bubble.photo && "p-1.5",
      )}
    >
      {bubble.photo ? (
        <span
          className="block h-28 w-28 overflow-hidden rounded-xl"
          style={{ backgroundColor: DEMO_PRODUCTS[0].tile }}
        >
          <ProductPhoto sizes="120px" src={DEMO_PRODUCTS[0].image} />
        </span>
      ) : (
        bubble.text
      )}
    </div>
  );
}

export function ChatCompare() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="mk-reveal max-w-2xl">
          <SectionHeading>
            WhatsApp sells. But the chat gets <Accent>messy.</Accent>
          </SectionHeading>
          <Lead className="mt-4 max-w-[46ch]">
            The price is in one message, the photo in another and the address somewhere above.
            Floxto turns all of that into one clear order.
          </Lead>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <figure className="mk-reveal flex flex-col overflow-hidden rounded-[28px] border border-line bg-[#EFE9E0]">
            <figcaption className="border-b border-black/5 bg-white/70 px-5 py-4 text-[15px] font-semibold">
              Taking an order in the chat
            </figcaption>
            <div className="relative flex max-h-[430px] flex-col gap-2 overflow-hidden px-4 pb-10 pt-4">
              {MESSY_CHAT.map((bubble, index) => (
                <ChatBubble bubble={bubble} key={index} />
              ))}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#EFE9E0] to-transparent"
              />
            </div>
            <p className="mt-auto border-t border-black/5 bg-white/70 px-5 py-4 text-[15px] leading-snug text-ink-2">
              Eight messages in, and you still do not have a name.
            </p>
          </figure>

          <figure className="mk-reveal flex flex-col overflow-hidden rounded-[28px] bg-brand-tint">
            <figcaption className="border-b border-brand-deep/10 px-5 py-4 text-[15px] font-semibold text-brand-deep">
              Taking an order with Floxto
            </figcaption>
            <div className="flex flex-1 flex-col justify-center gap-3 px-4 py-8 sm:px-8">
              <div className="[zoom:1.28]">
                <OrderMessage className="max-w-[230px]" />
              </div>
              <p className="flex items-center gap-2 text-[14px] font-semibold text-brand-deep">
                <CircleCheck aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.25} />
                Saved to your dashboard as Order #{DEMO_ORDER.number}
              </p>
            </div>
            <p className="border-t border-brand-deep/10 px-5 py-4 text-[15px] leading-snug text-ink-2">
              One message with the product, quantity, total, name and delivery location.
            </p>
          </figure>
        </div>
      </Container>
    </section>
  );
}
