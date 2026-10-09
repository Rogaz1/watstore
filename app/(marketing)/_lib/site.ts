// Keep in sync with PLATFORM_WHATSAPP_NUMBER in app/components/subscription.ts
const SUPPORT_WHATSAPP_NUMBER = "233592514232";

export const SIGNUP_HREF = "/signup";

/**
 * Where the homepage keeps the business name a visitor typed, so store setup
 * can start with it filled in. Keep in sync with app/dashboard/setup/page.tsx.
 */
export const PENDING_STORE_NAME_KEY = "floxto-pending-store-name";
export const LOGIN_HREF = "/login";

export function supportUrl(message = "Hello Floxto, I have a question.") {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/use-cases", label: "Who it's for" },
  { href: "/faq", label: "FAQ" },
] as const;

export const PRICING = {
  trialDays: 30,
  monthly: 39,
  annual: 299,
  annualSaving: 169,
  symbol: "₵",
} as const;

export const PLAN_FEATURES = [
  "Your own branded online store",
  "Product pages designed to get orders",
  "Organised WhatsApp orders",
  "Order and product management",
  "One store link to share anywhere",
  "Secure cloud hosting",
  "Free updates and new features",
  "Support on WhatsApp",
] as const;

export type FaqItem = { question: string; answer: string };

export const FAQS: FaqItem[] = [
  {
    question: "What is Floxto?",
    answer:
      "Floxto is a simple online store for businesses that sell through WhatsApp. You get a store link, a page for every product, and a dashboard for your orders. Customers browse your products and send their order straight to your WhatsApp.",
  },
  {
    question: "Do my customers need an account or an app?",
    answer:
      "No. They open your link in any browser, choose a product and tap Order on WhatsApp. There is nothing to download and nothing to sign up for.",
  },
  {
    question: "How does an order reach me?",
    answer:
      "The customer picks a quantity and enters their name and delivery location. Floxto saves the order in your dashboard with its own order number, then opens WhatsApp with the full order message ready to send to you.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Floxto does not handle payments and never takes a share of your sales. You agree payment with your customer on WhatsApp, the same way you do today. You can show your payment options on every product page.",
  },
  {
    question: "Is there a cart or checkout page?",
    answer:
      "No, and that is on purpose. Your customers already trust WhatsApp, so Floxto keeps the order there. They get a clean store to browse and you get a tidy order to confirm.",
  },
  {
    question: "Which currencies and languages can I use?",
    answer:
      "You can price your products in Ghana cedi, Nigerian naira, West African CFA franc, Central African CFA franc, US dollar, British pound or euro. Floxto works in English and French.",
  },
  {
    question: "What happens when the 30 days end?",
    answer:
      "You choose the monthly plan at ₵39 or the annual plan at ₵299. Message us on WhatsApp and we will activate it for you. If you decide not to continue, your store goes offline until you subscribe.",
  },
  {
    question: "Can I run my store from my phone?",
    answer:
      "Yes. Floxto is built for phones first. You can also add it to your home screen so it opens like any other app.",
  },
  {
    question: "How do I reach support?",
    answer:
      "Message us on WhatsApp. It is the fastest way to get help with setting up, subscribing or renewing.",
  },
];
