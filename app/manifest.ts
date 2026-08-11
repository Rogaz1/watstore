import type { MetadataRoute } from "next";

const APP_NAME = "Simple. Fast. Professional.";
const SHORT_NAME = "Simple. Fast. Professional.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: SHORT_NAME,
    description: "Simple. Fast. Professional.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#1C1917",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
