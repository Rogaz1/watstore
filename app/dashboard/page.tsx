"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Home,
  Image as ImageIcon,
  Lightbulb,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  CreditCard,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  User,
  X,
  Zap,
  Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExpiredAccessScreen } from "../components/ExpiredAccessScreen";
import { InternationalPhoneInput } from "../components/InternationalPhoneInput";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { compressImageForUpload } from "../components/imageCompression";
import { getMerchantForUser } from "../components/merchantProfile";
import {
  deriveCountryFromPhone,
  fallbackCountry,
  normalizePhoneNumber,
  PhoneCountryCode,
} from "../components/phone";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  formatPrice,
  Merchant,
  normalizeCurrencyCode,
  Order,
  OrderStatus,
  Product,
  supportedCurrencies,
} from "../components/productTypes";
import { buildUpgradeUrl } from "../components/subscription";
import { buildWhatsAppUrl } from "../components/publicStoreTypes";
import { buildAbsoluteUrl } from "../components/siteUrl";
import {
  getSubscriptionAccess,
  refreshMerchantSubscription,
} from "../components/subscription";
import { getUserFacingError } from "../components/userFacingErrors";
import { useRequireUser } from "../components/useRequireUser";
import { useI18n } from "../i18n/LanguageProvider";
import type { Locale } from "../i18n/messages";

const LOGO_BUCKET = "merchant-logos";
const PLATFORM_HELP_NUMBER = "233592514232";
const MAX_TAGLINE_CHARS = 60;
const MAX_DELIVERY_INFO_CHARS = 200;
const MAX_PAYMENT_OPTIONS_CHARS = 150;
const MAX_WHY_CHOOSE_US_CHARS = 300;

const sellingTips: Record<Locale, Array<{ title: string; items: string[] }>> = {
  en: [
    {
      title: "Photos",
      items: [
        "Use at least 3 real photos of your actual product - buyers trust real photos more than a single studio shot",
        "Include a close-up, a full view, and if possible, the product in use",
        "Good lighting matters more than a fancy camera - natural daylight works well",
      ],
    },
    {
      title: "Your Short Description",
      items: [
        "This is the first thing buyers read - make it about the benefit, not just what the product is",
        "Keep it to one or two sentences",
      ],
    },
    {
      title: "Key Benefits",
      items: [
        "List specific, concrete benefits, not vague claims",
        "3-4 short bullet points work better than one long paragraph",
      ],
    },
    {
      title: "Full Description",
      items: [
        "Break it into short paragraphs, not one big block of text",
        "Answer the obvious questions: what it's made of, how to use it, who it's for",
      ],
    },
    {
      title: "Delivery Info",
      items: [
        "Be specific and honest about delivery areas and timing - this is one of the biggest things that makes buyers hesitate to order",
        "Keep it short - one clear line works better than a long explanation",
      ],
    },
    {
      title: "Payment Options",
      items: [
        'Keep it short and specific - list the actual methods you accept, e.g. "MTN MoMo, Cash on Delivery"',
        "Don't leave this blank if you accept more than just cash - buyers often hesitate simply because they don't know how they'll pay before they message you",
      ],
    },
    {
      title: "Why Choose Us",
      items: [
        "This is your chance to say, in your own words, why a buyer should trust you specifically - keep it honest and specific to your business",
        'Good examples: "5 years selling quality Kente fabric," "Same-day response on WhatsApp," "Family-run business in Accra"',
        "Avoid vague claims that could apply to anyone - specific details are more convincing than generic praise",
      ],
    },
    {
      title: "Frequently Asked Questions",
      items: [
        "Add answers to the questions you get asked most often on WhatsApp - this saves you time and helps hesitant buyers order without needing to ask first",
      ],
    },
    {
      title: "Building Trust",
      items: [
        "Be honest in your descriptions - buyers who feel misled won't come back, even if you get the one sale",
        "Respond quickly to WhatsApp messages - buyers often compare a few sellers and go with whoever answers first",
      ],
    },
  ],
  fr: [
    {
      title: "Photos",
      items: [
        "Utilisez au moins 3 vraies photos de votre produit - les acheteurs font davantage confiance aux photos réelles",
        "Ajoutez un gros plan, une vue complète et, si possible, le produit en situation",
        "Une bonne lumière compte plus qu'un appareil coûteux - la lumière naturelle fonctionne très bien",
      ],
    },
    {
      title: "Votre courte description",
      items: [
        "C'est la première chose que les acheteurs lisent - parlez du bénéfice, pas seulement du produit",
        "Gardez une ou deux phrases",
      ],
    },
    {
      title: "Avantages clés",
      items: [
        "Listez des avantages précis et concrets, pas des affirmations vagues",
        "3 à 4 points courts fonctionnent mieux qu'un long paragraphe",
      ],
    },
    {
      title: "Description complète",
      items: [
        "Séparez le texte en courts paragraphes, pas en un gros bloc",
        "Répondez aux questions évidentes : matière, utilisation, public concerné",
      ],
    },
    {
      title: "Livraison",
      items: [
        "Soyez précis et honnête sur les zones et délais de livraison",
        "Gardez cela court - une ligne claire vaut mieux qu'une longue explication",
      ],
    },
    {
      title: "Options de paiement",
      items: [
        'Soyez court et précis - indiquez les méthodes acceptées, par exemple "MTN MoMo, paiement à la livraison"',
        "Ne laissez pas ce champ vide si vous acceptez plusieurs moyens de paiement",
      ],
    },
    {
      title: "Pourquoi nous choisir",
      items: [
        "Expliquez avec vos propres mots pourquoi l'acheteur devrait vous faire confiance",
        'Bons exemples : "5 ans de vente de tissus Kente", "Réponse WhatsApp le jour même", "Entreprise familiale à Accra"',
        "Évitez les phrases vagues - les détails précis sont plus convaincants",
      ],
    },
    {
      title: "Questions fréquentes",
      items: [
        "Ajoutez les réponses aux questions qu'on vous pose souvent sur WhatsApp",
      ],
    },
    {
      title: "Construire la confiance",
      items: [
        "Soyez honnête dans vos descriptions - un client déçu ne revient pas",
        "Répondez vite sur WhatsApp - les acheteurs choisissent souvent le vendeur qui répond en premier",
      ],
    },
  ],
};

const includedFeatureKeys = [
  "settings.featureStore",
  "settings.featureProductPages",
  "settings.featureManagement",
  "settings.featureWhatsappOrders",
  "settings.featureStoreLink",
  "settings.featureHosting",
  "settings.featureUpdates",
  "settings.featureSupport",
];

type DashboardTab = "home" | "products" | "orders" | "settings";
type OrderFilter = "all" | OrderStatus;
type ProductSummary = Pick<Product, "id" | "name" | "photo_urls">;
type OrderWithProduct = Order & {
  product?: ProductSummary;
};

function getOrderProductSnapshot(order: OrderWithProduct) {
  return {
    name: order.product_name ?? order.product?.name ?? "Product unavailable",
    photoUrl: order.product_photo_url ?? order.product?.photo_urls?.[0] ?? null,
  };
}

const orderStatuses: OrderStatus[] = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
];
const orderStatusLabelKeys: Record<OrderStatus, string> = {
  pending: "orders.statusPending",
  paid: "orders.statusPaid",
  fulfilled: "orders.statusFulfilled",
  cancelled: "orders.statusCancelled",
};
const orderFilters: { labelKey: string; value: OrderFilter }[] = [
  { labelKey: "orders.filterAll", value: "all" },
  { labelKey: "orders.statusPending", value: "pending" },
  { labelKey: "orders.statusPaid", value: "paid" },
  { labelKey: "orders.statusFulfilled", value: "fulfilled" },
  { labelKey: "orders.statusCancelled", value: "cancelled" },
];

function isDashboardTab(value: string | null): value is DashboardTab {
  return (
    value === "home" ||
    value === "products" ||
    value === "orders" ||
    value === "settings"
  );
}

function getDashboardTabFromUrl(): DashboardTab {
  if (typeof window === "undefined") {
    return "home";
  }

  const requestedTab = new URLSearchParams(window.location.search).get("tab");
  return isDashboardTab(requestedTab) ? requestedTab : "home";
}

