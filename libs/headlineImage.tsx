import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SOCIAL_IMAGE_SIZE } from "@/libs/blog/socialImage";

// The share card for a main marketing page: just its headline, as large as the card allows, so it
// stays readable on the small previews messaging apps show. The last line is in navy.
// ImageResponse renders without the theme's CSS variables, so the light palette's values are
// written out here (from components/ui/theme/palette.js), and the Tracker's fonts are loaded from
// assets/fonts: Sora for the headline, Figtree for the rest.
const NAVY = "#1b3a8c";
const INK = "#0f172a";
const MUTED = "#475569";
const PAGE = "#f5f6f8";
const LINE = "#e3e6eb";

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

export async function headlineImage({
  kicker,
  lines,
  fontSize = 124,
}: {
  kicker: string;
  lines: string[];
  // Size the longest line to fill the card's width
  fontSize?: number;
}) {
  const [regular, bold, display] = await Promise.all([
    font("Figtree-Regular.ttf"),
    font("Figtree-Bold.ttf"),
    font("Sora-SemiBold.ttf"),
  ]);

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
          borderTop: `14px solid ${NAVY}`,
          padding: "44px 72px 40px",
          fontFamily: "Figtree",
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: NAVY }}>
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Sora",
            fontSize,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: -4,
            color: INK,
          }}
        >
          {lines.map((line, i) => (
            <span key={line} style={{ whiteSpace: "nowrap", ...(i === lines.length - 1 ? { color: NAVY } : {}) }}>
              {line}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `2px solid ${LINE}`,
            paddingTop: 20,
            fontSize: 30,
          }}
        >
          <span style={{ fontWeight: 700, color: INK }}>HTS Hero</span>
          <span style={{ color: MUTED }}>htshero.com</span>
        </div>
      </div>
    ),
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { name: "Figtree", data: regular, weight: 400, style: "normal" },
        { name: "Figtree", data: bold, weight: 700, style: "normal" },
        { name: "Sora", data: display, weight: 600, style: "normal" },
      ],
    }
  );
}

// The homepage's card, also used by the duty calculator, tariff audit and tariff monitor pages
export const homeHeadlineImage = () =>
  headlineImage({
    kicker: "US Tariff Intelligence",
    lines: ["Tariff Alerts,", "Savings, & Audits", "on Autopilot"],
  });
