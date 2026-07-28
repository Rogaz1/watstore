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
} from "react";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Home,
  Image as ImageIcon,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  Plus,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  User,
  Zap,
  Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ExpiredAccessScreen } from "../components/ExpiredAccessScreen";
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

type DashboardTab = "home" | "products" | "orders" | "settings";
type OrderFilter = "all" | OrderStatus;
type ProductSummary = Pick<Product, "id" | "name" | "photo_urls">;
type OrderWithProduct = Order & {
  product?: ProductSummary;
};

const orderStatuses: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled"];
const orderFilters: { label: string; value: OrderFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
];

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
    return "border-[#C2780C] bg-white text-[#C2780C]";
  }

  if (status === "paid") {
    return "border-[#1DA851] bg-[#1DA851] text-white";
  }

  if (status === "fulfilled") {
    return "border-[#1C1917] bg-[#1C1917] text-white";
  }

  return "border-[#B94A2C] bg-[#FAF9F7] text-[#B94A2C]";
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
    return merchant.billing_cycle_months === 12 ? "Yearly Plan" : "Monthly Plan";
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

function SettingsFieldIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#78716C]">
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
    <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold">
      <span className="shrink-0 text-[#1C1917]">{icon}</span>
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
  return (
    <div className="rounded-xl border border-[#E7E4DF] bg-white px-3 py-3 shadow-[0_8px_18px_rgba(28,25,23,0.06)]">
      <p className="text-[10px] font-bold uppercase text-[#78716C]">{label}</p>
      <p
        className={`mt-1 text-[22px] font-bold leading-none ${
          highlight ? "text-[#1DA851]" : "text-[#1C1917]"
        }`}
      >
        {value}
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
    <article className="rounded-xl border border-[#E7E4DF] bg-white px-4 py-3 shadow-[0_5px_16px_rgba(28,25,23,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5 text-[12px] font-bold">
            <User aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#78716C]" />
            <span className="min-w-0 flex-1 truncate">{order.customer_name}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <span className="hidden shrink-0 items-center gap-1 text-[11px] font-medium text-[#78716C] min-[360px]:inline-flex">
            <Calendar aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {formatRelativeOrderDate(order.created_at)}
          </span>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize leading-none ${homeStatusClasses(
              order.status,
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 border-b border-[#E7E4DF] pb-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E7E4DF] bg-[#FAF9F7]">
          {thumbnail ? (
            <img
              className="h-full w-full object-cover"
              src={thumbnail}
              alt={order.product?.name ?? "Ordered product"}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[#78716C]">
              No photo
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-bold text-[#1DA851]">
            {order.product?.name ?? "Product unavailable"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[#78716C]">
            Qty {order.quantity} &middot; {formatGhsPrice(order.total)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] font-medium text-[#78716C]">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{order.delivery_location}</span>
        </p>
        <button
          className="shrink-0 text-[11px] font-bold text-[#1DA851]"
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
    <article className="rounded-xl border border-[#E7E4DF] bg-white px-4 py-3 shadow-[0_5px_16px_rgba(28,25,23,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5 text-[12px] font-bold">
            <User aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#78716C]" />
            <span className="min-w-0 flex-1 truncate">{order.customer_name}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <span className="hidden shrink-0 items-center gap-1 text-[11px] font-medium text-[#78716C] min-[360px]:inline-flex">
            <Calendar aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {formatRelativeOrderDate(order.created_at)}
          </span>
          <label className="relative inline-flex shrink-0">
            <span className="sr-only">Change order status</span>
            <select
              className={`h-6 max-w-[86px] cursor-pointer appearance-none truncate rounded-full border py-0 pl-2.5 pr-2.5 text-[10px] font-semibold capitalize leading-none outline-none ${homeStatusClasses(
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
          </label>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 border-b border-[#E7E4DF] pb-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E7E4DF] bg-[#FAF9F7]">
          {thumbnail ? (
            <img
              className="h-full w-full object-cover"
              src={thumbnail}
              alt={order.product?.name ?? "Ordered product"}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-[#78716C]">
              No photo
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-bold text-[#1DA851]">
            {order.product?.name ?? "Product unavailable"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-[#78716C]">
            Qty {order.quantity} &middot; {formatGhsPrice(order.total)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-[#78716C]">
        <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{order.delivery_location}</span>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isCheckingAuth } = useRequireUser();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");
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
  const [settingsBusinessName, setSettingsBusinessName] = useState("");
  const [settingsTagline, setSettingsTagline] = useState("");
  const [settingsDeliveryInfo, setSettingsDeliveryInfo] = useState("");
  const [settingsSlug, setSettingsSlug] = useState("");
  const [settingsWhatsappNumber, setSettingsWhatsappNumber] = useState("");
  const [settingsLogoFile, setSettingsLogoFile] = useState<File | null>(null);
  const [settingsLogoPreviewUrl, setSettingsLogoPreviewUrl] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingDeliveryInfo, setIsSavingDeliveryInfo] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [deliveryInfoMessage, setDeliveryInfoMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
    window.setTimeout(() => setStoreLinkCopied(false), 1600);
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
      current.map((item) => (item.id === order.id ? { ...item, status } : item)),
    );
  }

  function handleSettingsLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSettingsLogoFile(file);
    setSettingsLogoPreviewUrl(file ? URL.createObjectURL(file) : merchant?.logo_url ?? "");
    event.target.value = "";
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

    if (!settingsBusinessName.trim() || !normalizedSlug || !digitsOnlyWhatsapp) {
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
        tagline: settingsTagline.trim() || null,
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

      setMerchant((current) => (current ? { ...current, ...payload } : current));
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

    const deliveryInfo = settingsDeliveryInfo.trim() || null;
    const { error } = await supabase
      .from("merchants")
      .update({ delivery_info: deliveryInfo })
      .eq("id", merchant.id);

    if (error) {
      setDeliveryInfoMessage(error.message);
      setIsSavingDeliveryInfo(false);
      return;
    }

    setMerchant((current) =>
      current ? { ...current, delivery_info: deliveryInfo } : current,
    );
    setSettingsDeliveryInfo(deliveryInfo ?? "");
    setDeliveryInfoMessage("Delivery info saved.");
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

        if (order.status !== "fulfilled" && order.status !== "cancelled") {
          stats.activeOrders += 1;
        }

        return stats;
      },
      { activeOrders: 0, todayOrders: 0, todaySales: 0 },
    );
  }, [orders]);
  const recentOrders = orders.slice(0, 3);
  const settingsDigitsOnlyWhatsapp = settingsWhatsappNumber.replace(/\D/g, "");
  const settingsWhatsappStartsWithZero =
    settingsDigitsOnlyWhatsapp.startsWith("0");
  const helpUrl = buildWhatsAppUrl(
    PLATFORM_HELP_NUMBER,
    "Hi, I need help with my Watstore account.",
  );

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-[#1C1917]">
        <p className="text-sm font-medium text-[#78716C]">Checking session...</p>
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
  const showProminentSubscription =
    merchant?.subscription_status === "trial";
  const expiryLabel = subscriptionAccess?.expiryDate
    ? formatDateLabel(subscriptionAccess.expiryDate)
    : "Not recorded";
  const activePlanCycle =
    merchant?.subscription_status === "active" ? merchant.billing_cycle_months : null;
  const activeHomePlanName =
    activePlanCycle === 12 ? "Annual Plan" : "Monthly Plan";

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-28 text-[#1C1917]">
      <header className="sticky top-0 z-20 border-b border-[#E7E4DF] bg-white">
        <div className="mx-auto w-full max-w-5xl">
          <div className="relative flex min-w-0 items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#1C1917] text-white">
                {merchant?.logo_url ? (
                  <img
                    className="h-full w-full object-cover"
                    src={merchant.logo_url}
                    alt={`${merchant.business_name ?? "Store"} logo`}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-bold">
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
                <span className="max-w-[132px] truncate text-[17px] font-bold leading-none min-[390px]:max-w-[170px] sm:max-w-[320px]">
                  {merchant?.business_name ?? "Your store"}
                </span>
                <span className="shrink-0 text-[#78716C]">
                  {isStoreMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </span>
              </button>

              {isStoreMenuOpen ? (
                <div className="absolute left-4 top-[72px] z-30 w-[240px] overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(28,25,23,0.16)] ring-1 ring-[#E7E4DF]">
                  <button
                    className="flex h-[60px] w-full min-w-0 items-center gap-4 px-5 text-left text-[16px] font-medium text-[#1C1917] transition hover:bg-[#FAF9F7]"
                    type="button"
                    onClick={handleSignOut}
                  >
                    <LogOut aria-hidden="true" className="h-5 w-5 shrink-0 text-[#78716C]" />
                    <span className="min-w-0 flex-1 truncate">Log out</span>
                  </button>
                  <div className="mx-5 h-px bg-[#E7E4DF]" />
                  {merchant ? (
                    <a
                      className="flex h-[60px] w-full min-w-0 items-center gap-4 px-5 text-[16px] font-bold text-[#1DA851] transition hover:bg-[#FAF9F7]"
                      href={buildUpgradeUrl(merchant)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Zap aria-hidden="true" className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">Upgrade</span>
                    </a>
                  ) : null}
                  <div className="mx-5 h-px bg-[#E7E4DF]" />
                  <a
                    className="flex h-[60px] w-full min-w-0 items-center gap-4 px-5 text-[16px] font-medium text-[#1C1917] transition hover:bg-[#FAF9F7]"
                    href={helpUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-[#78716C]"
                    />
                    <span className="min-w-0 flex-1 truncate">Get Help</span>
                  </a>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAF9F7] text-[#1C1917] transition hover:bg-[#E7E4DF]"
                type="button"
                onClick={handleCopyStoreLink}
                aria-label="Copy store link"
                title={storeLinkCopied ? "Copied" : "Copy store link"}
              >
                <CopyIcon />
              </button>
              {storeUrl ? (
                <a
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAF9F7] text-[#1C1917] transition hover:bg-[#E7E4DF]"
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

      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        {activeTab === "home" ? (
          <section className="grid gap-6">
            <div>
              <h1 className="text-[26px] font-bold leading-none sm:text-[30px]">
                Welcome back
              </h1>
              <p className="mt-2 text-[15px] font-medium text-[#78716C]">
                Your store is doing great today.
              </p>
            </div>

            {showProminentSubscription ? (
            <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-[#1DA851]/25 bg-[#D6F9DF] px-4 py-4 shadow-[0_8px_20px_rgba(29,168,81,0.08)]">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#0F6B34]">
                    {planName}
                  </p>
                  <p className="mt-1 text-[13px] font-medium leading-5 text-[#0F6B34]">
                    Expires in {daysRemaining ?? 0} days - don&apos;t lose
                    access!
                  </p>
                </div>
                {merchant ? (
                  <a
                    className="flex h-10 shrink-0 items-center justify-center rounded-full bg-[#1DA851] px-5 text-sm font-bold text-white transition hover:opacity-90"
                    href={buildUpgradeUrl(merchant)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Upgrade
                  </a>
                ) : null}
              </div>
            ) : merchant?.subscription_status === "active" ? (
              <div className="flex min-w-0 items-center justify-between gap-3 rounded-full border border-[#E7E4DF] bg-white px-4 py-3 shadow-[0_5px_16px_rgba(28,25,23,0.04)]">
                <p className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-[#78716C]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1DA851]" />
                  <span className="min-w-0 flex-1 truncate">
                    {activeHomePlanName} · Active
                  </span>
                </p>
                <span className="shrink-0 text-xs font-medium text-[#A8A29E]">
                  Renews {expiryLabel}
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E7E4DF] bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase text-[#78716C]">
                  Subscription
                </p>
                <p className="mt-1 text-sm font-bold">{planName}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Orders" value={orderStats.todayOrders} />
              <StatCard
                label="In Progress"
                value={String(orderStats.activeOrders).padStart(2, "0")}
                highlight
              />
              <StatCard label="Chats" value="0" />
            </div>

            <section>
            <div className="mb-3 flex min-w-0 items-center justify-between gap-4">
                <h2 className="min-w-0 flex-1 truncate text-[16px] font-bold">Recent orders</h2>
                <button
                  className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-[#1DA851]"
                  type="button"
                  onClick={() => setActiveTab("orders")}
                >
                  View all
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
              {isLoadingOrders ? (
                <p className="rounded-xl border border-[#E7E4DF] bg-white px-4 py-8 text-center text-sm font-medium text-[#78716C]">
                  Loading orders...
                </p>
              ) : recentOrders.length ? (
                <div className="grid gap-3">
                  {recentOrders.map((order) => (
                    <HomeRecentOrderCard
                      key={order.id}
                      order={order}
                      onDetails={() => setActiveTab("orders")}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-[#E7E4DF] bg-white px-4 py-8 text-center text-sm font-medium text-[#78716C]">
                  No orders yet - share your store link to get your first one
                </p>
              )}
            </section>

            <Link
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#1C1917] px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(28,25,23,0.12)] transition hover:opacity-90"
              href="/dashboard/products/new"
            >
              + Add Product
            </Link>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="-mx-4 -my-6 grid min-h-[calc(100vh-9rem)] gap-4 bg-[#FAF9F7] px-4 py-6 sm:-mx-6 sm:px-6">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#78716C]">
                {products.length} {products.length === 1 ? "product" : "products"}
              </p>
              <Link
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#1DA851] px-4 text-sm font-bold text-white transition hover:opacity-90"
                href="/dashboard/products/new"
              >
                <PlusIcon />
                Add product
              </Link>
            </div>

            {message ? (
              <p className="mb-3 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
                {message}
              </p>
            ) : null}

            {isLoadingProducts ? (
              <p className="py-10 text-sm font-medium text-[#78716C]">
                Loading products...
              </p>
            ) : null}

            {!isLoadingProducts && !products.length && !message ? (
              <div className="py-12 text-center">
                <h3 className="text-lg font-semibold">No products yet</h3>
                <p className="mx-auto mt-2 max-w-md text-[#78716C]">
                  Add your first product when you are ready.
                </p>
                <Link
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#1C1917] px-4 text-sm font-medium text-white transition hover:opacity-90"
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
                      className="flex min-h-[106px] items-start gap-3 rounded-xl border border-[#E7E4DF] bg-white p-3.5 shadow-[0_5px_16px_rgba(28,25,23,0.04)] sm:p-4"
                      key={product.id}
                    >
                      <Link
                        className="block h-[68px] w-[68px] shrink-0 overflow-hidden rounded-2xl border border-[#E7E4DF] bg-[#FAF9F7]"
                        href={`/dashboard/products/${product.id}`}
                      >
                        {thumbnail ? (
                          <img
                            className="h-full w-full object-cover"
                            src={thumbnail}
                            alt={product.name}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-medium text-[#78716C]">
                            No photo
                          </span>
                        )}
                      </Link>

                      <Link
                        className="min-w-0 flex-1 pt-1"
                        href={`/dashboard/products/${product.id}`}
                      >
                        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-[#1C1917]">
                          {product.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-baseline gap-2">
                          <span className="text-[13px] font-extrabold text-[#1C1917]">
                            {formatPrice(product.sale_price)}
                          </span>
                          {product.original_price ? (
                            <span className="text-xs text-[#78716C] line-through">
                              {formatPrice(product.original_price)}
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={`mt-2 text-[11px] font-semibold ${
                            product.in_stock ? "text-[#1DA851]" : "text-[#B94A2C]"
                          }`}
                        >
                          {product.in_stock ? "In stock" : "Out of stock"}
                        </p>
                      </Link>

                      <div className="flex shrink-0 flex-col items-center gap-1.5 pt-1">
                        <Link
                          aria-label={`Edit ${product.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-[#A8A29E] transition hover:bg-[#FAF9F7] hover:text-[#1C1917]"
                          href={`/dashboard/products/${product.id}`}
                        >
                          <PencilIcon />
                        </Link>
                        <button
                          aria-label={`Delete ${product.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-[#A8A29E] transition hover:bg-[#FAF9F7] hover:text-[#B94A2C]"
                          type="button"
                          onClick={() => handleDelete(product)}
                        >
                          <TrashIcon />
                        </button>
                        {liveProductUrl ? (
                          <a
                            aria-label={`View ${product.name} live`}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[#A8A29E] transition hover:bg-[#FAF9F7] hover:text-[#1C1917]"
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
                    className={`h-10 shrink-0 rounded-full border px-5 text-sm font-semibold transition ${
                      orderFilter === filter.value
                        ? "border-[#1C1917] bg-[#1C1917] text-white"
                        : "border-[#E7E4DF] bg-white text-[#78716C] hover:border-[#1C1917] hover:text-[#1C1917]"
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
              <p className="mt-4 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
                {orderMessage}
              </p>
            ) : null}

            {isLoadingOrders ? (
              <p className="py-10 text-sm font-medium text-[#78716C]">
                Loading orders...
              </p>
            ) : null}

            {!isLoadingOrders && !orders.length && !orderMessage ? (
              <div className="py-12 text-center">
                <h3 className="text-lg font-semibold">No orders yet</h3>
                <p className="mx-auto mt-2 max-w-md text-[#78716C]">
                  Share your store link to start selling.
                </p>
              </div>
            ) : null}

            {!isLoadingOrders && orders.length && !filteredOrders.length ? (
              <p className="py-10 text-center text-sm font-medium text-[#78716C]">
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
          <section className="grid gap-4 bg-[#FAF9F7]">
            <form
              className="rounded-xl border border-[#E7E4DF] bg-white p-5 shadow-[0_6px_18px_rgba(28,25,23,0.04)]"
              onSubmit={handleSettingsSubmit}
            >
              <SettingsSectionTitle icon={<Store className="h-5 w-5" />}>
                Store Details
              </SettingsSectionTitle>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#78716C]">
                    Business Name
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                    <SettingsFieldIcon>
                      <Store className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1C1917] outline-none placeholder:text-[#78716C]"
                      value={settingsBusinessName}
                      onChange={(event) => setSettingsBusinessName(event.target.value)}
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#78716C]">
                    Tagline (optional)
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                    <SettingsFieldIcon>
                      <Tag className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1C1917] outline-none placeholder:text-[#78716C]"
                      maxLength={90}
                      value={settingsTagline}
                      onChange={(event) => setSettingsTagline(event.target.value)}
                    />
                  </div>
                </label>

                <label className="block min-w-0 max-w-full">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#78716C]">Store URL</span>
                  <div className="flex h-12 max-w-full overflow-hidden rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                    <SettingsFieldIcon>
                      <Globe className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <span className="flex h-full shrink-0 items-center border-r border-[#E7E4DF] pr-3 text-sm font-semibold text-[#78716C]">
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
                    <p className="mt-2 text-sm text-[#78716C]">
                      Checking URL...
                    </p>
                  ) : null}
                  {isSlugAvailable ? (
                    <p className="mt-2 text-sm font-medium text-[#1DA851]">
                      /store/{normalizeSlug(settingsSlug)} is available.
                    </p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#78716C]">
                    WhatsApp Number
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                    <SettingsFieldIcon>
                      <Phone className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1C1917] outline-none placeholder:text-[#78716C]"
                      inputMode="tel"
                      value={settingsWhatsappNumber}
                      onChange={(event) => setSettingsWhatsappNumber(event.target.value)}
                      required
                    />
                  </div>
                  {settingsDigitsOnlyWhatsapp ? (
                    <p className="mt-2 text-sm text-[#78716C]">
                      Saved as {settingsDigitsOnlyWhatsapp}
                    </p>
                  ) : null}
                  {settingsWhatsappStartsWithZero ? (
                    <p className="mt-2 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#B94A2C]">
                      This starts with 0. Use a country code instead of a local
                      leading zero.
                    </p>
                  ) : null}
                </label>

                <section>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase text-[#78716C]">Store Logo</span>
                    <span className="flex min-h-14 min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#E7E4DF] bg-[#FAF9F7] px-3 py-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#E7E4DF] bg-white text-[#78716C]">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#1C1917]">
                          {settingsLogoPreviewUrl ? "Change Logo" : "Upload Logo"}
                        </span>
                        <span className="block text-xs font-medium text-[#78716C]">
                          PNG, JPG up to 5MB
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
                        className="h-20 w-20 shrink-0 rounded-md border border-[#E7E4DF] object-cover"
                        src={settingsLogoPreviewUrl}
                        alt="Store logo preview"
                      />
                      <button
                        className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[#B94A2C] hover:underline"
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
                </section>
              </div>

              {settingsMessage ? (
                <p className="mt-5 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#1C1917]">
                  {settingsMessage}
                </p>
              ) : null}

              <button
                className="mt-6 h-12 w-full rounded-full bg-[linear-gradient(180deg,#34302C_0%,#1C1917_42%,#1C1917_100%)] px-4 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_22px_rgba(28,25,23,0.14)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-[#78716C] disabled:bg-none"
                type="submit"
                disabled={
                  isSavingSettings ||
                  isCheckingSlug ||
                  !settingsBusinessName.trim() ||
                  !normalizeSlug(settingsSlug) ||
                  !settingsDigitsOnlyWhatsapp
                }
              >
                {isSavingSettings ? "Saving..." : "Save Settings"}
              </button>
            </form>

            <form
              className="rounded-xl border border-[#E7E4DF] bg-white p-5 shadow-[0_6px_18px_rgba(28,25,23,0.04)]"
              onSubmit={handleDeliveryInfoSubmit}
            >
              <h2 className="text-lg font-bold">Delivery Info</h2>
              <p className="mt-1 text-xs font-medium text-[#78716C]">
                Optional details for your customers
              </p>
              <textarea
                className="mt-4 min-h-24 w-full resize-none rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-3 text-sm font-medium leading-6 outline-none transition placeholder:text-[#78716C] focus:border-[#1C1917] focus:ring-2 focus:ring-[#1C1917]/10"
                maxLength={150}
                placeholder="e.g. Same-day delivery in Accra, 2-3 days nationwide. Free delivery in Accra & Tema"
                value={settingsDeliveryInfo}
                onChange={(event) => setSettingsDeliveryInfo(event.target.value)}
              />
              <div className="mt-3 flex min-w-0 items-start justify-between gap-4">
                <p className="min-w-0 flex-1 text-xs font-medium leading-5 text-[#78716C]">
                  To help customers understand your delivery times and offers.
                </p>
                <p className="shrink-0 text-xs font-bold text-[#78716C]">
                  {settingsDeliveryInfo.length}/150
                </p>
              </div>
              {deliveryInfoMessage ? (
                <p className="mt-3 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#1C1917]">
                  {deliveryInfoMessage}
                </p>
              ) : null}
              <button
                className="mt-4 h-10 rounded-full border border-[#1C1917] px-5 text-sm font-bold transition hover:bg-[#1C1917] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSavingDeliveryInfo}
              >
                {isSavingDeliveryInfo ? "Saving..." : "Save Info"}
              </button>
            </form>

            <form
              className="rounded-xl border border-[#E7E4DF] bg-white p-5 shadow-[0_6px_18px_rgba(28,25,23,0.04)]"
              onSubmit={handlePasswordSubmit}
            >
              <SettingsSectionTitle icon={<Lock className="h-5 w-5" />}>
                Security
              </SettingsSectionTitle>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#78716C]">
                    New Password
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                    <SettingsFieldIcon>
                      <Lock className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1C1917] outline-none placeholder:text-[#78716C]"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase text-[#78716C]">
                    Confirm Password
                  </span>
                  <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-lg border border-[#E7E4DF] bg-[#FAF9F7] text-[#78716C] transition focus-within:border-[#1C1917] focus-within:ring-2 focus-within:ring-[#1C1917]/10">
                    <SettingsFieldIcon>
                      <Lock className="h-4 w-4" />
                    </SettingsFieldIcon>
                    <input
                      className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium text-[#1C1917] outline-none placeholder:text-[#78716C]"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={(event) => setConfirmNewPassword(event.target.value)}
                    />
                  </div>
                </label>
              </div>
              {passwordMessage ? (
                <p className="mt-4 rounded-md border border-[#E7E4DF] bg-[#FAF9F7] px-3 py-2 text-sm text-[#1C1917]">
                  {passwordMessage}
                </p>
              ) : null}
              <button
                className="mt-5 h-12 w-full rounded-full bg-[linear-gradient(180deg,#34302C_0%,#1C1917_42%,#1C1917_100%)] px-4 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_22px_rgba(28,25,23,0.14)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-[#78716C] disabled:bg-none"
                type="submit"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>

            <section className="grid gap-3 rounded-xl border border-[#E7E4DF] bg-white p-5 shadow-[0_6px_18px_rgba(28,25,23,0.04)]">
              <h2 className="text-lg font-bold">Subscription Plan</h2>
              {[
                { name: "Monthly" as const, cycle: 1, price: "GHS 49", suffix: "/month" },
                { name: "Annual" as const, cycle: 12, price: "GHS 399", suffix: "/year" },
              ].map((plan) => {
                const isActivePlan = activePlanCycle === plan.cycle;
                const intent = isActivePlan ? "renew" : "upgrade";

                return (
                  <article
                    className={`relative rounded-xl border p-4 ${
                      plan.cycle === 12
                        ? "border-[#1DA851]/20 bg-[#EAF7EF]"
                        : "border-[#E7E4DF] bg-white"
                    }`}
                    key={plan.name}
                  >
                    {plan.cycle === 12 ? (
                      <span className="absolute right-3 top-0 -translate-y-1/2 rounded-sm bg-[#1DA851] px-2 py-1 text-[9px] font-bold text-white">
                        Best Value - Save GHS 189
                      </span>
                    ) : null}
                    {isActivePlan ? (
                      <div className="mb-4 flex min-w-0 items-center justify-between gap-3 rounded-full border border-[#E7E4DF] bg-white px-3 py-2">
                        <p className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-[#78716C]">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1DA851]" />
                          <span className="min-w-0 flex-1 truncate">
                            {plan.name} Plan · Active
                          </span>
                        </p>
                        <span className="shrink-0 text-xs font-medium text-[#A8A29E]">
                          Renews {expiryLabel}
                        </span>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-base font-bold">{plan.name}</h3>
                        <p className="mt-1 flex min-w-0 items-end gap-1">
                          <span className="text-2xl font-extrabold leading-none">
                            {plan.price}
                          </span>
                          <span className="pb-0.5 text-xs font-medium text-[#78716C]">
                            {plan.suffix}
                          </span>
                        </p>
                      </>
                    )}
                    {merchant ? (
                      <a
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1DA851] px-4 text-sm font-bold text-white transition hover:opacity-90"
                        href={buildPlanWhatsAppUrl(merchant, plan.name, intent)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 truncate">
                          {isActivePlan ? "Renew Early" : "Upgrade"} - Message Us
                        </span>
                      </a>
                    ) : null}
                  </article>
                );
              })}
              {merchant?.subscription_status === "trial" ? (
                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#E7E4DF] bg-[#FAF9F7] p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E4DF] bg-white text-[#78716C]">
                    <Zap className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">Free Trial Active</p>
                    <p className="mt-0.5 text-xs font-medium text-[#78716C]">
                      {daysRemaining ?? 0} days remaining on your trial period.
                    </p>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-xl border border-[#E7E4DF] bg-white p-5 text-center shadow-[0_6px_18px_rgba(28,25,23,0.04)]">
              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#FFB8B8] bg-white text-sm font-bold text-[#FF1F1F] transition hover:border-[#FF1F1F] hover:bg-[#FFF7F7]"
                type="button"
                onClick={handleSignOut}
              >
                <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>Log out</span>
              </button>
              <p className="mt-5 text-xs font-medium text-[#78716C]">
                Having trouble with your settings?
              </p>
              <a
                className="mt-2 inline-flex min-w-0 items-center justify-center gap-1.5 text-sm font-bold text-[#1DA851] underline-offset-4 hover:underline"
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

      <nav className="fixed bottom-0 left-0 right-0 z-30 w-full border-t border-[#E7E4DF] bg-white px-2 py-2">
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
                    active ? "text-[#1C1917]" : "text-[#78716C]"
                  }`}
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "home" ? <HomeIcon active={active} /> : null}
                  {tab === "products" ? <ProductsIcon active={active} /> : null}
                  {tab === "orders" ? <OrdersIcon active={active} /> : null}
                  {tab === "settings" ? <SettingsIcon active={active} /> : null}
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
    </main>
  );
}
