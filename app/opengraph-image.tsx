import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "linear-gradient(135deg, #111827 0%, #1f2937 55%, #ea580c 140%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", opacity: 0.8 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 32, maxWidth: 820, opacity: 0.9 }}>
            AI technical interviews, voice practice, and coding assessments.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
