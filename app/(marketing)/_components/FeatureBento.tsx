import { Coins, Download, Images, Languages } from "lucide-react";
import { Phone } from "./mock/Phone";
import { OrderCard, ProductScreen, StorefrontScreen } from "./mock/screens";
import { Accent, cn, Container, Lead, SectionHeading, TextLink } from "./ui";

function CardText({
  title,
  body,
  tone = "light",
}: {
  title: string;
  body: string;
  tone?: "light" | "night";
}) {
  return (
    <div className="px-6 pt-7 sm:px-8 sm:pt-8">
      <h3 className="text-balance text-[24px] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[28px]">
        {title}
      </h3>
      <p
        className={cn(
          "mt-3 max-w-[40ch] text-base leading-relaxed",
          tone === "night" ? "text-night-muted" : "text-ink-2",
        )}
      >
        {body}
      </p>
    </div>
  );
}

const SMALL_FEATURES = [
  {
    icon: Coins,
    title: "Your currency",
    body: "Cedi, naira, CFA franc, dollar, pound or euro.",
  },
  {
    icon: Languages,
    title: "English & French",
    body: "Switch between the two whenever you like.",
  },
  {
    icon: Download,
    title: "Install the app",
    body: "Add Floxto to your phone's home screen.",
  },
  {
    icon: Images,
    title: "Light, fast photos",
    body: "Compressed automatically so pages load fast.",
  },
];

export function FeatureBento({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        {showHeading ? (
          <div className="mk-reveal mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <SectionHeading>
                Everything a small shop needs. <Accent>Nothing extra.</Accent>
              </SectionHeading>
              <Lead className="mt-4 max-w-[44ch]">
                No carts, no checkout pages and no payment setup. Just a clean store and
                orders you can read.
              </Lead>
            </div>
            <TextLink href="/features">See all features</TextLink>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <article className="mk-reveal flex flex-col overflow-hidden rounded-[32px] border border-line bg-white">
            <CardText
              body="Your logo, your name and all your products on one page that opens from any link."
              title="A storefront with your name on it"
            />
            <div aria-hidden="true" className="mt-8 flex h-[330px] justify-center overflow-hidden">
              <Phone>
                <StorefrontScreen />
              </Phone>
            </div>
          </article>

          <article className="mk-reveal mk-on-night flex flex-col overflow-hidden rounded-[32px] bg-night text-night-text">
            <CardText
              body="Photos, price, benefits and FAQs on a page of its own. Send people straight to it from an ad or a status."
              title="Product pages made to get the order"
              tone="night"
            />
            <div aria-hidden="true" className="mt-8 flex h-[330px] justify-center overflow-hidden">
              <Phone>
                <ProductScreen />
              </Phone>
            </div>
          </article>

          <article className="mk-reveal flex flex-col overflow-hidden rounded-[32px] bg-paper-2 lg:col-span-2 lg:flex-row lg:items-center">
            <div className="lg:w-[44%] lg:pb-8">
              <CardText
                body="See who ordered what and where it is going. Mark each order pending, paid, fulfilled or cancelled as you work through the day."
                title="Every order in one place"
              />
            </div>
            <div aria-hidden="true" className="flex-1 px-4 pb-6 pt-8 sm:px-8 lg:py-10">
              <div className="mx-auto flex max-w-[330px] flex-col gap-2 [zoom:1.2] lg:max-w-[360px]">
                <OrderCard
                  customer="Akosua Mensah"
                  detail="Qty 2 · ₵170"
                  location="East Legon, Accra"
                  productIndex={0}
                  productName="Shea Body Butter 250g"
                  status="Pending"
                  when="Just now"
                />
                <OrderCard
                  customer="Kojo Antwi"
                  detail="Qty 1 · ₵120"
                  location="Adum, Kumasi"
                  productIndex={1}
                  productName="Glow Face Serum 30ml"
                  status="Paid"
                  when="2h ago"
                />
                <OrderCard
                  className="hidden sm:block"
                  customer="Efua Sarpong"
                  detail="Qty 3 · ₵105"
                  location="Takoradi"
                  productIndex={3}
                  productName="Shea Milk Soap"
                  status="Fulfilled"
                  when="Yesterday"
                />
              </div>
            </div>
          </article>
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-4 lg:mt-6 lg:grid-cols-4 lg:gap-6">
          {SMALL_FEATURES.map((feature) => (
            <li
              className="mk-reveal rounded-[24px] border border-line bg-white p-4 sm:p-5"
              key={feature.title}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-tint text-brand-deep">
                <feature.icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-4 whitespace-nowrap text-[15px] font-bold leading-tight tracking-[-0.01em] sm:text-[17px]">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-snug text-ink-2 sm:text-[15px]">
                {feature.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
