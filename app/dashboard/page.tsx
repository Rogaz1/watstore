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
  Phone,
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
import { compressImageForUpload } from "../components/imageCompression";
import { getMerchantForUser } from "../components/merchantProfile";
import {
  formatGhsPrice,
  formatPrice,
  Merchant,
  Order,
  OrderStatus,
  Product,
} from "../components/productTypes";
import { buildUpgradeUrl } from "../components/subscription";
import { buildWhatsAppUrl } from "../components/publicStoreTypes";
import {
  getSubscriptionAccess,
  refreshMerchantSubscription,
} from "../components/subscription";
import { useRequireUser } from "../components/useRequireUser";

const LOGO_BUCKET = "merchant-logos";
const PLATFORM_HELP_NUMBER = "233509396861";
const MAX_TAGLINE_CHARS = 60;
const MAX_DELIVERY_INFO_CHARS = 200;
const MAX_PAYMENT_OPTIONS_CHARS = 150;
const MAX_WHY_CHOOSE_US_CHARS = 300;

const sellingTips = [
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
];

const includedFeatures = [
  "Unlimited products",
  "Public storefront",
  "WhatsApp ordering",
  "Order management",
  "Product photos, benefits, descriptions, and FAQs",
];

type DashboardTab = "home" | "products" | "orders" | "settings";
type OrderFilter = "all" | OrderStatus;
type ProductSummary = Pick<Product, "id" | "name" | "photo_urls">;
type OrderWithProduct = Order & {
  product?: ProductSummary;
};

const orderStatuses: OrderStatus[] = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
];
const orderFilters: { label: string; value: OrderFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
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

function formatRelativeOrderDate(value: string) {
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
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays}d ago`;
}

function getPlanName(merchant: Merchant | null) {
  if (!merchant) {
    return "Trial Plan";
  }

  if (merchant.subscription_status === "trial") {
    return "Pro Trial Plan";
  }

  if (merchant.subscription_status === "active") {
    return merchant.billing_cycle_months === 12
      ? "Yearly Plan"
      : "Monthly Plan";
  }

  return "Expired Plan";
}

function formatDateLabel(value: string | Date | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function buildPlanWhatsAppUrl(
  merchant: Merchant,
  planName: "Monthly" | "Annual",
  intent: "upgrade" | "renew",
) {
  return buildWhatsAppUrl(
    PLATFORM_HELP_NUMBER,
    [
      `Hello, I'd like to ${intent === "renew" ? "renew" : "upgrade to"} the ${planName} plan.`,
      `Business Name: ${merchant.business_name ?? ""}`,
      `Store: ${merchant.slug ?? ""}`,
    ].join("\n"),
  );
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
}: {
  order: OrderWithProduct;
  onDetails: () => void;
}) {
  const thumbnail = order.product?.photo_urls?.[0];

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
            {formatRelativeOrderDate(order.created_at)}
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
              alt={order.product?.name ?? "Ordered product"}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[#888888]">
              No photo
            </span>
          )}
        </div>
        <div className="min-w-0 flex-[1_1_0%] overflow-hidden">
          <p className="block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-[#25D366]">
            {order.product?.name ?? "Product unavailable"}
          </p>
          <p className="mt-0.5 block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-[#888888]">
            Qty {order.quantity} &middot; {formatGhsPrice(order.total)}
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
          Details
        </button>
      </div>
    </article>
  );
}

