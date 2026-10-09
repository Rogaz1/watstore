import type { LegalSection } from "../_components/LegalDoc";
import { PRICING } from "./site";

export const LEGAL_UPDATED = "7 October 2026";

const MONTHLY = `${PRICING.symbol}${PRICING.monthly}`;
const ANNUAL = `${PRICING.symbol}${PRICING.annual}`;

/* -------------------------------- Terms -------------------------------- */

export const TERMS_SUMMARY = [
  "Floxto gives you a store and an order dashboard. You run your business.",
  "Every sale is between you and your customer. Floxto is not part of it and never handles the money.",
  `You can try Floxto free for ${PRICING.trialDays} days. After that it is ${MONTHLY} a month or ${ANNUAL} a year.`,
  "You own your products, photos and store content. You are responsible for them.",
  "Do not use Floxto to sell anything illegal or to mislead people.",
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    blocks: [
      "These terms are the agreement between you and Floxto (\"Floxto\", \"we\", \"us\"). They cover the Floxto website, the merchant dashboard and the online stores that merchants create with Floxto. Together we call these the service.",
      "By creating an account, or by using the service in any other way, you agree to these terms. If you do not agree, please do not use Floxto.",
      "If you use Floxto for a business, you confirm that you are allowed to accept these terms for that business.",
    ],
  },
  {
    id: "service",
    title: "What Floxto does",
    blocks: [
      "Floxto is a tool for businesses that sell through WhatsApp. It gives a merchant a public store page, a page for each product and a dashboard to manage products and orders.",
      "When a customer places an order, Floxto saves the order details for the merchant and opens WhatsApp with an order message that the customer can send to the merchant. The order is then confirmed, paid for and delivered between the merchant and the customer.",
      {
        intro: "Floxto does not:",
        items: [
          "take or process payments between customers and merchants",
          "hold, ship or deliver any product",
          "act as the seller, the buyer or an agent of either",
          "check or guarantee products, prices, stock or delivery",
        ],
      },
    ],
  },
  {
    id: "account",
    title: "Your account",
    blocks: [
      "You need an account to create a store. You must be at least 18 years old, and the details you give us must be true and kept up to date.",
      "Keep your password private. You are responsible for everything done through your account. Tell us straight away if you think someone else has used it.",
      "Your store link is unique to you. You may not choose a store name or link that pretends to be another business or that breaks someone else's rights.",
    ],
  },
  {
    id: "plans",
    title: "Free trial, plans and payment",
    blocks: [
      `Every new store starts with a free trial of ${PRICING.trialDays} days. No payment is needed to start, and you will not be charged when the trial ends.`,
      `To keep your store online after the trial, you choose the monthly plan at ${MONTHLY} or the annual plan at ${ANNUAL}. Both plans include the same features.`,
      "Payment is arranged directly with our team on WhatsApp. We do not take payment through the website and we do not store payment details. Your plan starts once we have confirmed your payment.",
      "A monthly plan runs for 30 days. An annual plan runs for 360 days, which is twelve periods of 30 days. Each period is counted from the date we record your payment. Your dashboard shows your plan and when it is due for renewal.",
      "Plans do not renew automatically. To continue, contact us before your plan ends. If a trial or plan ends without a new payment, your store and product pages go offline and customers see a message that the store is temporarily unavailable. Your products and orders are not deleted, and your store comes back when you subscribe.",
      "Because you can use every feature free for 30 days before you pay, payments are not refundable once a plan has been activated, unless the law says otherwise. If you think you were charged by mistake, message us and we will look into it.",
      "We may change our prices. A new price never applies to a period you have already paid for. We will show new prices on our pricing page before they apply to you.",
    ],
  },
  {
    id: "content",
    title: "Your store and your content",
    blocks: [
      "You own the content you add to Floxto, including your business name, logo, product photos, descriptions and prices.",
      "You give Floxto permission to store, copy, resize, display and share that content as needed to run your store and the service. For example, we compress your photos and show them on your public store page. This permission ends when your content is deleted, apart from copies kept in backups for a short time and details kept in past orders.",
      {
        intro: "You are responsible for your content. You confirm that:",
        items: [
          "you have the right to use every photo, name and description you upload",
          "your product details and prices are accurate and not misleading",
          "your store follows the laws that apply to your business and your products",
        ],
      },
    ],
  },
  {
    id: "customers",
    title: "Your customers and orders",
    blocks: [
      "Any sale made through your store is a contract between you and your customer only. Floxto is not a party to it.",
      {
        intro: "As the seller, you are responsible for:",
        items: [
          "confirming each order and agreeing payment with your customer",
          "delivery, returns, refunds and complaints",
          "the quality, safety and legality of what you sell",
          "any licences, taxes and consumer protection rules that apply to you",
        ],
      },
      "Floxto shows you the name and delivery location a customer enters when they order. You may use these details only to handle that order and to serve that customer. You must protect them and follow the data protection laws that apply to you.",
    ],
  },
  {
    id: "shoppers",
    title: "If you are buying from a store",
    blocks: [
      "Stores on Floxto are run by independent merchants. When you order, you are buying from the merchant, not from Floxto.",
      "Placing an order on a store does not take any payment. It sends your order to the merchant on WhatsApp, where you agree payment and delivery with them. Questions about a product, a price, a delivery or a refund should go to the merchant.",
      "If you believe a store is dishonest or is selling something that should not be sold, please tell us.",
    ],
  },
  {
    id: "rules",
    title: "What is not allowed",
    blocks: [
      {
        intro: "You must not use Floxto to list, promote or sell:",
        items: [
          "anything that is illegal where you or your customers are",
          "counterfeit or stolen goods, or goods that infringe someone else's brand or copyright",
          "weapons, illegal drugs or products that are unsafe or banned",
          "prescription medicine or regulated products without the approval the law requires",
          "sexually explicit material, or anything that exploits or harms children",
          "scams, pyramid schemes, or offers that mislead people about what they will get",
        ],
      },
      {
        intro: "You must also not:",
        items: [
          "make health or other claims about a product that you cannot support",
          "post content that is hateful, threatening or abusive",
          "pretend to be another person or business",
          "try to break, overload, copy or get around the security of the service",
          "collect other people's information from Floxto by automated means",
          "resell or share access to your account",
        ],
      },
    ],
  },
  {
    id: "third-parties",
    title: "WhatsApp and other services",
    blocks: [
      "Floxto is an independent product. It is not owned by, endorsed by or affiliated with WhatsApp or Meta. WhatsApp is a trademark of its owner.",
      "Orders and chats happen on WhatsApp, so you and your customers must also follow WhatsApp's own terms. Floxto relies on other companies for hosting and storage as well. We are not responsible for problems caused by services we do not control.",
    ],
  },
  {
    id: "suspension",
    title: "Suspending or closing an account",
    blocks: [
      "You can stop using Floxto at any time. To close your account and have your store removed, message us on WhatsApp.",
      "We may hide a product, take a store offline or suspend or close an account if we reasonably believe these terms have been broken, if the law requires it, or if a store puts customers, other people or Floxto at risk. Where we can, we will tell you why and give you a chance to fix the problem first.",
    ],
  },
  {
    id: "our-content",
    title: "Floxto's own content",
    blocks: [
      "The Floxto name, logo, software and website belong to Floxto. We let you use the service while you follow these terms. This does not give you the right to copy, resell or reuse our software or our brand.",
    ],
  },
  {
    id: "availability",
    title: "Availability and changes",
    blocks: [
      "We work to keep Floxto running well, but we provide it as it is. We do not promise that it will always be available, free of errors or right for every purpose, and we do not promise any level of sales or orders.",
      "We may add, change or remove features as the product develops. If we ever decide to end the service, we will give active merchants reasonable notice.",
    ],
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    blocks: [
      "Nothing in these terms removes any right or protection that the law does not allow us to remove.",
      {
        intro: "Apart from that, and as far as the law allows, Floxto is not responsible for:",
        items: [
          "any dispute, loss or damage arising from a sale between a merchant and a customer",
          "content that merchants add to their stores",
          "lost profit, lost sales, lost data or other indirect losses",
          "problems caused by WhatsApp, internet providers or other services outside our control",
        ],
      },
      "If we are found responsible for a loss, our total responsibility to you is limited to the amount you paid us for Floxto in the 12 months before the loss happened.",
      "If someone brings a claim against Floxto because of your store, your products or the way you used the service, you agree to cover the reasonable costs and losses that result.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    blocks: [
      "We may update these terms as Floxto changes. We will post the new version on this page with a new date. If a change is important, we will also tell merchants in the dashboard or by message before it applies.",
      "If you keep using Floxto after a change takes effect, you accept the updated terms.",
    ],
  },
  {
    id: "law",
    title: "Governing law",
    blocks: [
      "These terms are governed by the laws of the Republic of Ghana. If you have a concern, please contact us first so we can try to settle it directly. If we cannot, the courts of Ghana will handle the dispute, unless the law where you live gives you the right to bring it elsewhere.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      "For any question about these terms, message the Floxto team on WhatsApp using the button below or through our contact page.",
    ],
  },
];