function subscribeToDashboardTab(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

function homeStatusClasses(status: OrderStatus) {
  if (status === "pending") {
    return "border-[#F59E0B] bg-transparent text-[#B45309]";
  }

  if (status === "paid") {
    return "border-transparent bg-[#EFF6FF] text-[#1D4ED8]";
  }

  if (status === "fulfilled") {
    return "border-transparent bg-[#F0FDF4] text-[#15803D]";
  }

  return "border-transparent bg-[#FEF2F2] text-[#B91C1C]";
}

function statusChevronClasses(status: OrderStatus) {
  if (status === "pending") {
    return "text-[#B45309]";
  }

  if (status === "paid") {
    return "text-[#1D4ED8]";
  }

  if (status === "fulfilled") {
    return "text-[#15803D]";
  }

  return "text-[#B91C1C]";
}

function formatRelativeOrderDate(value: string, locale: Locale = "en") {
  const created = new Date(value);
  const now = new Date();
  const createdDay = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate(),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (today.getTime() - createdDay.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays <= 0) {
    return locale === "fr" ? "Aujourd'hui" : "Today";
  }

  if (diffDays === 1) {
    return locale === "fr" ? "Hier" : "Yesterday";
  }

  return locale === "fr" ? `il y a ${diffDays} j` : `${diffDays}d ago`;
}

function getPlanName(merchant: Merchant | null, locale: Locale) {
  if (!merchant) {
    return locale === "fr" ? "Essai" : "Trial Plan";
  }

  if (merchant.subscription_status === "trial") {
    return locale === "fr" ? "Essai Pro" : "Pro Trial Plan";
  }

  if (merchant.subscription_status === "active") {
    if (merchant.billing_cycle_months === 12) {
      return locale === "fr" ? "Formule annuelle" : "Annual Plan";
    }

    return locale === "fr" ? "Formule mensuelle" : "Monthly Plan";
  }

  return locale === "fr" ? "Abonnement expiré" : "Expired Plan";
}

function formatDateLabel(value: string | Date | null | undefined, locale: Locale) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function buildPlanWhatsAppUrl(
  merchant: Merchant,
  planName: "Monthly" | "Annual",
  intent: "upgrade" | "renew",
  locale: Locale,
) {
  const localizedPlan = locale === "fr"
    ? planName === "Annual"
      ? "Annuel"
      : "Mensuel"
    : planName;
  const firstLine =
    locale === "fr"
      ? `Bonjour, je voudrais ${intent === "renew" ? "renouveler" : "passer à"} l'offre ${localizedPlan}.`
      : `Hello, I'd like to ${intent === "renew" ? "renew" : "upgrade to"} the ${planName} plan.`;

  return buildWhatsAppUrl(
    PLATFORM_HELP_NUMBER,
    [
      firstLine,
      `${locale === "fr" ? "Nom de l'entreprise" : "Business Name"}: ${merchant.business_name ?? ""}`,
      `${locale === "fr" ? "Boutique" : "Store"}: ${merchant.slug ?? ""}`,
    ].join("\n"),
  );
}

function getSubscriptionPlanCta({
  activePlanCycle,
  daysRemaining,
  planCycle,
}: {
  activePlanCycle: number | null | undefined;
  daysRemaining: number | null | undefined;
  planCycle: 1 | 12;
}) {
  const isCurrentPlan = activePlanCycle === planCycle;

  if (activePlanCycle === 12 && planCycle === 1) {
    return {
      disabled: true,
      intent: "upgrade" as const,
      labelKey: "settings.annualActive",
    };
  }

  if (!isCurrentPlan) {
    return {
      disabled: false,
      intent: "upgrade" as const,
      labelKey: "settings.upgrade",
    };
  }

  const renewalThresholdDays = planCycle === 1 ? 7 : 30;
  const isRenewalSoon =
    typeof daysRemaining === "number" && daysRemaining <= renewalThresholdDays;

  if (!isRenewalSoon) {
    return {
      disabled: true,
      intent: "renew" as const,
      labelKey: "settings.allSet",
    };
  }

  return {
    disabled: false,
    intent: "renew" as const,
    labelKey: "settings.renewEarly",
  };
}

function SettingsFieldIcon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center text-[#888888] ${className}`}
    >
      {children}
    </span>
  );
}

function SettingsSectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <h2 className="flex min-w-0 items-center gap-2 text-[18px] font-bold">
      <span className="shrink-0 text-[#1A1A18]">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </h2>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <Home
      aria-hidden="true"
      className="h-5 w-5"
      strokeWidth={active ? 2.6 : 2}
    />
  );
}

function ProductsIcon({ active }: { active: boolean }) {
  return (
    <Package
      aria-hidden="true"
      className="h-5 w-5"
      strokeWidth={active ? 2.6 : 2}
    />
  );
}

function OrdersIcon({ active }: { active: boolean }) {
  return (
    <ShoppingBag
      aria-hidden="true"
      className="h-5 w-5"
      strokeWidth={active ? 2.6 : 2}
    />
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <Settings
      aria-hidden="true"
      className="h-5 w-5"
      strokeWidth={active ? 2.6 : 2}
    />
  );
}

function CopyIcon() {
  return <Copy aria-hidden="true" className="h-3.5 w-3.5" />;
}

function ExternalLinkIcon() {
  return <ExternalLink aria-hidden="true" className="h-4 w-4" />;
}

function PlusIcon() {
  return <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.4} />;
}

function PencilIcon() {
  return <Pencil aria-hidden="true" className="h-4 w-4" />;
}

function TrashIcon() {
  return <Trash2 aria-hidden="true" className="h-4 w-4" />;
}

function ChevronDownIcon() {
  return <ChevronDown aria-hidden="true" className="h-4 w-4" />;
}

function ChevronUpIcon() {
  return <ChevronUp aria-hidden="true" className="h-4 w-4" />;
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  const displayValue =
    typeof value === "number" ? String(value).padStart(2, "0") : value;

  return (
    <div className="rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm">
      <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#888888]">
        {label}
      </p>
      <p
        className={`mt-1 text-[22px] font-bold leading-none ${
          highlight ? "text-[#25D366]" : "text-[#1A1A18]"
        }`}
      >
        {displayValue}
      </p>
    </div>
  );
}

