import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";
import { getCanonicalSiteOrigin } from "./components/siteUrl";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getCanonicalSiteOrigin()),
  applicationName: "Floxto",
  title: "Floxto",
  description: "Simple. Fast. Professional.",
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
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="floxto-theme" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var stored = window.localStorage.getItem("floxto-theme");
                var pathname = window.location.pathname;
                var appScreens = ["dashboard", "admin", "login", "signup", "forgot-password", "reset-password"];
                var isAppScreen = appScreens.indexOf(pathname.split("/")[1]) !== -1;
                var theme = isAppScreen && (stored === "dark" || stored === "light")
                  ? stored
                  : "light";
                document.documentElement.classList.toggle("dark", theme === "dark");
                document.documentElement.style.colorScheme = theme;
              } catch (error) {}
            })();
          `}
        </Script>
        <ServiceWorkerRegistration />
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