/* ------------------------------- Privacy ------------------------------- */

export const PRIVACY_SUMMARY = [
  "We collect only what is needed to run your store and your orders.",
  "Customers give a name and a delivery location to order. We never ask them for payment details.",
  "We do not sell personal information and we do not show adverts.",
  "Store pages are public. Order details are visible only to the merchant who received them.",
  "You can ask us to correct or delete your information at any time.",
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "scope",
    title: "Who this policy covers",
    blocks: [
      "This policy explains what information Floxto (\"Floxto\", \"we\", \"us\") collects, why we collect it and what we do with it. It applies to the Floxto website, the merchant dashboard and the stores that merchants create with Floxto.",
      {
        intro: "It covers three groups of people:",
        items: [
          "merchants, who create an account and run a store",
          "customers, who browse a store and place an order",
          "visitors, who read our website",
        ],
      },
      "For merchant account information, Floxto decides how the information is used. For customer order details, the merchant decides how they are used and Floxto stores them on the merchant's behalf.",
    ],
  },
  {
    id: "merchants",
    title: "Information we collect from merchants",
    blocks: [
      {
        intro: "When you create an account and set up a store, we collect:",
        items: [
          "your email address and password. Your password is stored in a protected form that we cannot read",
          "your business name, store link, WhatsApp number and country",
          "your logo, tagline, delivery information, payment options and the reasons you give customers to choose you",
          "your preferred language and currency",
          "your products, including names, prices, photos, descriptions, benefits and FAQs",
        ],
      },
      {
        intro: "To manage your trial and subscription, we keep:",
        items: [
          "the date your trial started",
          "your plan, its status and the date of your last payment",
        ],
      },
      "When you message us on WhatsApp for support or to subscribe, we receive your WhatsApp number, your profile name and what you send us. We do not collect or store payment details.",
    ],
  },
  {
    id: "customers",
    title: "Information we collect from customers",
    blocks: [
      {
        intro: "When you place an order on a Floxto store, we collect:",
        items: [
          "the name you enter",
          "the delivery location you enter",
          "the product, quantity and total of your order",
          "an order number and the date and time of the order",
        ],
      },
      "We do not ask for your phone number, email address or payment details, and you do not need an account to order.",
      "After you fill in the order form, WhatsApp opens so you can send your order to the merchant. From that point the conversation is on WhatsApp, and the merchant will see your WhatsApp number and profile name there. That exchange is covered by WhatsApp's own privacy policy.",
      "When someone taps the chat button on a product page, we count the tap so the merchant can see how many enquiries a product receives. This count does not include any personal details.",
    ],
  },
  {
    id: "automatic",
    title: "Information collected automatically",
    blocks: [
      "We use Vercel Web Analytics and Vercel Speed Insights to understand how our pages are used and how fast they load. They record things like the page visited, the site you came from, your browser and device type and your approximate country. They do not use advertising cookies and they do not follow you across other websites.",
      "Like most websites, our hosting provider keeps short-term technical logs that include IP addresses. These are used to keep the service secure and working.",
    ],
  },
  {
    id: "device",
    title: "Storage on your device",
    blocks: [
      {
        intro: "Floxto saves a small amount of information in your browser so the service works properly:",
        items: [
          "your sign-in session, so merchants stay logged in",
          "your language choice, which is also kept in a cookie named floxto-locale",
          "your light or dark theme choice in the dashboard",
          "saved copies of pages and images, so the app opens faster and keeps working on a weak connection",
        ],
      },
      "We do not use advertising or cross-site tracking cookies. You can clear this information at any time in your browser settings. If you do, you will need to log in again.",
    ],
  },
  {
    id: "use",
    title: "How we use information",
    blocks: [
      {
        intro: "We use the information we collect to:",
        items: [
          "create and show your store and product pages",
          "record orders and show them to the merchant who received them",
          "manage trials, subscriptions and renewals",
          "answer questions and give support",
          "keep the service secure and prevent misuse",
          "understand how Floxto is used so we can improve it",
          "meet our legal obligations",
        ],
      },
      "We rely on these reasons to use your information: to provide the service you asked for, because you gave your consent, because we have a legitimate interest in running and protecting Floxto, or because the law requires it.",
      "We do not use your information for advertising, and we do not make automated decisions about you that have legal effects.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share information with",
    blocks: [
      "We do not sell personal information.",
      {
        intro: "Information is shared only in these ways:",
        items: [
          "With the public: everything a merchant puts on a store is public. This includes the business name, logo, tagline, products, prices, delivery and payment information, and a link to chat with the merchant on WhatsApp.",
          "With merchants: when a customer places an order, the merchant sees the customer's name, delivery location and order details.",
          "With service providers: we use Supabase to store our database, accounts and uploaded images, and Vercel to host the service and provide analytics. They handle information only on our instructions.",
          "With WhatsApp: when you choose to send an order or a message, you share it through WhatsApp under WhatsApp's own terms.",
          "When the law requires it: we may share information if we must do so by law, or to protect the rights and safety of our users, the public or Floxto.",
          "If Floxto changes hands: if the business is sold or merged, information may pass to the new owner, who must continue to respect this policy.",
        ],
      },
    ],
  },
  {
    id: "location",
    title: "Where information is stored",
    blocks: [
      "Our service providers store information on servers that may be located outside Ghana and outside the country where you live. When information is moved in this way, we rely on providers that commit to keeping it secure.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep information",
    blocks: [
      {
        items: [
          "Merchant account and store information is kept for as long as the account exists.",
          "Orders are kept as part of the merchant's business records for as long as the merchant's account exists.",
          "When a merchant removes a product, it is hidden from the store. Its name, price and photo remain in past orders so that order history stays accurate.",
          "If a trial or plan ends, the store goes offline but its information is kept so the merchant can return.",
          "When a merchant asks us to close an account, we delete or anonymise the account, store and order information within a reasonable time, unless the law requires us to keep some of it.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "How we protect information",
    blocks: [
      {
        intro: "We take reasonable steps to protect the information we hold, including:",
        items: [
          "encrypted connections between your device and Floxto",
          "passwords stored in a protected form that cannot be read",
          "access rules in our database so a merchant can see only their own store and orders",
          "limited access to our systems for the people who run Floxto",
        ],
      },
      "No online service can promise complete security. If we learn of a breach that affects your information, we will tell you and the relevant authority as the law requires.",
    ],
  },
  {
    id: "rights",
    title: "Your choices and rights",
    blocks: [
      {
        intro: "Depending on the law where you live, you may have the right to:",
        items: [
          "ask what information we hold about you and receive a copy",
          "ask us to correct information that is wrong",
          "ask us to delete your information",
          "object to, or ask us to limit, how we use your information",
          "withdraw consent you have given",
        ],
      },
      "Merchants can change most of their information directly in the dashboard settings. For anything else, message us on WhatsApp. We may need to confirm who you are before we act on a request.",
      "If you are a customer and want an order record corrected or removed, you can contact the merchant you ordered from, or contact us and we will work with the merchant.",
      "We handle personal information in line with the data protection laws that apply to us, including Ghana's Data Protection Act, 2012 (Act 843). If you are not satisfied with how we deal with a request, you can complain to the data protection authority in your country. In Ghana this is the Data Protection Commission.",
    ],
  },
  {
    id: "children",
    title: "Children",
    blocks: [
      "Floxto is meant for adults who run or buy from a business. Merchant accounts are for people aged 18 or over, and we do not knowingly collect information from children. If you believe a child has given us information, tell us and we will remove it.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      "We may update this policy as Floxto changes. We will post the new version on this page with a new date, and we will tell merchants about important changes in the dashboard or by message.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      "For any question about this policy or about your information, message the Floxto team on WhatsApp using the button below or through our contact page.",
    ],
  },
];