function OrderSummaryCard({
  order,
  onStatusChange,
}: {
  order: OrderWithProduct;
  onStatusChange: (order: Order, status: OrderStatus) => void;
}) {
  const thumbnail = order.product?.photo_urls?.[0];

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
            {formatRelativeOrderDate(order.created_at)}
          </span>
          <label className="relative inline-flex h-6 shrink-0 items-center">
            <span className="sr-only">Change order status</span>
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
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2"
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
              alt={order.product?.name ?? "Ordered product"}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[#888888]">
              No photo
            </span>
          )}
        </div>
        <div className="min-w-0 flex-[1_1_0%] overflow-hidden">
          <p className="block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-[#25D366]">
            {order.product?.name ?? "Product unavailable"}
          </p>
          <p className="mt-0.5 block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-[#888888]">
            Qty {order.quantity} &middot; {formatGhsPrice(order.total)}
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
      setSettingsBusinessName(refreshedMerchant.business_name ?? "");
      setSettingsTagline(refreshedMerchant.tagline ?? "");
      setSettingsDeliveryInfo(refreshedMerchant.delivery_info ?? "");
      setSettingsPaymentOptions(refreshedMerchant.payment_options ?? "");
      setSettingsWhyChooseUs(refreshedMerchant.why_choose_us ?? "");
      setSettingsSlug(refreshedMerchant.slug ?? "");
      setSettingsWhatsappNumber(refreshedMerchant.whatsapp_number ?? "");
      setSettingsLogoPreviewUrl(refreshedMerchant.logo_url ?? "");

      if (!access.canAccess) {
        setProducts([]);
        setOrders([]);
        setIsLoadingProducts(false);
        setIsLoadingOrders(false);
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "id,merchant_id,name,sale_price,original_price,photo_urls,video_url,short_description,long_description,key_benefits,in_stock",
        )
        .eq("merchant_id", refreshedMerchant.id)
        .order("name", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (productError) {
        setMessage(productError.message);
        setProducts([]);
      } else {
        setProducts((productData ?? []) as Product[]);
      }

      setIsLoadingProducts(false);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id,merchant_id,product_id,quantity,customer_name,delivery_location,total,status,order_number,created_at",
        )
        .eq("merchant_id", refreshedMerchant.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (orderError) {
        setOrderMessage(orderError.message);
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
        setOrderMessage(orderProductsError.message);
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
  }, [router, userId]);

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

    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .eq("merchant_id", merchant.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
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
      setOrderMessage(error.message);
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
      setSettingsMessage(
        error instanceof Error ? error.message : "Unable to compress logo.",
      );
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
      setSettingsMessage(error.message);
      setIsSlugAvailable(false);
      return false;
    }

    const available = Boolean(data);
    setIsSlugAvailable(available);

    if (!available) {
      setSettingsMessage("That Store URL is already taken. Try another slug.");
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
    const digitsOnlyWhatsapp = settingsWhatsappNumber.replace(/\D/g, "");

    if (
      !settingsBusinessName.trim() ||
      !normalizedSlug ||
      !digitsOnlyWhatsapp
    ) {
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
        slug: normalizedSlug,
        whatsapp_number: digitsOnlyWhatsapp,
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
      setSettingsWhatsappNumber(digitsOnlyWhatsapp);
      setSettingsLogoFile(null);
      setSettingsLogoPreviewUrl(logoUrl ?? "");
      setIsSlugAvailable(null);
      setSettingsMessage("Store settings saved.");
    } catch (error) {
      setSettingsMessage(
        error instanceof Error ? error.message : "Unable to save settings.",
      );
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
      setDeliveryInfoMessage(error.message);
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
    setDeliveryInfoMessage("Customer info saved.");
    setIsSavingDeliveryInfo(false);
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");

    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMessage(error.message);
      setIsUpdatingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordMessage("Password updated.");
    setIsUpdatingPassword(false);
  }

  const filteredOrders =
    orderFilter === "all"
      ? orders
      : orders.filter((order) => order.status === orderFilter);
  const storePath = merchant?.slug ? `/store/${merchant.slug}` : "";
  const storeUrl =
    typeof window === "undefined" || !storePath
      ? storePath
      : `${window.location.origin}${storePath}`;
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
  const settingsDigitsOnlyWhatsapp = settingsWhatsappNumber.replace(/\D/g, "");
  const settingsWhatsappStartsWithZero =
    settingsDigitsOnlyWhatsapp.startsWith("0");
  const helpUrl = buildWhatsAppUrl(
    PLATFORM_HELP_NUMBER,
    "Hi, I need help with my account.",
  );

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-[#1A1A18]">
        <p className="text-sm font-medium text-[#888888]">
          Checking session...
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
  const planName = getPlanName(merchant);
  const daysRemaining = subscriptionAccess?.daysRemaining;
  const showProminentSubscription = merchant?.subscription_status === "trial";
  const expiryLabel = subscriptionAccess?.expiryDate
    ? formatDateLabel(subscriptionAccess.expiryDate)
    : "Not recorded";
  const activePlanCycle =
    merchant?.subscription_status === "active"
      ? merchant.billing_cycle_months
      : null;
  const activeHomePlanName =
    activePlanCycle === 12 ? "Annual Plan" : "Monthly Plan";

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
                    <span className="min-w-0 flex-1 truncate">Log out</span>
                  </button>
                  <div className="mx-5 h-px bg-[#EDECEA]" />
                  {merchant ? (
                    <a
                      className="flex h-[60px] w-full min-w-0 items-center gap-4 px-5 text-[13px] font-bold text-[#25D366] transition hover:bg-[#F7F5F2]"
                      href={buildUpgradeUrl(merchant)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Zap aria-hidden="true" className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">Upgrade</span>
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
                      Selling Tips
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
                    <span className="min-w-0 flex-1 truncate">Get Help</span>
                  </a>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F5F2] text-[#1A1A18] transition hover:bg-[#EDECEA]"
                type="button"
                onClick={handleCopyStoreLink}
                aria-label="Copy store link"
                title={storeLinkCopied ? "Copied" : "Copy store link"}
              >
                <CopyIcon />
              </button>
              {storeUrl ? (
                <a
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F5F2] text-[#1A1A18] transition hover:bg-[#EDECEA]"
                  href={storeUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View store"
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
          Store link copied. Share it with customers so they can visit your
          storefront.
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
                    Selling Tips
                  </h2>
                  <p className="mt-0.5 truncate text-xs font-medium text-[#888888]">
                    Ways to improve your product pages
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
                {sellingTips.map((section) => (
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
                Your Store Today
              </h1>
              <p className="mt-2 text-sm font-medium text-[#888888]">
                Everything you need at a glance.
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
                    Expires in {daysRemaining ?? 0} days
                  </p>
                </div>
                <a
                  className="flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366] px-5 py-3.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                  href={buildUpgradeUrl(merchant)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Upgrade
                </a>
              </div>
            ) : merchant.subscription_status === "active" ? (
              <div className="flex min-w-0 items-center justify-between gap-3 rounded-full border border-[#EDECEA] bg-white px-4 py-3 shadow-sm">
                <p className="flex min-w-0 flex-1 items-center gap-2 text-[11px] font-medium text-[#888888]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#25D366]" />
                  <span className="min-w-0 flex-1 truncate">
                    {activeHomePlanName} · Active
                  </span>
                </p>
                <span className="shrink-0 text-[11px] font-medium text-[#999999]">
                  Renews {expiryLabel}
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#EDECEA] bg-white p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#888888]">
                  Subscription
                </p>
                <p className="mt-1 text-[13px] font-bold">{planName}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Orders" value={orderStats.todayOrders} />
              <StatCard
                label="Pending"
                value={orderStats.pendingOrders}
                highlight
              />
              <StatCard label="Chats" value={0} />
            </div>

            <section>
              <div className="mb-3 flex min-w-0 items-center justify-between gap-4">
                <h2 className="min-w-0 flex-1 truncate text-[15px] font-bold">
                  Recent Orders
                </h2>
                <button
                  className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-[#25D366]"
                  type="button"
                  onClick={() => handleTabChange("orders")}
                >
                  View All
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
              {isLoadingOrders ? (
                <p className="rounded-2xl border border-[#EDECEA] bg-white p-4 py-8 text-center text-sm font-medium text-[#888888]">
                  Loading Orders...
                </p>
              ) : recentOrders.length ? (
                <div className="grid gap-3">
                  {recentOrders.map((order) => (
                    <HomeRecentOrderCard
                      key={order.id}
                      order={order}
                      onDetails={() => handleTabChange("orders")}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-[#EDECEA] bg-white p-4 py-8 text-center text-sm font-medium text-[#888888]">
                  No orders yet - share your store link to get your first one
                </p>
              )}
            </section>

            <Link
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#1A1A18] px-4 py-[15px] text-[14px] font-bold text-white transition hover:bg-[#2E2E2C] active:scale-[0.99]"
              href="/dashboard/products/new"
            >
              + Add Product
            </Link>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="-mx-4 -my-6 grid min-h-[calc(100vh-9rem)] gap-4 bg-[#F7F5F2] px-4 py-6 sm:-mx-6 sm:px-6">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-xs font-medium text-[#999999]">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
              <Link
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#1A1A18] px-4 text-xs font-bold text-white transition hover:bg-[#2E2E2C] active:scale-[0.99]"
                href="/dashboard/products/new"
              >
                <PlusIcon />
                Add Product
              </Link>
            </div>

            {message ? (
              <p className="mb-3 rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-4 py-3.5 text-sm text-[#B91C1C]">
                {message}
              </p>
            ) : null}

            {isLoadingProducts ? (
              <p className="py-10 text-sm font-medium text-[#888888]">
                Loading Products...
              </p>
            ) : null}

            {!isLoadingProducts && !products.length && !message ? (
              <div className="py-12 text-center">
                <h3 className="text-[18px] font-bold">No products yet</h3>
                <p className="mx-auto mt-2 max-w-md text-[#888888]">
                  Add your first product when you are ready.
                </p>
                <Link
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1A1A18] px-4 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99]"
                  href="/dashboard/products/new"
                >
                  Add Product
                </Link>
              </div>
            ) : null}

            {!isLoadingProducts && products.length ? (
              <div className="flex flex-col gap-3">
                {products.map((product) => {
                  const thumbnail = product.photo_urls?.[0];
                  const liveProductPath = merchant?.slug
                    ? `/store/${merchant.slug}/${product.id}`
                    : "";
                  const liveProductUrl =
                    typeof window === "undefined" || !liveProductPath
                      ? liveProductPath
                      : `${window.location.origin}${liveProductPath}`;

                  return (
                      <article
                        className="flex min-h-[106px] w-full max-w-full min-w-0 items-start gap-3 overflow-hidden rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm"
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
                            No photo
                          </span>
                        )}
                      </Link>

                        <Link
                          className="min-w-0 flex-[1_1_0%] overflow-hidden pt-1"
                          href={`/dashboard/products/${product.id}`}
                        >
                          <h3 className="block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold leading-snug text-[#1A1A18]">
                            {product.name}
                          </h3>
                        <div className="mt-1 flex min-w-0 items-baseline gap-2 overflow-hidden">
                          <span className="shrink-0 text-[13px] font-bold text-[#1A1A18]">
                            {formatPrice(product.sale_price)}
                          </span>
                          {product.original_price ? (
                            <span className="min-w-0 truncate text-xs text-[#BDB9B2] line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={`mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            product.in_stock
                              ? "bg-[#EDFBF3] text-[#15803D]"
                              : "bg-[#FEF2F2] text-[#B91C1C]"
                          }`}
                        >
                          {product.in_stock ? "In stock" : "Out of stock"}
                        </p>
                      </Link>

                      <div className="flex shrink-0 flex-col items-center gap-1.5 pt-1">
                        <Link
                          aria-label={`Edit ${product.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-[#BBBBBB] transition hover:bg-[#F7F5F2] hover:text-[#1A1A18]"
                          href={`/dashboard/products/${product.id}`}
                        >
                          <PencilIcon />
                        </Link>
                        <button
                          aria-label={`Delete ${product.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-[#BBBBBB] transition hover:bg-[#F7F5F2] hover:text-[#EF4444]"
                          type="button"
                          onClick={() => handleDelete(product)}
                        >
                          <TrashIcon />
                        </button>
                        {liveProductUrl ? (
                          <a
                            aria-label={`View ${product.name} live`}
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
                    {filter.label}
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
                Loading Orders...
              </p>
            ) : null}

            {!isLoadingOrders && !orders.length && !orderMessage ? (
              <div className="py-12 text-center">
                <h3 className="text-[18px] font-bold">No orders yet</h3>
                <p className="mx-auto mt-2 max-w-md text-[#888888]">
                  Share your store link to start selling.
                </p>
              </div>
            ) : null}

            {!isLoadingOrders && orders.length && !filteredOrders.length ? (
              <p className="py-10 text-center text-sm font-medium text-[#888888]">
                No {orderFilter} orders right now.
              </p>
            ) : null}

            {!isLoadingOrders && filteredOrders.length ? (
              <div className="grid gap-3">
                {filteredOrders.map((order) => (
                  <OrderSummaryCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleOrderStatusChange}
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "settings" ? (
          <section className="grid gap-4 bg-[#F7F5F2]">
            <form
              className="rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm"
              onSubmit={handleSettingsSubmit}
            >
              <SettingsSectionTitle icon={<Store className="h-5 w-5" />}>
                Store Details
              </SettingsSectionTitle>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    Business Name
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
                    Tagline (optional)
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

                <label className="block min-w-0 max-w-full">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    Store URL
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
                      Checking URL...
                    </p>
                  ) : null}
                  {isSlugAvailable ? (
                    <p className="mt-2 text-sm font-medium text-[#25D366]">
                      /store/{normalizeSlug(settingsSlug)} is available.
                    </p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    WhatsApp Number
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <Phone className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      inputMode="tel"
                      value={settingsWhatsappNumber}
                      onChange={(event) =>
                        setSettingsWhatsappNumber(event.target.value)
                      }
                      required
                    />
                  </div>
                  {settingsDigitsOnlyWhatsapp ? (
                    <p className="mt-2 text-sm text-[#888888]">
                      Saved as {settingsDigitsOnlyWhatsapp}
                    </p>
                  ) : null}
                  {settingsWhatsappStartsWithZero ? (
                    <p className="mt-2 rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-4 py-3.5 text-sm text-[#B91C1C]">
                      This starts with 0. Use a country code instead of a local
                      leading zero.
                    </p>
                  ) : null}
                </label>

                <section>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                      Store Logo
                    </span>
                    <span className="flex min-h-14 min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#E5E5E5] bg-[#F4F3F0] px-3 py-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#EDECEA] bg-white text-[#888888]">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#1A1A18]">
                          {settingsLogoPreviewUrl
                            ? "Change Logo"
                            : "Upload Logo"}
                        </span>
                        <span className="block text-xs font-medium text-[#888888]">
                          PNG, JPG accepted
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
                        Remove logo
                      </button>
                    </div>
                  ) : null}
                  {isCompressingSettingsLogo ? (
                    <p className="mt-3 text-sm font-medium text-[#888888]">
                      Compressing logo...
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
                  !settingsDigitsOnlyWhatsapp
                }
              >
                {isSavingSettings
                  ? "Saving..."
                  : isCompressingSettingsLogo
                    ? "Compressing..."
                    : "Save Settings"}
              </button>
            </form>

            <form
              className="rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm"
              onSubmit={handleDeliveryInfoSubmit}
            >
              <h2 className="text-[18px] font-bold">Customer Info</h2>
              <p className="mt-1 text-xs font-medium text-[#888888]">
                Optional details for your customers
              </p>
              <div className="mt-4 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    Delivery Info
                  </span>
                  <textarea
                    className="min-h-24 w-full resize-none rounded-xl border border-[#EDECEA] bg-[#F4F3F0] px-3 py-3 text-sm font-medium leading-6 outline-none transition placeholder:text-[#888888] focus:border-[#1A1A18] focus:ring-2 focus:ring-[#1A1A18]/10"
                    maxLength={MAX_DELIVERY_INFO_CHARS}
                    placeholder="e.g. Same-day delivery in Accra, 2-3 days nationwide."
                    value={settingsDeliveryInfo}
                    onChange={(event) =>
                      setSettingsDeliveryInfo(
                        event.target.value.slice(0, MAX_DELIVERY_INFO_CHARS),
                      )
                    }
                  />
                  <div className="mt-2 flex min-w-0 items-start justify-between gap-4">
                    <p className="min-w-0 flex-1 text-xs font-medium leading-5 text-[#888888]">
                      To help customers understand your delivery terms.
                    </p>
                    <p className="shrink-0 text-xs font-bold text-[#888888]">
                      {settingsDeliveryInfo.length}/{MAX_DELIVERY_INFO_CHARS}
                    </p>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    Payment Options (optional)
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon>
                      <CreditCard className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      maxLength={MAX_PAYMENT_OPTIONS_CHARS}
                      placeholder="e.g. MTN MoMo, Cash on Delivery, Bank Transfer"
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
                    Why Choose Us (optional)
                  </span>
                  <div className="flex min-h-24 min-w-0 overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
                    <SettingsFieldIcon className="self-start pt-4">
                      <ShieldCheck className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <textarea
                      className="min-h-24 min-w-0 flex-1 resize-none bg-transparent py-3 pr-3 text-sm font-medium leading-6 text-[#1A1A18] outline-none placeholder:text-[#888888]"
                      maxLength={MAX_WHY_CHOOSE_US_CHARS}
                      placeholder="e.g. 100% original products, fast response on WhatsApp, trusted by our community"
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
                {isSavingDeliveryInfo ? "Saving..." : "Save Info"}
              </button>
            </form>

            <form
              className="rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm"
              onSubmit={handlePasswordSubmit}
            >
              <SettingsSectionTitle icon={<Lock className="h-5 w-5" />}>
                Security
              </SettingsSectionTitle>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#AAAAAA]">
                    New Password
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
                    Confirm Password
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
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>

            <section className="grid gap-4 rounded-2xl border border-[#EDECEA] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">Subscription Plan</h2>
              <div className="rounded-2xl border border-[#EDECEA] bg-[#F7F5F2] p-4">
                <h3 className="text-[13px] font-bold">What&apos;s included</h3>
                <ul className="mt-3 grid gap-2">
                  {includedFeatures.map((feature) => (
                    <li
                      className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-[#666666]"
                      key={feature}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#25D366]" />
                      <span className="min-w-0 flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {[
                {
                  name: "Monthly" as const,
                  cycle: 1,
                  price: "₵49",
                  suffix: "/month",
                },
                {
                  name: "Annual" as const,
                  cycle: 12,
                  price: "₵399",
                  suffix: "/year",
                },
              ].map((plan) => {
                const isActivePlan = activePlanCycle === plan.cycle;
                const intent = isActivePlan ? "renew" : "upgrade";

                return (
                  <article
                    className={`relative rounded-2xl border p-4 ${
                      plan.cycle === 12
                        ? "border-[#25D366]/20 bg-[#EDFBF3]"
                        : "border-[#EDECEA] bg-white"
                    }`}
                    key={plan.name}
                  >
                    {plan.cycle === 12 ? (
                      <span className="absolute right-3 top-0 -translate-y-1/2 rounded-sm bg-[#25D366] px-2 py-1 text-[9px] font-bold text-white">
                        Best Value - Save ₵189
                      </span>
                    ) : null}
                    {isActivePlan ? (
                      <div className="mb-4 flex min-w-0 items-center justify-between gap-3 rounded-full border border-[#EDECEA] bg-white px-3 py-2">
                        <p className="flex min-w-0 flex-1 items-center gap-2 text-[11px] font-medium text-[#888888]">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#25D366]" />
                          <span className="min-w-0 flex-1 truncate">
                            {plan.name} Plan
                          </span>
                        </p>
                        <span className="shrink-0 text-xs font-medium text-[#999999]">
                          Renews {expiryLabel}
                        </span>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-[15px] font-bold">{plan.name}</h3>
                        <p className="mt-1 flex min-w-0 items-end gap-1">
                          <span className="text-[24px] font-bold leading-none">
                            {plan.price}
                          </span>
                          <span className="pb-0.5 text-xs font-medium text-[#888888]">
                            {plan.suffix}
                          </span>
                        </p>
                      </>
                    )}
                    {merchant ? (
                      <a
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-[14px] font-bold text-white transition active:scale-[0.99]"
                        href={buildPlanWhatsAppUrl(merchant, plan.name, intent)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 truncate">
                          {isActivePlan ? "Renew Early" : "Upgrade"} - Message
                          Us
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
                    <p className="text-sm font-bold">Free Trial Active</p>
                    <p className="mt-0.5 text-xs font-medium text-[#888888]">
                      {daysRemaining ?? 0} days remaining on your trial period.
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
                <span>Log out</span>
              </button>
              <p className="mt-5 text-xs font-medium text-[#888888]">
                Having trouble with your settings?
              </p>
              <a
                className="mt-2 inline-flex min-w-0 items-center justify-center gap-1.5 text-sm font-bold text-[#25D366] underline-offset-4 hover:underline"
                href={helpUrl}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">
                  Need help? Message us on WhatsApp
                </span>
              </a>
            </section>
          </section>
        ) : null}
      </section>

      {!isSellingTipsOpen ? (
        <nav className="fixed bottom-0 left-0 right-0 z-30 w-full border-t border-[#EDECEA] bg-white px-2 py-2">
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
                        ? "Home"
                        : tab === "products"
                          ? "Products"
                          : tab === "orders"
                            ? "Orders"
                            : "Settings"}
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
