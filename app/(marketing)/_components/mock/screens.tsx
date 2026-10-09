import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  CheckCheck,
  ChevronDown,
  ClipboardList,
  Copy,
  ExternalLink,
  Home,
  Leaf,
  Lock,
  MapPin,
  Mic,
  Minus,
  Package,
  Paperclip,
  Phone as PhoneIcon,
  Plus,
  Settings,
  Share2,
  User,
  Video,
} from "lucide-react";
import { cn } from "../ui";
import { StatusBar } from "./Phone";
import { ProductPhoto } from "./ProductPhoto";
import { DEMO_ORDER, DEMO_ORDER_MESSAGE, DEMO_PRODUCTS, DEMO_STORE, type DemoStore } from "./demo";

export function StoreAvatar({ className, initial }: { className?: string; initial?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[28%] bg-[#1F3D2B] text-[#E9E2D0]",
        className,
      )}
    >
      {initial ? (
        <span className="text-[1.1em] font-bold leading-none">{initial}</span>
      ) : (
        <Leaf className="h-[55%] w-[55%]" strokeWidth={2} />
      )}
    </span>
  );
}

/* ------------------------------ Storefront ------------------------------ */

export function StorefrontScreen({ store = DEMO_STORE }: { store?: DemoStore }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#F7F5F2]">
      <div className="bg-white">
        <StatusBar />
        <div className="mx-3 flex h-7 items-center justify-center gap-1.5 rounded-full bg-[#F1F1EF] px-3 text-[10px] font-medium text-[#555555]">
          <Lock className="h-2.5 w-2.5 shrink-0" strokeWidth={2.5} />
          <span className="truncate">floxto.com/store/{store.slug}</span>
        </div>
        <div className="flex flex-col items-center px-4 pb-4 pt-4 text-center">
          <StoreAvatar className="h-11 w-11 text-[18px]" initial={store.initial} />
          <p className="mt-2 line-clamp-2 break-words text-[15px] font-bold leading-tight">
            {store.name}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-[#888888]">{store.tagline}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pt-3">
        {DEMO_PRODUCTS.slice(0, 6).map((product) => (
          <div
            className="overflow-hidden rounded-[14px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            key={product.name}
          >
            <div className="aspect-[5/4]" style={{ backgroundColor: product.tile }}>
              <ProductPhoto sizes="140px" src={product.image} />
            </div>
            <div className="px-2.5 pb-2.5 pt-2">
              <p className="truncate text-[10.5px] font-semibold leading-tight">{product.name}</p>
              <p className="mt-1 flex items-baseline gap-1.5 text-[11px] font-bold">
                {product.price}
                {product.was ? (
                  <span className="text-[9.5px] font-medium text-[#BBBBBB] line-through">
                    {product.was}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Product page ------------------------------ */

const BENEFITS = [
  "Raw, unrefined shea from Tamale",
  "Melts in without feeling greasy",
  "Keeps skin soft all day",
];

export function ProductScreen({ sheetOpen = false }: { sheetOpen?: boolean }) {
  const product = DEMO_ORDER.product;

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="relative h-[236px] shrink-0" style={{ backgroundColor: product.tile }}>
        <ProductPhoto className="absolute inset-0" sizes="290px" src={product.image} />
        <StatusBar />
        <span className="absolute right-3 top-11 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm">
          <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <span className="absolute inset-x-0 bottom-7 flex justify-center gap-1">
          <span className="h-1 w-4 rounded-full bg-white" />
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span className="h-1 w-1 rounded-full bg-white/60" />
        </span>
      </div>

      <div className="relative -mt-4 flex-1 rounded-t-[22px] bg-white px-4 pt-4">
        <p className="text-[15px] font-bold leading-snug">{product.name}</p>
        <p className="mt-1.5 flex items-center gap-2">
          <span className="text-[17px] font-bold">{product.price}</span>
          <span className="text-[11px] font-medium text-[#BBBBBB] line-through">{product.was}</span>
          <span className="rounded-full bg-[#FDECEC] px-2 py-0.5 text-[8.5px] font-bold text-[#C0392B]">
            15% OFF
          </span>
        </p>
        <p className="mt-3 rounded-xl bg-[#EAF7EF] px-3 py-2.5 text-[10.5px] font-medium leading-[1.55] text-[#0F6B34]">
          Whipped shea butter for dry skin. A little goes a long way.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {BENEFITS.map((benefit) => (
            <li className="flex items-center gap-2 text-[10.5px] font-medium" key={benefit}>
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div className="shrink-0 border-t border-[#EDECEA] bg-white px-3 pb-4 pt-3">
        <div className="flex h-11 items-center justify-center rounded-xl bg-[#25D366] text-[12px] font-bold text-white">
          Order on WhatsApp
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 z-10 bg-black/45 transition-opacity duration-500",
          sheetOpen ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 rounded-t-[24px] bg-white px-4 pb-5 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          sheetOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <span className="mx-auto block h-1 w-9 rounded-full bg-[#E5E5E5]" />
        <div className="mt-3 flex items-center gap-3">
          <span
            className="h-11 w-11 shrink-0 overflow-hidden rounded-xl"
            style={{ backgroundColor: product.tile }}
          >
            <ProductPhoto sizes="48px" src={product.image} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11.5px] font-bold">{product.name}</span>
            <span className="block text-[10.5px] font-medium text-[#888888]">{product.price} each</span>
          </span>
          <span className="flex items-center gap-2.5 rounded-full bg-[#F4F4F5] px-1.5 py-1 text-[11px] font-bold">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white shadow-sm">
              <Minus className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            {DEMO_ORDER.quantity}
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white shadow-sm">
              <Plus className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          </span>
        </div>

        <p className="mt-3.5 text-[9.5px] font-semibold">Your Full Name</p>
        <div className="mt-1 flex h-9 items-center rounded-[10px] border border-[#E5E5E5] bg-[#F4F4F5] px-3 text-[11px] font-medium">
          {DEMO_ORDER.customer}
        </div>
        <p className="mt-2.5 text-[9.5px] font-semibold">Delivery Location</p>
        <div className="mt-1 flex h-9 items-center rounded-[10px] border border-[#111111] bg-[#F4F4F5] px-3 text-[11px] font-medium">
          {DEMO_ORDER.location}
          <span className="ml-0.5 h-3.5 w-px animate-pulse bg-[#111111]" />
        </div>

        <div className="mt-3.5 flex items-center justify-between">
          <span className="text-[10.5px] font-medium text-[#888888]">Total Payable</span>
          <span className="text-[15px] font-bold">{DEMO_ORDER.total}</span>
        </div>
        <div className="mt-3 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] text-[12px] font-bold text-white">
          Continue to WhatsApp
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.75} />
        </div>
        <p className="mt-2 text-center text-[8.5px] font-medium leading-snug text-[#999999]">
          You will confirm your order on WhatsApp. No payment required now.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Chat ------------------------------ */

export function OrderMessage({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[14px] rounded-tl-[4px] bg-white px-3 pb-1.5 pt-2.5 shadow-[0_1px_1px_rgba(0,0,0,0.08)]", className)}>
      <p className="text-[11px] font-medium leading-[1.6] text-[#111B21]">
        {DEMO_ORDER_MESSAGE.map((line, index) => (
          <span
            className={cn("block", index === DEMO_ORDER_MESSAGE.length - 1 && "font-bold")}
            key={line}
          >
            {line}
          </span>
        ))}
      </p>
      <p className="mt-0.5 text-right text-[8.5px] text-[#667781]">10:24</p>
    </div>
  );
}

export function ChatScreen({ active = false }: { active?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#EFE9E0]">
      <div className="bg-[#0B6E4F] pb-2.5 text-white">
        <StatusBar tone="light" />
        <div className="flex items-center gap-2 px-3">
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-[11px] font-bold">
            AM
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-semibold leading-tight">
              {DEMO_ORDER.customer}
            </span>
            <span className="block text-[9.5px] text-white/75">online</span>
          </span>
          <Video className="h-4 w-4" strokeWidth={2} />
          <PhoneIcon className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pt-3">
        <span className="mx-auto rounded-md bg-white/90 px-2 py-0.5 text-[8.5px] font-medium text-[#54656F] shadow-sm">
          Today
        </span>
        <OrderMessage className={cn("max-w-[85%] self-start", active && "mk-pop")} />
        <div
          className={cn(
            "max-w-[80%] self-end rounded-[14px] rounded-tr-[4px] bg-[#D9FDD3] px-3 pb-1.5 pt-2 shadow-[0_1px_1px_rgba(0,0,0,0.08)]",
            active && "mk-pop [animation-delay:1500ms]",
          )}
        >
          <p className="text-[11px] font-medium leading-[1.5] text-[#111B21]">
            Thank you Akosua. Order #{DEMO_ORDER.number} confirmed. Delivery is tomorrow.
          </p>
          <p className="mt-0.5 flex items-center justify-end gap-1 text-[8.5px] text-[#667781]">
            10:25
            <CheckCheck className="h-3 w-3 text-[#53BDEB]" strokeWidth={2.5} />
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-2.5 pb-4 pt-2">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-white px-3 text-[10.5px] text-[#8696A0]">
          <span className="flex-1">Message</span>
          <Paperclip className="h-3.5 w-3.5" strokeWidth={2} />
          <Camera className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0B6E4F] text-white">
          <Mic className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------ Dashboard ------------------------------ */

type OrderStatus = "Pending" | "Paid" | "Fulfilled" | "Cancelled";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "border border-[#E0A93B] text-[#B7791F]",
  Paid: "bg-[#25D366] text-white",
  Fulfilled: "bg-[#EAF7EF] text-[#0F6B34]",
  Cancelled: "bg-[#F4F4F5] text-[#888888]",
};

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center rounded-full px-2 text-[8.5px] font-bold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

type OrderCardProps = {
  customer: string;
  when: string;
  status: OrderStatus;
  productName: string;
  detail: string;
  location: string;
  productIndex: number;
  className?: string;
};

export function OrderCard({
  customer,
  when,
  status,
  productName,
  detail,
  location,
  productIndex,
  className,
}: OrderCardProps) {
  const product = DEMO_PRODUCTS[productIndex];

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#EDECEA] bg-white p-3 text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <User className="h-3 w-3 text-[#888888]" strokeWidth={2} />
        <span className="min-w-0 flex-1 truncate text-[11px] font-bold">{customer}</span>
        <Calendar className="h-2.5 w-2.5 text-[#888888]" strokeWidth={2} />
        <span className="text-[9px] font-medium text-[#888888]">{when}</span>
        <StatusPill status={status} />
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <span
          className="h-8 w-8 shrink-0 overflow-hidden rounded-full"
          style={{ backgroundColor: product.tile }}
        >
          <ProductPhoto sizes="48px" src={product.image} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[10.5px] font-semibold text-[#1FA855]">
            {productName}
          </span>
          <span className="block text-[9.5px] font-medium text-[#888888]">{detail}</span>
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-1 border-t border-[#F0EDE8] pt-2">
        <MapPin className="h-2.5 w-2.5 text-[#888888]" strokeWidth={2} />
        <span className="flex-1 text-[9.5px] font-medium text-[#888888]">{location}</span>
        <span className="text-[9.5px] font-bold text-[#1FA855]">Details</span>
      </div>
    </div>
  );
}

const STATS = [
  { label: "ORDERS", value: "18" },
  { label: "PENDING", value: "03", highlight: true },
  { label: "CHATS", value: "07" },
];

const TABS = [
  { label: "Home", icon: Home, active: true },
  { label: "Products", icon: Package },
  { label: "Orders", icon: ClipboardList },
  { label: "Settings", icon: Settings },
];

export function DashboardScreen({
  active = false,
  store = DEMO_STORE,
}: {
  active?: boolean;
  store?: DemoStore;
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#F7F5F2]">
      <div className="border-b border-[#EDECEA] bg-white pb-2.5">
        <StatusBar />
        <div className="flex items-center gap-2 px-3">
          <StoreAvatar className="h-7 w-7 rounded-full! text-[12px]" initial={store.initial} />
          <span className="flex min-w-0 flex-1 items-center gap-1 text-[12px] font-bold">
            <span className="truncate">{store.name}</span>
            <ChevronDown className="h-3 w-3 shrink-0 text-[#888888]" strokeWidth={2.5} />
          </span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F4F4F5]">
            <Copy className="h-3 w-3" strokeWidth={2} />
          </span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F4F4F5]">
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </span>
        </div>
      </div>

      <div className="flex-1 px-3 pt-3.5">
        <p className="text-[17px] font-bold leading-tight">Your Store Today</p>
        <p className="mt-0.5 text-[10px] font-medium text-[#888888]">
          Everything you need at a glance.
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {STATS.map((stat) => (
            <div
              className="rounded-xl border border-[#EDECEA] bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              key={stat.label}
            >
              <p className="text-[7.5px] font-bold tracking-wide text-[#888888]">{stat.label}</p>
              <p
                className={cn(
                  "mt-0.5 text-[15px] font-bold leading-none",
                  stat.highlight && "text-[#1FA855]",
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11.5px] font-bold">Recent Orders</p>
          <p className="text-[9.5px] font-bold text-[#1FA855]">View All</p>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <OrderCard
            className={cn(active && "mk-new-order")}
            customer={DEMO_ORDER.customer}
            detail={`Qty ${DEMO_ORDER.quantity} · ${DEMO_ORDER.total}`}
            location={DEMO_ORDER.location}
            productIndex={0}
            productName={DEMO_ORDER.product.name}
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

      <div className="grid shrink-0 grid-cols-4 border-t border-[#EDECEA] bg-white pb-3 pt-2">
        {TABS.map((tab) => (
          <span
            className={cn(
              "flex flex-col items-center gap-0.5 text-[8.5px] font-semibold",
              tab.active ? "text-[#111111]" : "text-[#999999]",
            )}
            key={tab.label}
          >
            <tab.icon className="h-4 w-4" strokeWidth={2} />
            {tab.label}
          </span>
        ))}
      </div>
    </div>
  );
}
