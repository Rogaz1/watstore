/** Example data for the mockups. The store, products and people are made up. */
export type DemoStore = {
  name: string;
  slug: string;
  tagline: string;
  /** Letter shown as the logo when a visitor previews their own name. */
  initial?: string;
};

export const DEMO_STORE: DemoStore = {
  name: "Odo Naturals",
  slug: "odo-naturals",
  tagline: "Skincare made in Accra.",
};

export type DemoProduct = {
  name: string;
  price: string;
  was?: string;
  image: string;
  /** Shown behind the photo while it loads. */
  tile: string;
};

const PHOTOS = "/marketing/products";

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    name: "Shea Body Butter 250g",
    price: "₵85",
    was: "₵100",
    image: `${PHOTOS}/shea-body-butter.webp`,
    tile: "#C9C6C2",
  },
  { name: "Glow Face Serum 30ml", price: "₵120", image: `${PHOTOS}/glow-face-serum.webp`, tile: "#EFEAE4" },
  {
    name: "Baobab Body Oil 100ml",
    price: "₵95",
    was: "₵110",
    image: `${PHOTOS}/baobab-body-oil.webp`,
    tile: "#D9D5CC",
  },
  { name: "Shea Milk Soap", price: "₵35", image: `${PHOTOS}/shea-milk-soap.webp`, tile: "#EEE7DF" },
  { name: "Cocoa Hand Cream", price: "₵45", image: `${PHOTOS}/cocoa-hand-cream.webp`, tile: "#F1DCC8" },
  { name: "Hibiscus Hair Oil", price: "₵70", image: `${PHOTOS}/hibiscus-hair-oil.webp`, tile: "#EFB26E" },
];

/** Extra shots of the first product, for the "add your photos" visual. */
export const DEMO_GALLERY = [
  `${PHOTOS}/shea-body-butter.webp`,
  `${PHOTOS}/shea-body-butter-2.webp`,
  `${PHOTOS}/shea-body-butter-3.webp`,
];

export const DEMO_ORDER = {
  product: DEMO_PRODUCTS[0],
  quantity: 2,
  total: "₵170",
  customer: "Akosua Mensah",
  location: "East Legon, Accra",
  number: 1042,
};

/** Same wording the app sends to WhatsApp when a customer places an order. */
export const DEMO_ORDER_MESSAGE = [
  "Hello, I'd like to order:",
  `Product: ${DEMO_ORDER.product.name}`,
  `Quantity: ${DEMO_ORDER.quantity}`,
  `Total: ${DEMO_ORDER.total}`,
  `Name: ${DEMO_ORDER.customer}`,
  `Delivery Location: ${DEMO_ORDER.location}`,
  `Order #${DEMO_ORDER.number}`,
];