function HomeRecentOrderCard({
  order,
  onDetails,
  currencyCode,
  locale,
}: {
  order: OrderWithProduct;
  onDetails: () => void;
  currencyCode?: string | null;
  locale: Locale;
}) {
  const { t } = useI18n();
  const productSnapshot = getOrderProductSnapshot(order);
  const thumbnail = productSnapshot.photoUrl;
  const orderCurrencyCode = order.currency_code ?? currencyCode;

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold">
            <User
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-[#888888]"
            />
            <span className="min-w-0 flex-1 truncate">
              {order.customer_name}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <span className="hidden shrink-0 items-center gap-1 text-[11px] font-medium text-[#888888] min-[360px]:inline-flex">
            <Calendar aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {formatRelativeOrderDate(order.created_at, locale)}
          </span>
          <span
            className={`shrink-0 rounded-full border-[1.5px] px-3.5 py-1.5 text-[10px] font-semibold capitalize leading-none ${homeStatusClasses(
              order.status,
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-3 border-b border-[#EDECEA] pb-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#EDECEA] bg-[#F7F5F2]">
          {thumbnail ? (
            <img
              className="h-full w-full object-cover"
              src={thumbnail}
              alt={productSnapshot.name}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[#888888]">
              {t("common.noPhoto")}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-[1_1_0%] overflow-hidden">
          <p className="block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-[#25D366]">
            {productSnapshot.name}
          </p>
          <p className="mt-0.5 block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-[#888888]">
            Qty {order.quantity} &middot;{" "}
            {formatPrice(order.total, orderCurrencyCode, locale) ||
              t("product.priceOnRequest")}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] font-medium text-[#888888]">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {order.delivery_location}
          </span>
        </p>
        <button
          className="shrink-0 text-xs font-bold text-[#25D366]"
          type="button"
          onClick={onDetails}
        >
          {t("common.details")}
        </button>
      </div>
    </article>
  );
}

function OrderSummaryCard({
  order,
  onStatusChange,
  currencyCode,
  locale,
}: {
  order: OrderWithProduct;
  onStatusChange: (order: Order, status: OrderStatus) => void;
  currencyCode?: string | null;
  locale: Locale;
}) {
  const { t } = useI18n();
  const productSnapshot = getOrderProductSnapshot(order);
  const thumbnail = productSnapshot.photoUrl;
  const orderCurrencyCode = order.currency_code ?? currencyCode;

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold">
            <User
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-[#888888]"
            />
            <span className="min-w-0 flex-1 truncate">
              {order.customer_name}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <span className="hidden shrink-0 items-center gap-1 text-[11px] font-medium text-[#888888] min-[360px]:inline-flex">
            <Calendar aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {formatRelativeOrderDate(order.created_at, locale)}
          </span>
          <label className="relative inline-flex h-6 shrink-0 items-center">
            <span className="sr-only">{t("dashboard.changeStatus")}</span>
            <select
              className={`h-6 max-w-[96px] cursor-pointer appearance-none truncate rounded-full border-[1.5px] py-0 pl-3.5 pr-7 text-[10px] font-semibold capitalize leading-none outline-none ${homeStatusClasses(
                order.status,
              )}`}
              value={order.status}
              onChange={(event) =>
                onStatusChange(order, event.target.value as OrderStatus)
              }
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {t(orderStatusLabelKeys[status])}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className={`pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 ${statusChevronClasses(
                order.status,
              )}`}
              strokeWidth={2.4}
            />
          </label>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-3 border-b border-[#EDECEA] pb-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#EDECEA] bg-[#F7F5F2]">
          {thumbnail ? (
            <img
              className="h-full w-full object-cover"
              src={thumbnail}
              alt={productSnapshot.name}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[#888888]">
              {t("common.noPhoto")}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-[1_1_0%] overflow-hidden">
          <p className="block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-[#25D366]">
            {productSnapshot.name}
          </p>
          <p className="mt-0.5 block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-[#888888]">
            Qty {order.quantity} &middot;{" "}
            {formatPrice(order.total, orderCurrencyCode, locale) ||
              t("product.priceOnRequest")}
          </p>
        </div>
      </div>

      <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#888888]">
        <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">
          {order.delivery_location}
        </span>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isCheckingAuth } = useRequireUser();
  const { locale, setMerchantLocale, t } = useI18n();
  const userId = user?.id;
  const activeTab = useSyncExternalStore(
    subscribeToDashboardTab,
    getDashboardTabFromUrl,
    () => "home",
  );
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [todayChatClicks, setTodayChatClicks] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [message, setMessage] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [storeLinkCopied, setStoreLinkCopied] = useState(false);
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [isSellingTipsOpen, setIsSellingTipsOpen] = useState(false);
  const [settingsBusinessName, setSettingsBusinessName] = useState("");
  const [settingsTagline, setSettingsTagline] = useState("");
  const [settingsDeliveryInfo, setSettingsDeliveryInfo] = useState("");
  const [settingsPaymentOptions, setSettingsPaymentOptions] = useState("");
  const [settingsWhyChooseUs, setSettingsWhyChooseUs] = useState("");
  const [settingsCurrencyCode, setSettingsCurrencyCode] = useState("GHS");
  const [settingsCountryCode, setSettingsCountryCode] =
    useState<PhoneCountryCode>(fallbackCountry);
  const [settingsSlug, setSettingsSlug] = useState("");
  const [settingsWhatsappNumber, setSettingsWhatsappNumber] = useState("");
  const [settingsLogoFile, setSettingsLogoFile] = useState<File | null>(null);
  const [settingsLogoPreviewUrl, setSettingsLogoPreviewUrl] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isCompressingSettingsLogo, setIsCompressingSettingsLogo] =
    useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingDeliveryInfo, setIsSavingDeliveryInfo] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [deliveryInfoMessage, setDeliveryInfoMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const merchantCurrencyCode = merchant?.currency_code ?? "GHS";
  const settingsWhatsapp = useMemo(
    () => normalizePhoneNumber(settingsWhatsappNumber, settingsCountryCode),
    [settingsCountryCode, settingsWhatsappNumber],
  );

  useEffect(() => {
    if (!isSellingTipsOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSellingTipsOpen]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const currentUserId = userId;
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoadingProducts(true);
      setIsLoadingOrders(true);
      setMessage("");
      setOrderMessage("");

      const { data: merchantData, error: merchantError } =
        await getMerchantForUser(currentUserId);

      if (!isMounted) {
        return;
      }

      if (merchantError || !merchantData) {
        setMerchant(null);
        setProducts([]);
        setOrders([]);
        setTodayChatClicks(0);
        setIsLoadingProducts(false);
        setIsLoadingOrders(false);
        router.replace("/dashboard/setup");
        return;
      }

      const { merchant: refreshedMerchant, access } =
        await refreshMerchantSubscription(merchantData);

      if (!isMounted) {
        return;
      }

      setMerchant(refreshedMerchant);
      setMerchantLocale(refreshedMerchant.preferred_locale ?? null);
      setSettingsBusinessName(refreshedMerchant.business_name ?? "");
      setSettingsTagline(refreshedMerchant.tagline ?? "");
      setSettingsDeliveryInfo(refreshedMerchant.delivery_info ?? "");
      setSettingsPaymentOptions(refreshedMerchant.payment_options ?? "");
      setSettingsWhyChooseUs(refreshedMerchant.why_choose_us ?? "");
      setSettingsCurrencyCode(normalizeCurrencyCode(refreshedMerchant.currency_code));
      setSettingsCountryCode(
        deriveCountryFromPhone(
          refreshedMerchant.whatsapp_number,
          refreshedMerchant.country_code,
        ),
      );
      setSettingsSlug(refreshedMerchant.slug ?? "");
      setSettingsWhatsappNumber(refreshedMerchant.whatsapp_number ?? "");
      setSettingsLogoPreviewUrl(refreshedMerchant.logo_url ?? "");

      if (!access.canAccess) {
        setProducts([]);
        setOrders([]);
        setTodayChatClicks(0);
        setIsLoadingProducts(false);
        setIsLoadingOrders(false);
        return;
      }

      const { data: chatClickCount } = await supabase.rpc(
        "get_current_merchant_today_chat_count",
      );

      if (!isMounted) {
        return;
      }

      setTodayChatClicks(
        typeof chatClickCount === "number" ? chatClickCount : 0,
      );

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,in_stock",
        )
        .eq("merchant_id", refreshedMerchant.id)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (productError) {
        setMessage(getUserFacingError(productError, "product.load", t));
        setProducts([]);
      } else {
        setProducts((productData ?? []) as Product[]);
      }

      setIsLoadingProducts(false);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id,merchant_id,product_id,product_name,product_sale_price,product_photo_url,currency_code,quantity,customer_name,delivery_location,total,status,order_number,created_at",
        )
        .eq("merchant_id", refreshedMerchant.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (orderError) {
        setOrderMessage(getUserFacingError(orderError, "order.load", t));
        setOrders([]);
        setIsLoadingOrders(false);
        return;
      }

      const loadedOrders = (orderData ?? []) as Order[];
      const productIds = Array.from(
        new Set(
          loadedOrders
            .map((order) => order.product_id)
            .filter((productId): productId is string => Boolean(productId)),
        ),
      );

      if (!productIds.length) {
        setOrders(loadedOrders);
        setIsLoadingOrders(false);
        return;
      }

      const { data: orderProducts, error: orderProductsError } = await supabase
        .from("products")
        .select("id,name,photo_urls")
        .eq("merchant_id", refreshedMerchant.id)
        .in("id", productIds);

      if (!isMounted) {
        return;
      }

      if (orderProductsError) {
        setOrderMessage(getUserFacingError(orderProductsError, "order.load", t));
        setOrders(loadedOrders);
        setIsLoadingOrders(false);
        return;
      }

      const productsById = new Map(
        ((orderProducts ?? []) as ProductSummary[]).map((product) => [
          product.id,
          product,
        ]),
      );

      setOrders(
        loadedOrders.map((order) => ({
          ...order,
          product: order.product_id
            ? productsById.get(order.product_id)
            : undefined,
        })),
      );
      setIsLoadingOrders(false);
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [router, setMerchantLocale, t, userId]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function handleCopyStoreLink() {
    if (!storeUrl) {
      return;
    }

    await navigator.clipboard.writeText(storeUrl);
    setStoreLinkCopied(true);
    window.setTimeout(() => setStoreLinkCopied(false), 3200);
  }

  function handleTabChange(tab: DashboardTab) {
    const url = new URL(window.location.href);
    if (tab === "home") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }

    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  async function handleDelete(product: Product) {
    if (!merchant) {
      return;
    }

    const confirmed = window.confirm(
      t("dashboard.deleteProductConfirm", { name: product.name }),
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", product.id)
      .eq("merchant_id", merchant.id);

    if (error) {
      setMessage(getUserFacingError(error, "product.delete", t));
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    setMessage(t("dashboard.productDeleted"));
  }

  async function handleOrderStatusChange(order: Order, status: OrderStatus) {
    if (!merchant) {
      return;
    }

    setOrderMessage("");

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id)
      .eq("merchant_id", merchant.id);

    if (error) {
      setOrderMessage(getUserFacingError(error, "order.update", t));
      return;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id ? { ...item, status } : item,
      ),
    );
  }

  async function handleSettingsLogoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      setSettingsLogoFile(null);
      setSettingsLogoPreviewUrl(merchant?.logo_url ?? "");
      return;
    }

    setIsCompressingSettingsLogo(true);
    setSettingsMessage("");

    try {
      const compressedFile = await compressImageForUpload(file);
      setSettingsLogoFile(compressedFile);
      setSettingsLogoPreviewUrl(URL.createObjectURL(compressedFile));
    } catch (error) {
      setSettingsLogoFile(null);
      setSettingsLogoPreviewUrl(merchant?.logo_url ?? "");
      setSettingsMessage(getUserFacingError(error, "image.compress", t));
    } finally {
      setIsCompressingSettingsLogo(false);
    }
  }

  async function checkSettingsSlugAvailability() {
    const normalizedSlug = normalizeSlug(settingsSlug);

    if (!normalizedSlug) {
      setIsSlugAvailable(null);
      return false;
    }

    if (normalizedSlug === merchant?.slug) {
      setIsSlugAvailable(true);
      return true;
    }

    setIsCheckingSlug(true);
    setSettingsMessage("");

    const { data, error } = await supabase.rpc("is_slug_available", {
      requested_slug: normalizedSlug,
    });

    setIsCheckingSlug(false);

    if (error) {
      setSettingsMessage(getUserFacingError(error, "settings.slug", t));
      setIsSlugAvailable(false);
      return false;
    }

    const available = Boolean(data);
    setIsSlugAvailable(available);

    if (!available) {
      setSettingsMessage(t("setup.slugTaken"));
    }

    return available;
  }

  async function uploadSettingsLogo() {
    if (!settingsLogoFile || !userId) {
      return merchant?.logo_url ?? null;
    }

    const path = `${userId}/${crypto.randomUUID()}-${cleanFileName(
      settingsLogoFile.name,
    )}`;
    const { error } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, settingsLogoFile);

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);

    return publicUrl;
  }

  async function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!merchant) {
      return;
    }

    const normalizedSlug = normalizeSlug(settingsSlug);

    if (
      !settingsBusinessName.trim() ||
      !normalizedSlug ||
      !settingsWhatsapp
    ) {
      if (!settingsWhatsapp) {
      setSettingsMessage(t("setup.invalidPhone"));
      }
      return;
    }

    setIsSavingSettings(true);
    setSettingsMessage("");

    try {
      const slugAvailable = await checkSettingsSlugAvailability();

      if (!slugAvailable) {
        setIsSavingSettings(false);
        return;
      }

      const logoUrl = await uploadSettingsLogo();
      const payload = {
        business_name: settingsBusinessName.trim(),
        tagline: settingsTagline.trim().slice(0, MAX_TAGLINE_CHARS) || null,
        currency_code: normalizeCurrencyCode(settingsCurrencyCode),
        preferred_locale: locale,
        country_code: settingsCountryCode,
        slug: normalizedSlug,
        whatsapp_number: settingsWhatsapp.e164,
        logo_url: logoUrl,
      };
      const { error } = await supabase
        .from("merchants")
        .update(payload)
        .eq("id", merchant.id);

      if (error) {
        throw error;
      }

      setMerchant((current) =>
        current ? { ...current, ...payload } : current,
      );
      setSettingsSlug(normalizedSlug);
      setSettingsCurrencyCode(payload.currency_code);
      setSettingsCountryCode(payload.country_code);
      setSettingsWhatsappNumber(payload.whatsapp_number);
      setSettingsLogoFile(null);
      setSettingsLogoPreviewUrl(logoUrl ?? "");
      setIsSlugAvailable(null);
      setSettingsMessage(t("settings.saved"));
    } catch (error) {
      setSettingsMessage(getUserFacingError(error, "settings.save", t));
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleDeliveryInfoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!merchant) {
      return;
    }

    setIsSavingDeliveryInfo(true);
    setDeliveryInfoMessage("");

    const deliveryInfo =
      settingsDeliveryInfo.trim().slice(0, MAX_DELIVERY_INFO_CHARS) || null;
    const paymentOptions =
      settingsPaymentOptions.trim().slice(0, MAX_PAYMENT_OPTIONS_CHARS) ||
      null;
    const whyChooseUs =
      settingsWhyChooseUs.trim().slice(0, MAX_WHY_CHOOSE_US_CHARS) || null;
    const { error } = await supabase
      .from("merchants")
      .update({
        delivery_info: deliveryInfo,
        payment_options: paymentOptions,
        why_choose_us: whyChooseUs,
      })
      .eq("id", merchant.id);

    if (error) {
      setDeliveryInfoMessage(
        getUserFacingError(error, "settings.customerInfo", t),
      );
      setIsSavingDeliveryInfo(false);
      return;
    }

    setMerchant((current) =>
      current
        ? {
            ...current,
            delivery_info: deliveryInfo,
            payment_options: paymentOptions,
            why_choose_us: whyChooseUs,
          }
        : current,
    );
    setSettingsDeliveryInfo(deliveryInfo ?? "");
    setSettingsPaymentOptions(paymentOptions ?? "");
    setSettingsWhyChooseUs(whyChooseUs ?? "");
    setDeliveryInfoMessage(t("settings.customerInfoSaved"));
    setIsSavingDeliveryInfo(false);
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");

    if (newPassword.length < 6) {
      setPasswordMessage(t("settings.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage(t("settings.passwordMismatch"));
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMessage(getUserFacingError(error, "settings.password", t));
      setIsUpdatingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordMessage(t("settings.passwordUpdated"));
    setIsUpdatingPassword(false);
  }

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((order) => order.status === orderFilter);
  const storePath = merchant?.slug ? `/store/${merchant.slug}` : "";
  const storeUrl = storePath ? buildAbsoluteUrl(storePath) : "";
  const orderStats = useMemo(() => {
    const today = new Date().toDateString();

    return orders.reduce(
      (stats, order) => {
        if (new Date(order.created_at).toDateString() === today) {
          stats.todaySales += order.total ?? 0;
          stats.todayOrders += 1;
        }

        if (order.status === "pending") {
          stats.pendingOrders += 1;
        }

        return stats;
      },
      { pendingOrders: 0, todayOrders: 0, todaySales: 0 },
    );
  }, [orders]);
  const recentOrders = orders.slice(0, 3);
  const settingsWhatsappStartsWithZero =
    settingsWhatsappNumber.trim().startsWith("0");
  const helpUrl = buildWhatsAppUrl(
    PLATFORM_HELP_NUMBER,
    t("support.helpMessage"),
  );

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-[#1A1A18]">
        <p className="text-sm font-medium text-[#888888]">
          {t("dashboard.checkingSession")}
        </p>
      </main>
    );
  }

  if (merchant) {
    const subscriptionAccess = getSubscriptionAccess(merchant);

    if (!subscriptionAccess.canAccess) {
      return (
        <ExpiredAccessScreen
          merchant={merchant}
          expiredFrom={subscriptionAccess.expiredFrom}
        />
      );
    }
  }

  const subscriptionAccess = merchant ? getSubscriptionAccess(merchant) : null;
  const planName = getPlanName(merchant, locale);
  const daysRemaining = subscriptionAccess?.daysRemaining;
  const showProminentSubscription = merchant?.subscription_status === "trial";
  const expiryLabel = subscriptionAccess?.expiryDate
    ? formatDateLabel(subscriptionAccess.expiryDate, locale) ?? t("common.notRecorded")
    : t("common.notRecorded");
  const activePlanCycle =
    merchant?.subscription_status === "active"
      ? merchant.billing_cycle_months
      : null;
  const activeHomePlanName =
    activePlanCycle === 12
      ? t("settings.annualPlan")
      : t("settings.monthlyPlan");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F5F2] pb-28 text-[#1A1A18]">
      <header className="sticky top-0 z-20 border-b border-[#EDECEA] bg-white">
        <div className="mx-auto w-full max-w-5xl">
          <div className="relative flex min-w-0 items-center justify-between gap-3 px-4 py-5 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#1A1A18] text-white">
                {merchant?.logo_url ? (
                  <img
                    className="h-full w-full object-cover"
                    src={merchant.logo_url}
                    alt={`${merchant.business_name ?? "Store"} logo`}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[13px] font-bold">
                    {(merchant?.business_name ?? "S").charAt(0)}
                  </span>
                )}
              </div>
              <button
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                type="button"
                onClick={() => setIsStoreMenuOpen((isOpen) => !isOpen)}
                aria-expanded={isStoreMenuOpen}
              >
                <span className="max-w-[132px] truncate text-[13px] font-bold leading-none min-[390px]:max-w-[170px] sm:max-w-[320px]">
                  {merchant?.business_name ?? "Your store"}
                </span>
                <span className="shrink-0 text-[#888888]">
                  {isStoreMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </span>
              </button>

              {isStoreMenuOpen ? (
                <div className="absolute left-4 top-[72px] z-30 w-[240px] overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.10)] ring-1 ring-[#EDECEA]">
                  <button
                    className="flex h-[60px] w-full min-w-0 items-center gap-4 px-5 text-left text-[13px] font-medium text-[#1A1A18] transition hover:bg-[#F7F5F2]"
                    type="button"
                    onClick={handleSignOut}
                  >
                    <LogOut
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-[#888888]"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {t("settings.logout")}
                    </span>
                  </button>
                  <div className="mx-5 h-px bg-[#EDECEA]" />
                  {merchant ? (
                    <a
                      className="flex h-[60px] w-full min-w-0 items-center gap-4 px-5 text-[13px] font-bold text-[#25D366] transition hover:bg-[#F7F5F2]"
                      href={buildUpgradeUrl(merchant, locale)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Zap aria-hidden="true" className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">
                        {t("dashboard.upgrade")}
                      </span>
                    </a>
                  ) : null}
                  <div className="mx-5 h-px bg-[#EDECEA]" />
                  <button
                    className="flex h-[60px] w-full min-w-0 items-center gap-4 px-5 text-left text-[13px] font-medium text-[#1A1A18] transition hover:bg-[#F7F5F2]"
                    type="button"
                    onClick={() => {
                      setIsStoreMenuOpen(false);
                      setIsSellingTipsOpen(true);
                    }}
                  >
                    <Lightbulb
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-[#888888]"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {t("dashboard.sellingTips")}
                    </span>
                  </button>
                  <div className="mx-5 h-px bg-[#EDECEA]" />
                  <a
                    className="flex h-[60px] w-full min-w-0 items-center gap-4 px-5 text-[13px] font-medium text-[#1A1A18] transition hover:bg-[#F7F5F2]"
                    href={helpUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-[#888888]"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {t("dashboard.getHelp")}
                    </span>
                  </a>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F5F2] text-[#1A1A18] transition hover:bg-[#EDECEA]"
                type="button"
                onClick={handleCopyStoreLink}
                aria-label={t("dashboard.copyLink")}
                title={storeLinkCopied ? t("common.linkCopied") : t("dashboard.copyLink")}
              >
                <CopyIcon />
              </button>
              {storeUrl ? (
                <a
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F5F2] text-[#1A1A18] transition hover:bg-[#EDECEA]"
                  href={storeUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("dashboard.viewStore")}
                >
                  <ExternalLinkIcon />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {storeLinkCopied ? (
        <div className="fixed left-4 right-4 top-20 z-40 mx-auto max-w-sm rounded-2xl border border-[#EDECEA] bg-white px-4 py-3 text-center text-[12px] font-semibold leading-5 text-[#1A1A18] shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
          {t("dashboard.linkCopied")}
        </div>
      ) : null}

      {isSellingTipsOpen ? (
        <section className="fixed inset-0 z-[100] flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-white text-[#1A1A18]">
          <header className="shrink-0 border-b border-[#EDECEA] px-5 py-4">
            <div className="mx-auto flex w-full max-w-2xl min-w-0 items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F5F2] text-[#1A1A18]">
                  <BookOpen aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-[18px] font-bold">
                    {t("dashboard.sellingTips")}
                  </h2>
                  <p className="mt-0.5 truncate text-xs font-medium text-[#888888]">
                    {t("dashboard.sellingTipsSubtitle")}
                  </p>
                </div>
              </div>
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F5F2] text-[#1A1A18] transition hover:bg-[#EDECEA]"
                type="button"
                aria-label="Close selling tips"
                onClick={() => setIsSellingTipsOpen(false)}
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-scroll px-5 py-5 [-webkit-overflow-scrolling:touch]">
            <div className="mx-auto w-full max-w-2xl pb-8">
              <div className="grid gap-3">
                {sellingTips[locale].map((section) => (
                  <article
                    className="rounded-2xl border border-[#EDECEA] bg-white p-4"
                    key={section.title}
                  >
                    <h3 className="text-[13px] font-bold">{section.title}</h3>
                    <ul className="mt-3 grid gap-2">
                      {section.items.map((item) => (
                        <li
                          className="flex min-w-0 gap-2 text-[12px] font-medium leading-5 text-[#666666]"
                          key={item}
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#25D366]" />
                          <span className="min-w-0 flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        {activeTab === "home" ? (
          <section className="grid gap-6">
            <div>
              <h1 className="text-[26px] font-bold leading-none sm:text-[30px]">
                {t("dashboard.today")}
              </h1>
              <p className="mt-2 text-sm font-medium text-[#888888]">
                {t("dashboard.todaySub")}
              </p>
            </div>

            {!merchant ? (
              <div className="h-11 rounded-full border border-[#EDECEA] bg-white shadow-sm" />
            ) : showProminentSubscription ? (
              <div className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border-2 border-[#F59E0B] bg-[#FFFBEB] p-4 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#92400E]">
                    {planName}
                  </p>
                  <p className="mt-1 text-[13px] font-medium leading-5 text-[#B45309]">
                    {t("dashboard.expiresIn", { days: daysRemaining ?? 0 })}
                  </p>
                </div>
                <a
                  className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] px-5 py-3.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                  href={buildUpgradeUrl(merchant, locale)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("dashboard.upgrade")}
                </a>
              </div>
            ) : merchant.subscription_status === "active" ? (
              <div className="flex min-w-0 items-center justify-between gap-3 rounded-full border border-[#EDECEA] bg-white px-4 py-3 shadow-sm">
                <p className="flex min-w-0 flex-1 items-center gap-2 text-[11px] font-medium text-[#888888]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#25D366]" />
                  <span className="min-w-0 flex-1 truncate">
                    {activeHomePlanName} · {t("dashboard.active")}
                  </span>
                </p>
                <span className="shrink-0 text-[11px] font-medium text-[#999999]">
                  {t("dashboard.renews", { date: expiryLabel })}
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#EDECEA] bg-white p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                  {t("dashboard.subscription")}
                </p>
                <p className="mt-1 text-[13px] font-bold">{planName}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <StatCard label={t("dashboard.orders")} value={orderStats.todayOrders} />
              <StatCard
                label={t("dashboard.pending")}
                value={orderStats.pendingOrders}
                highlight
              />
              <StatCard label={t("dashboard.chats")} value={todayChatClicks} />
            </div>

            <section>
              <div className="mb-3 flex min-w-0 items-center justify-between gap-4">
                <h2 className="min-w-0 flex-1 truncate text-[15px] font-bold">
                  {t("dashboard.recentOrders")}
                </h2>
                <button
                  className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-[#25D366]"
                  type="button"
                  onClick={() => handleTabChange("orders")}
                >
                  {t("dashboard.viewAll")}
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
              {isLoadingOrders ? (
                <p className="rounded-2xl border border-[#EDECEA] bg-white p-4 py-8 text-center text-sm font-medium text-[#888888]">
                  {t("dashboard.loadingOrders")}
                </p>
              ) : recentOrders.length ? (
                <div className="grid gap-3">
                  {recentOrders.map((order) => (
                    <HomeRecentOrderCard
                      key={order.id}
                      order={order}
                      currencyCode={merchantCurrencyCode}
                      locale={locale}
                      onDetails={() => handleTabChange("orders")}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-[#EDECEA] bg-white p-4 py-8 text-center text-sm font-medium text-[#888888]">
                  {t("dashboard.noRecentOrders")}
                </p>
              )}
            </section>

            <Link
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#1A1A18] px-4 py-[15px] text-[14px] font-bold text-white transition hover:bg-[#2E2E2C] active:scale-[0.99]"
              href="/dashboard/products/new"
            >
              + {t("dashboard.addProduct")}
            </Link>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="-mx-4 -my-6 flex min-h-[calc(100vh-9rem)] flex-col gap-4 bg-[#F7F5F2] px-4 py-6 sm:-mx-6 sm:px-6">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-xs font-medium text-[#999999]">
                {products.length === 1
                  ? t("dashboard.productCountOne")
                  : t("dashboard.productCount", { count: products.length })}
              </p>
              <Link
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#1A1A18] px-4 text-xs font-bold text-white transition hover:bg-[#2E2E2C] active:scale-[0.99]"
                href="/dashboard/products/new"
              >
                <PlusIcon />
                {t("dashboard.addProduct")}
              </Link>
            </div>

            {message ? (
              <p
                className={`mb-3 rounded-xl border px-4 py-3.5 text-sm ${
                  message === t("dashboard.productDeleted")
                    ? "border-[#25D366]/20 bg-[#EAF7EF] text-[#0F6B34]"
                    : "border-[#EDECEA] bg-[#F4F3F0] text-[#B91C1C]"
                }`}
              >
                {message}
              </p>
            ) : null}

            {isLoadingProducts ? (
              <p className="py-10 text-sm font-medium text-[#888888]">
                {t("dashboard.loadingProducts")}
              </p>
            ) : null}

            {!isLoadingProducts && !products.length && !message ? (
              <div className="py-12 text-center">
                <h3 className="text-[18px] font-bold">
                  {t("dashboard.noProducts")}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-[#888888]">
                  {t("dashboard.addFirstProduct")}
                </p>
                <Link
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1A1A18] px-4 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99]"
                  href="/dashboard/products/new"
                >
                  {t("dashboard.addProduct")}
                </Link>
              </div>
            ) : null}

            {!isLoadingProducts && products.length ? (
              <div className="grid w-full max-w-full min-w-0 auto-rows-max content-start gap-3 overflow-hidden">
                {products.map((product) => {
                  const thumbnail = product.photo_urls?.[0];
                  const liveProductPath = merchant?.slug
                    ? `/store/${merchant.slug}/${product.id}`
                    : "";
                  const liveProductUrl = liveProductPath
                    ? buildAbsoluteUrl(liveProductPath)
                    : "";

                  return (
                    <article
                      className="grid h-[106px] w-full max-w-full min-w-0 grid-cols-[68px_minmax(0,1fr)_24px] items-start gap-3 overflow-hidden rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm"
                      key={product.id}
                    >
                      <Link
                        className="block h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl border border-[#EDECEA] bg-[#F7F5F2]"
                        href={`/dashboard/products/${product.id}`}
                      >
                        {thumbnail ? (
                          <img
                            className="h-full w-full object-cover"
                            src={thumbnail}
                            alt={product.name}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-medium text-[#888888]">
                            {t("common.noPhoto")}
                          </span>
                        )}
                      </Link>

                      <Link
                        className="block w-full min-w-0 max-w-full overflow-hidden pt-1"
                        href={`/dashboard/products/${product.id}`}
                      >
                        <h3 className="block w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold leading-snug text-[#1A1A18]">
                          {product.name}
                        </h3>
                        <div className="mt-1 flex min-w-0 items-baseline gap-2 overflow-hidden">
                          <span className="shrink-0 text-[13px] font-bold text-[#1A1A18]">
                            {formatPrice(product.sale_price, merchantCurrencyCode, locale) ||
                              t("product.priceOnRequest")}
                          </span>
                          {product.sale_price !== null && product.original_price ? (
                            <span className="min-w-0 truncate text-xs text-[#BDB9B2] line-through">
                              {formatPrice(
                                product.original_price,
                                merchantCurrencyCode,
                                locale,
                              )}
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={`mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            product.in_stock
                              ? "bg-[#EAF7EF] text-[#15803D]"
                              : "bg-[#FEF2F2] text-[#B91C1C]"
                          }`}
                        >
                          {product.in_stock ? t("product.inStock") : t("product.outOfStock")}
                        </p>
                      </Link>

                      <div className="flex w-6 shrink-0 flex-col items-center gap-1.5 pt-1">
                        <Link
                          aria-label={t("dashboard.editProduct", { name: product.name })}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-[#BBBBBB] transition hover:bg-[#F7F5F2] hover:text-[#1A1A18]"
                          href={`/dashboard/products/${product.id}`}
                        >
                          <PencilIcon />
                        </Link>
                        <button
                          aria-label={t("dashboard.deleteProduct", { name: product.name })}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-[#BBBBBB] transition hover:bg-[#F7F5F2] hover:text-[#EF4444]"
                          type="button"
                          onClick={() => handleDelete(product)}
                        >
                          <TrashIcon />
                        </button>
                        {liveProductUrl ? (
                          <a
                            aria-label={t("dashboard.viewLiveProduct", { name: product.name })}
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#BBBBBB] transition hover:bg-[#F7F5F2] hover:text-[#1A1A18]"
                            href={liveProductUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLinkIcon />
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "orders" ? (
          <section className="mt-2 grid gap-4 overflow-hidden">
            <div className="min-w-0 overflow-hidden">
              <div className="flex min-w-0 gap-3 overflow-x-auto pb-4">
                {orderFilters.map((filter) => (
                  <button
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition ${
                      orderFilter === filter.value
                        ? "border-[#1A1A18] bg-[#1A1A18] text-white"
                        : "border-[#EDECEA] bg-white text-[#666666] hover:border-[#1A1A18] hover:text-[#1A1A18]"
                    }`}
                    key={filter.value}
                    type="button"
                    onClick={() => setOrderFilter(filter.value)}
                  >
                    {t(filter.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {orderMessage ? (
              <p className="mt-4 rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-4 py-3.5 text-sm text-[#B91C1C]">
                {orderMessage}
              </p>
            ) : null}

            {isLoadingOrders ? (
              <p className="py-10 text-sm font-medium text-[#888888]">
                {t("dashboard.loadingOrders")}
              </p>
            ) : null}

            {!isLoadingOrders && !orders.length && !orderMessage ? (
              <div className="py-12 text-center">
                <h3 className="text-[18px] font-bold">
                  {t("dashboard.noOrders")}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-[#888888]">
                  {t("dashboard.shareStore")}
                </p>
              </div>
            ) : null}

            {!isLoadingOrders && orders.length && !filteredOrders.length ? (
              <p className="py-10 text-center text-sm font-medium text-[#888888]">
                {t("dashboard.noFilteredOrders", {
                  status:
                    orderFilter === "all"
                      ? t("orders.filterAll").toLowerCase()
                      : t(orderStatusLabelKeys[orderFilter]).toLowerCase(),
                })}
              </p>
            ) : null}

            {!isLoadingOrders && filteredOrders.length ? (
              <div className="grid gap-3">
                {filteredOrders.map((order) => (
                  <OrderSummaryCard
                    key={order.id}
                    order={order}
                    currencyCode={merchantCurrencyCode}
                    locale={locale}
                    onStatusChange={handleOrderStatusChange}
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "settings" ? (
          <section className="grid gap-4 bg-[#F7F5F2]">
            <section className="grid gap-3">
              <h2 className="text-[18px] font-bold">{t("settings.appearance")}</h2>
              <ThemeToggle />
              <div className="rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm">
                <p className="mb-2 text-[11px] font-bold uppercase text-[#AAAAAA]">
                  {t("language.label")}
                </p>
                <LanguageSwitcher
                  compact
                  onChange={async (nextLocale) => {
                    setMerchantLocale(nextLocale);
                    if (!merchant) {
                      return;
                    }

                    const { error } = await supabase
                      .from("merchants")
                      .update({ preferred_locale: nextLocale })
                      .eq("id", merchant.id);

                    if (error) {
                      setSettingsMessage(getUserFacingError(error, "settings.save", t));
                      return;
                    }

                    setMerchant((current) =>
                      current
                        ? {
                            ...current,
                            preferred_locale: nextLocale as Locale,
                          }
                        : current,
                    );
                  }}
                />
              </div>
            </section>

            <form
              className="rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm"
              onSubmit={handleSettingsSubmit}
            >
              <SettingsSectionTitle icon={<Store className="h-5 w-5" />}>
                {t("settings.storeDetails")}
              </SettingsSectionTitle>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.businessName")}
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <Store className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      value={settingsBusinessName}
                      onChange={(event) =>
                        setSettingsBusinessName(event.target.value)
                      }
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.tagline")}
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <Tag className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      maxLength={MAX_TAGLINE_CHARS}
                      value={settingsTagline}
                      onChange={(event) =>
                        setSettingsTagline(
                          event.target.value.slice(0, MAX_TAGLINE_CHARS),
                        )
                      }
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("common.currency")}
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <CreditCard className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <select
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1A1A18] outline-none"
                      value={settingsCurrencyCode}
                      onChange={(event) =>
                        setSettingsCurrencyCode(
                          normalizeCurrencyCode(event.target.value),
                        )
                      }
                    >
                      {supportedCurrencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.label} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <label className="block min-w-0 max-w-full">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.storeUrl")}
                  </span>
                  <div className="flex h-12 max-w-full overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <Globe className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <span className="flex h-full shrink-0 items-center border-r border-[#EDECEA] pr-3 text-sm font-semibold text-[#888888]">
                      /store/
                    </span>
                    <input
                      className="h-full min-w-0 flex-1 basis-0 bg-transparent px-3 text-sm font-medium outline-none"
                      value={settingsSlug}
                      onBlur={checkSettingsSlugAvailability}
                      onChange={(event) => {
                        setIsSlugAvailable(null);
                        setSettingsSlug(normalizeSlug(event.target.value));
                      }}
                      required
                    />
                  </div>
                  {isCheckingSlug ? (
                    <p className="mt-2 text-sm text-[#888888]">
                      {t("settings.checkingUrl")}
                    </p>
                  ) : null}
                  {isSlugAvailable ? (
                    <p className="mt-2 text-sm font-medium text-[#25D366]">
                      {t("settings.urlAvailable", {
                        slug: normalizeSlug(settingsSlug),
                      })}
                    </p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.whatsapp")}
                  </span>
                  <InternationalPhoneInput
                    defaultCountry={settingsCountryCode}
                    locale={locale}
                    required
                    value={settingsWhatsappNumber}
                    onChange={setSettingsWhatsappNumber}
                    onCountryChange={setSettingsCountryCode}
                  />
                  {settingsWhatsapp ? (
                    <p className="mt-2 text-sm text-[#888888]">
                      {t("settings.savedAs", { number: settingsWhatsapp.e164 })}
                    </p>
                  ) : null}
                  {settingsWhatsappStartsWithZero ? (
                    <p className="mt-2 rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-4 py-3.5 text-sm text-[#B91C1C]">
                      {t("settings.leadingZero")}
                    </p>
                  ) : null}
                </label>

                <section>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                      {t("settings.logo")}
                    </span>
                    <span className="flex min-h-14 min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#E5E5E5] bg-[#F4F3F0] px-3 py-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#EDECEA] bg-white text-[#888888]">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#1A1A18]">
                          {settingsLogoPreviewUrl
                            ? t("settings.changeLogo")
                            : t("settings.uploadLogo")}
                        </span>
                        <span className="block text-xs font-medium text-[#888888]">
                          {t("settings.logoTypes")}
                        </span>
                      </span>
                    </span>
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={handleSettingsLogoChange}
                    />
                  </label>
                  {settingsLogoPreviewUrl ? (
                    <div className="mt-4 flex min-w-0 items-center gap-4">
                      <img
                        className="h-20 w-20 shrink-0 rounded-xl border border-[#EDECEA] object-cover"
                        src={settingsLogoPreviewUrl}
                        alt="Store logo preview"
                      />
                      <button
                        className="min-w-0 flex-1 truncate text-left text-xs font-semibold text-[#EF4444] hover:underline"
                        type="button"
                        onClick={() => {
                          setSettingsLogoFile(null);
                          setSettingsLogoPreviewUrl("");
                        }}
                      >
                        {t("settings.removeLogo")}
                      </button>
                    </div>
                  ) : null}
                  {isCompressingSettingsLogo ? (
                    <p className="mt-3 text-sm font-medium text-[#888888]">
                      {t("settings.compressingLogo")}
                    </p>
                  ) : null}
                </section>
              </div>

              {settingsMessage ? (
                <p className="mt-5 rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-4 py-3.5 text-sm text-[#1A1A18]">
                  {settingsMessage}
                </p>
              ) : null}

              <button
                className="mt-6 h-12 w-full rounded-xl bg-[#111111] px-4 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                type="submit"
                disabled={
                  isSavingSettings ||
                  isCompressingSettingsLogo ||
                  isCheckingSlug ||
                  !settingsBusinessName.trim() ||
                  !normalizeSlug(settingsSlug) ||
                  !settingsWhatsapp
                }
              >
                {isSavingSettings
                  ? t("common.saving")
                  : isCompressingSettingsLogo
                    ? t("settings.compressing")
                    : t("settings.saveSettings")}
              </button>
            </form>

            <form
              className="rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm"
              onSubmit={handleDeliveryInfoSubmit}
            >
              <h2 className="text-[18px] font-bold">
                {t("settings.customerInfo")}
              </h2>
              <p className="mt-1 text-xs font-medium text-[#888888]">
                {t("settings.optionalDetails")}
              </p>
              <div className="mt-4 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.deliveryInfo")}
                  </span>
                  <textarea
                    className="min-h-24 w-full resize-none rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-3 py-3 text-sm font-medium leading-6 outline-none transition placeholder:text-[#888888] focus:border-[#1A1A18] focus:ring-2 focus:ring-[#1A1A18]/10"
                    maxLength={MAX_DELIVERY_INFO_CHARS}
                    placeholder={t("settings.deliveryPlaceholder")}
                    value={settingsDeliveryInfo}
                    onChange={(event) =>
                      setSettingsDeliveryInfo(
                        event.target.value.slice(0, MAX_DELIVERY_INFO_CHARS),
                      )
                    }
                  />
                  <div className="mt-2 flex min-w-0 items-start justify-between gap-4">
                    <p className="min-w-0 flex-1 text-xs font-medium leading-5 text-[#888888]">
                      {t("settings.deliveryInfoHelp")}
                    </p>
                    <p className="shrink-0 text-xs font-bold text-[#888888]">
                      {settingsDeliveryInfo.length}/{MAX_DELIVERY_INFO_CHARS}
                    </p>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.paymentOptions")}
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <CreditCard className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      maxLength={MAX_PAYMENT_OPTIONS_CHARS}
                      placeholder={t("settings.paymentPlaceholder")}
                      value={settingsPaymentOptions}
                      onChange={(event) =>
                        setSettingsPaymentOptions(
                          event.target.value.slice(0, MAX_PAYMENT_OPTIONS_CHARS),
                        )
                      }
                    />
                  </div>
                  <p className="mt-2 text-right text-xs font-bold text-[#888888]">
                    {settingsPaymentOptions.length}/{MAX_PAYMENT_OPTIONS_CHARS}
                  </p>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.whyChooseUs")}
                  </span>
                  <div className="flex min-h-24 min-w-0 overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon className="self-start pt-4">
                      <ShieldCheck className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <textarea
                      className="min-h-24 min-w-0 flex-1 resize-none bg-transparent py-3 pr-3 text-sm font-medium leading-6 text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      maxLength={MAX_WHY_CHOOSE_US_CHARS}
                      placeholder={t("settings.whyChoosePlaceholder")}
                      value={settingsWhyChooseUs}
                      onChange={(event) =>
                        setSettingsWhyChooseUs(
                          event.target.value.slice(0, MAX_WHY_CHOOSE_US_CHARS),
                        )
                      }
                    />
                  </div>
                  <p className="mt-2 text-right text-xs font-bold text-[#888888]">
                    {settingsWhyChooseUs.length}/{MAX_WHY_CHOOSE_US_CHARS}
                  </p>
                </label>
              </div>
              {deliveryInfoMessage ? (
                <p className="mt-3 rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-4 py-3.5 text-sm text-[#1A1A18]">
                  {deliveryInfoMessage}
                </p>
              ) : null}
              <button
                className="mt-4 w-full rounded-xl border border-[#E5E5E5] bg-transparent px-4 py-[15px] text-sm font-semibold text-[#111111] transition hover:bg-[#F8F8F8] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                type="submit"
                disabled={isSavingDeliveryInfo}
              >
                {isSavingDeliveryInfo ? t("common.saving") : t("settings.saveInfo")}
              </button>
            </form>

            <form
              className="rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm"
              onSubmit={handlePasswordSubmit}
            >
              <SettingsSectionTitle icon={<Lock className="h-5 w-5" />}>
                {t("settings.security")}
              </SettingsSectionTitle>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.newPassword")}
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <Lock className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    {t("settings.confirmPassword")}
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <Lock className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={(event) =>
                        setConfirmNewPassword(event.target.value)
                      }
                    />
                  </div>
                </label>
              </div>
              {passwordMessage ? (
                <p className="mt-4 rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-4 py-3.5 text-sm text-[#1A1A18]">
                  {passwordMessage}
                </p>
              ) : null}
              <button
                className="mt-5 h-12 w-full rounded-xl bg-[#111111] px-4 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                type="submit"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? t("settings.updating") : t("settings.updatePassword")}
              </button>
            </form>

            <section className="grid gap-4 rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">{t("settings.subscription")}</h2>
              <div className="rounded-2xl border border-[#EDECEA] bg-[#F7F5F2] p-4">
                <h3 className="text-[13px] font-bold">
                  {t("settings.everything")}
                </h3>
                <ul className="mt-3 grid gap-2">
                  {includedFeatureKeys.map((featureKey) => (
                    <li
                      className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-[#666666]"
                      key={featureKey}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#25D366]" />
                      <span className="min-w-0 flex-1">{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {[
                {
                  name: "Monthly" as const,
                  cycle: 1 as const,
                  price: "₵39",
                },
                {
                  name: "Annual" as const,
                  cycle: 12 as const,
                  price: "₵299",
                },
              ].map((plan) => {
                const isActivePlan = activePlanCycle === plan.cycle;
                const cta = getSubscriptionPlanCta({
                  activePlanCycle,
                  daysRemaining,
                  planCycle: plan.cycle,
                });

                return (
                  <article
                    className={`relative rounded-2xl border p-4 ${
                      plan.cycle === 12
                        ? "border-[#25D366]/20 bg-[#EAF7EF]"
                        : "border-[#EDECEA] bg-white"
                    }`}
                    key={plan.name}
                  >
                    {plan.cycle === 12 ? (
                      <span className="absolute right-3 top-0 -translate-y-1/2 rounded-sm bg-[#25D366] px-2 py-1 text-[9px] font-bold text-white">
                        {t("settings.bestValue")}
                      </span>
                    ) : null}
                    {isActivePlan ? (
                      <div className="mb-4 flex min-w-0 items-center justify-between gap-3 rounded-full border border-[#EDECEA] bg-white px-3 py-2">
                        <p className="flex min-w-0 flex-1 items-center gap-2 text-[11px] font-medium text-[#888888]">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#25D366]" />
                          <span className="min-w-0 flex-1 truncate">
                            {plan.name === "Annual"
                              ? t("settings.annualPlan")
                              : t("settings.monthlyPlan")}
                          </span>
                        </p>
                        <span className="shrink-0 text-xs font-medium text-[#999999]">
                          {t("dashboard.renews", { date: expiryLabel })}
                        </span>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-[15px] font-bold">
                          {plan.name === "Annual"
                            ? t("settings.annual")
                            : t("settings.monthly")}
                        </h3>
                        <p className="mt-1 flex min-w-0 items-end gap-1">
                          <span className="text-[24px] font-bold leading-none">
                            {plan.price}
                          </span>
                          <span className="pb-0.5 text-xs font-medium text-[#888888]">
                            {plan.cycle === 12
                              ? t("settings.yearSuffix")
                              : t("settings.monthSuffix")}
                          </span>
                        </p>
                      </>
                    )}
                    {merchant && cta.disabled ? (
                      <button
                        className="subscription-neutral-button mt-4 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border px-4 py-4 text-[14px] font-bold"
                        type="button"
                        disabled
                      >
                        <span className="min-w-0 truncate">
                          {t(cta.labelKey)}
                        </span>
                      </button>
                    ) : merchant ? (
                      <a
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-[14px] font-bold text-white transition active:scale-[0.99]"
                        href={buildPlanWhatsAppUrl(
                          merchant,
                          plan.name,
                          cta.intent,
                          locale,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 truncate">
                          {t(cta.labelKey)}
                        </span>
                      </a>
                    ) : null}
                  </article>
                );
              })}
              {merchant?.subscription_status === "trial" ? (
                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#EDECEA] bg-[#F4F3F0] p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EDECEA] bg-white text-[#888888]">
                    <Zap className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">
                      {t("settings.activeTrial")}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-[#888888]">
                      {t("settings.daysTrialRemaining", {
                        days: daysRemaining ?? 0,
                      })}
                    </p>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-[#EDECEA] bg-white p-4 text-center shadow-sm">
              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#EF4444] bg-white text-sm font-semibold text-[#EF4444] transition hover:opacity-70"
                type="button"
                onClick={handleSignOut}
              >
                <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{t("settings.logout")}</span>
              </button>
              <p className="mt-5 text-xs font-medium text-[#888888]">
                {t("settings.helpQuestion")}
              </p>
              <a
                className="mt-2 inline-flex min-w-0 items-center justify-center gap-1.5 text-sm font-bold text-[#25D366] underline-offset-4 hover:underline"
                href={helpUrl}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">
                  {t("settings.help")}
                </span>
              </a>
            </section>
          </section>
        ) : null}
      </section>

      {!isSellingTipsOpen ? (
        <nav className="fixed inset-x-0 bottom-0 z-[80] w-full translate-y-0 transform-gpu border-t border-[#EDECEA] bg-white px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_18px_rgba(0,0,0,0.06)]">
          <div
            className="grid w-full grid-cols-4 items-stretch"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            }}
          >
            {(["home", "products", "orders", "settings"] as DashboardTab[]).map(
              (tab) => {
                const active = activeTab === tab;

                return (
                  <button
                    className={`flex h-14 min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold capitalize transition sm:text-xs ${
                      active ? "text-[#1A1A18]" : "text-[#888888]"
                    }`}
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab === "home" ? <HomeIcon active={active} /> : null}
                    {tab === "products" ? (
                      <ProductsIcon active={active} />
                    ) : null}
                    {tab === "orders" ? <OrdersIcon active={active} /> : null}
                    {tab === "settings" ? (
                      <SettingsIcon active={active} />
                    ) : null}
                    <span>
                      {tab === "home"
                        ? t("dashboard.home")
                        : tab === "products"
                          ? t("dashboard.products")
                          : tab === "orders"
                            ? t("dashboard.orders")
                            : t("dashboard.settings")}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </nav>
      ) : null}
    </main>
  );
}
