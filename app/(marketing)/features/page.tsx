import type { Metadata } from "next";
import {
  Coins,
  Download,
  History,
  Images,
  Languages,
  MessageCircle,
  Moon,
  PackageX,
  Share2,
  Truck,
} from "lucide-react";
import { FeatureRow } from "../_components/FeatureRow";
import { Phone } from "../_components/mock/Phone";
import {
  ChatScreen,
  DashboardScreen,
  ProductScreen,
  StorefrontScreen,
} from "../_components/mock/screens";
import { FinalCta, PageIntro } from "../_components/sections";
import { Accent, Container, SectionHeading } from "../_components/ui";

export const metadata: Metadata = {
  title: "Features",
  description:
    "A branded storefront, product pages made for orders, a simple WhatsApp order form and one dashboard for everything. See what comes with every Floxto store.",
  alternates: { canonical: "/features" },
};

const EXTRAS = [
  {
    icon: Coins,
    title: "Sell in your currency",
    body: "Ghana cedi, Nigerian naira, West and Central African CFA franc, US dollar, British pound or euro.",
  },
  {
    icon: Languages,
    title: "English and French",
    body: "Use Floxto in the language you and your customers are comfortable with.",
  },
  {
    icon: Download,
    title: "Installs like an app",
    body: "Add Floxto to your home screen on Android or iPhone and open it with one tap.",
  },
  {
    icon: Images,
    title: "Photos that load fast",
    body: "Product photos are compressed before upload, so your pages stay light on mobile data.",
  },
  {
    icon: Truck,
    title: "Delivery and payment details",
    body: "Write your delivery information and payment options once. They show on every product page.",
  },
  {
    icon: MessageCircle,
    title: "A button for questions",
    body: "Customers who are not ready to order can tap to chat with you on WhatsApp first.",
  },
  {
    icon: PackageX,
    title: "Out of stock, still visible",
    body: "Mark a product as out of stock. Customers can still see it and ask when it is back.",
  },
  {
    icon: History,
    title: "Order history you can trust",
    body: "Each order keeps the product name, photo and price from the day it was placed.",
  },
  {
    icon: Share2,
    title: "Share any product",
    body: "Every product has its own link, ready for a status, a story or an ad.",
  },
  {
    icon: Moon,
    title: "Dark mode for late nights",
    body: "Switch your dashboard to dark mode. Your storefront always stays bright for customers.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageIntro
        lead="Floxto does a few things and does them well. Here is everything that comes with your store from the first day."
        title={
          <>
            Simple tools that make you look <Accent>professional.</Accent>
          </>
        }
      />

      <section className="py-12 lg:py-20">
        <Container className="flex flex-col gap-4 lg:gap-6">
          <FeatureRow
            body="One page with your logo, your business name, your tagline and all your products. It opens in any browser, with nothing for the customer to install."
            points={[
              "Your own link at floxto.com/store/your-name",
              "A clean product grid with photos and prices",
              "Designed for phones first",
            ]}
            title="A storefront with your name on it"
            visual={
              <Phone>
                <StorefrontScreen />
              </Phone>
            }
          />
          <FeatureRow
            body="Each product gets a full page of its own. It is built for people who arrive from an ad or a shared link and need to decide quickly."
            flip
            points={[
              "Up to five photos, with the cover you choose",
              "Sale price, original price and the discount shown clearly",
              "Key benefits, a full description and up to five FAQs",
            ]}
            title="Product pages made to get the order"
            tone="night"
            visual={
              <Phone>
                <ProductScreen />
              </Phone>
            }
          />
          <FeatureRow
            body="The customer picks a quantity and types their name and delivery location. No account, no password and no phone number field."
            points={[
              "Three things to fill in, then straight to WhatsApp",
              "The total is worked out for them",
              "No payment is taken on the page",
            ]}
            title="An order form people actually finish"
            tone="sand"
            visual={
              <Phone>
                <ProductScreen sheetOpen />
              </Phone>
            }
          />
          <FeatureRow
            body="Every order reaches you as one message with the product, quantity, total, name, delivery location and an order number."
            flip
            points={[
              "Order numbers start at 1001 and count up",
              "Reply and confirm the way you already do",
              "The same order is saved in your dashboard",
            ]}
            title="Orders that arrive already organised"
            tone="tint"
            visual={
              <Phone>
                <ChatScreen />
              </Phone>
            }
          />
          <FeatureRow
            body="Open Floxto and see what came in, what is still pending and what you have delivered."
            points={[
              "Mark orders pending, paid, fulfilled or cancelled",
              "Add, edit and remove products from your phone",
              "Copy or open your store link from the home screen",
            ]}
            title="One dashboard for your whole shop"
            visual={
              <Phone>
                <DashboardScreen />
              </Phone>
            }
          />
        </Container>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <Container>
          <SectionHeading className="mk-reveal max-w-2xl">
            And the small things that <Accent>add up.</Accent>
          </SectionHeading>
          <ul className="mt-10 grid gap-x-10 sm:grid-cols-2">
            {EXTRAS.map((extra) => (
              <li
                className="mk-reveal flex gap-4 border-t border-line py-6"
                key={extra.title}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-tint text-brand-deep">
                  <extra.icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-[18px] font-bold leading-tight tracking-[-0.015em]">
                    {extra.title}
                  </h3>
                  <p className="mt-1.5 max-w-[44ch] text-base leading-relaxed text-ink-2">
                    {extra.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
