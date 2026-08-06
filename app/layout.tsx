import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Floxto",
  description: "Merchant dashboard for Floxto",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
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
                var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                var theme = stored === "dark" || stored === "light"
                  ? stored
                  : prefersDark ? "dark" : "light";
                document.documentElement.classList.toggle("dark", theme === "dark");
                document.documentElement.style.colorScheme = theme;
              } catch (error) {}
            })();
          `}
        </Script>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
