import { ImageResponse } from "next/og";

// The 1200×630 card shown when a blog or compare page is shared, drawn at build time.
// ImageResponse renders outside the page, without the theme's CSS variables, so the light
// palette's values are written out here (from components/ui/theme/palette.js).
const NAVY = "#1b3a8c";
const INK = "#0f172a";
const MUTED = "#475569";
const PAGE = "#f5f6f8";
const LINE = "#e3e6eb";

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };

export function socialImage({ kicker, title, footer }: { kicker: string; title: string; footer: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAGE,
          padding: 72,
          borderTop: `12px solid ${NAVY}`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: NAVY }}>
            {kicker}
          </div>
          <div
            style={{
              fontSize: title.length > 60 ? 58 : 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              color: INK,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `2px solid ${LINE}`,
            paddingTop: 28,
            fontSize: 26,
            color: MUTED,
          }}
        >
          <span style={{ fontWeight: 700, color: INK }}>HTS Hero</span>
          <span>{footer}</span>
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE
  );
}
