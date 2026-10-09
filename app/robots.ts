import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "./components/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/reset-password", "/forgot-password"],
    },
    sitemap: `${getCanonicalSiteOrigin()}/sitemap.xml`,
  };
}
