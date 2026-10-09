import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Floxto: a proper online store for your WhatsApp business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const wordmark = await readFile(
    join(process.cwd(), "public/branding/floxto-wordmark-light-transparent.png"),
  );
  const wordmarkSrc = `data:image/png;base64,${wordmark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#F6F4EE",
          color: "#111110",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" height={70} src={wordmarkSrc} width={240} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -4,
              maxWidth: 940,
            }}
          >
            Give your WhatsApp business a real store.
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 44 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 68,
                padding: "0 34px",
                borderRadius: 999,
                background: "#25D366",
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              Free for 30 days
            </div>
            <div style={{ marginLeft: 28, fontSize: 30, color: "#3B3B37" }}>floxto.com</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
