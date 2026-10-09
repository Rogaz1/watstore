import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "./components/siteUrl";

const PAGES = [
  { path: "/", priority: 1 },
  { path: "/features", priority: 0.8 },
  { path: "/pricing", priority: 0.8 },
  { path: "/how-it-works", priority: 0.7 },
  { path: "/use-cases", priority: 0.7 },
  { path: "/faq", priority: 0.6 },
  { path: "/contact", priority: 0.5 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getCanonicalSiteOrigin();

  return PAGES.map((page) => ({
    url: `${origin}${page.path === "/" ? "" : page.path}`,
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}
