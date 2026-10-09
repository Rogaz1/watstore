import { Flower2, Gem, Pill, Shirt, Smartphone, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UseCase = {
  id: string;
  icon: LucideIcon;
  title: string;
  short: string;
  body: string;
  points: string[];
};

export const USE_CASES: UseCase[] = [
  {
    id: "fashion",
    icon: Shirt,
    title: "Fashion and boutiques",
    short: "Show every piece properly, so customers order the exact one they want.",
    body: "Stop resending the same photos. Give each dress, shoe or bag its own page with several photos and a clear price.",
    points: [
      "Up to five photos for every item",
      "Mark sold-out pieces as out of stock without removing them",
      "Share a single item straight from its own link",
    ],
  },
  {
    id: "beauty",
    icon: Flower2,
    title: "Beauty and skincare",
    short: "Explain what each product does before the customer has to ask.",
    body: "Skincare customers have questions. Answer them once on the product page with benefits, a full description and FAQs.",
    points: [
      "List key benefits where customers see them first",
      "Add up to five questions and answers per product",
      "Show a sale price next to the original price",
    ],
  },
  {
    id: "food",
    icon: UtensilsCrossed,
    title: "Food and catering",
    short: "A simple menu link, with orders that already include the delivery location.",
    body: "Share your menu as a link instead of a long message. Every order tells you what, how many and where to send it.",
    points: [
      "Quantity and delivery location on every order",
      "Explain your delivery areas and times once",
      "Switch a dish to unavailable when it runs out",
    ],
  },
  {
    id: "supplements",
    icon: Pill,
    title: "Supplements and wellness",
    short: "Detailed product pages that work well for ads and shared links.",
    body: "When someone taps your ad they land on a full product page, not a chat that starts from zero.",
    points: [
      "Standalone pages built for traffic from ads",
      "Room for a long description and usage details",
      "A chat button for customers who want to ask first",
    ],
  },
  {
    id: "electronics",
    icon: Smartphone,
    title: "Phones and electronics",
    short: "Clear specs and prices, so serious buyers reach you ready to order.",
    body: "List each device with its details and price. Buyers arrive knowing what they want and what it costs.",
    points: [
      "Put specs in the description and highlights",
      "Update a price in seconds from your phone",
      "Old orders keep the price the customer saw",
    ],
  },
  {
    id: "handmade",
    icon: Gem,
    title: "Handmade and local goods",
    short: "Give your craft a home that looks as good as the work itself.",
    body: "Jewellery, bags, art, decor. A clean store helps people see the care that goes into what you make.",
    points: [
      "Your own logo, name and tagline",
      "Tell customers why they should choose you",
      "Sell in the currency your customers use",
    ],
  },
];
