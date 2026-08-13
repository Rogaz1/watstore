import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";
import { getCanonicalSiteOrigin } from "./components/siteUrl";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getCanonicalSiteOrigin()),
  applicationName: "Floxto",
  title: "Floxto",
  description: "Simple. Fast. Professional.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Floxto",
    description: "Simple. Fast. Professional.",
    url: "/",
    siteName: "Floxto",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Floxto",
    description: "Simple. Fast. Professional.",
  },
  appleWebApp: {
    title: "Floxto",
    capable: true,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/favicon.ico" },
    ],
    shortcut: "/icons/favicon.ico",
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "Floxto",
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1917",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Script id="floxto-theme" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var stored = window.localStorage.getItem("floxto-theme");
                var theme = stored === "dark" || stored === "light"
                  ? stored
                  : "light";
                document.documentElement.classList.toggle("dark", theme === "dark");
                document.documentElement.style.colorScheme = theme;
              } catch (error) {}
            })();
          `}
        </Script>
        <ServiceWorkerRegistration />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
