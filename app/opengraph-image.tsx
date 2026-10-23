import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SOCIAL_IMAGE_SIZE } from "@/libs/blog/socialImage";

// The share card for the homepage: the hero's headline beside three example results, one per
// layer (an alert, a possible saving, an audit finding), echoing the hero's CommandCenter.
// ImageResponse renders without the theme's CSS variables, so the light palette's values are
// written out here (from components/ui/theme/palette.js), and the Tracker's fonts are loaded from
// assets/fonts: Sora for the headline, Figtree for the rest. Products and amounts are illustrative.
const NAVY = "#1b3a8c";
const INK = "#0f172a";
const MUTED = "#475569";
const PAGE = "#f5f6f8";
const CARD = "#ffffff";
const LINE = "#e3e6eb";
const SUCCESS = "#0b7045";
const WARNING = "#b45309";
const ERROR = "#b42318";

export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero: tariff alerts, savings, & audits on autopilot";

// Heroicons 24/outline paths (BellAlert, Banknotes, ClipboardDocumentCheck)
const ICONS = {
  alert:
    "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5",
  savings:
    "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z",
  audit:
    "M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75",
};

const RESULTS = [
  {
    icon: ICONS.alert,
    color: NAVY,
    kind: "Tariff Alert",
    product: "Drones, 2–7 kg · CN",
    detail: "Section 232 tariff added",
    value: "+25%",
    valueColor: ERROR,
  },
  {
    icon: ICONS.savings,
    color: SUCCESS,
    kind: "Possible Savings",
    product: "Aluminum extrusions · CA",
    detail: "May qualify for USMCA",
    value: "up to $36,000/yr",
    valueColor: SUCCESS,
  },
  {
    icon: ICONS.audit,
    color: WARNING,
    kind: "Import Audit",
    product: "Steel wire · CN",
    detail: "Possible overpayment found",
    value: "+$4,000",
    valueColor: SUCCESS,
  },
];

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

export default async function Image() {
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
          background: PAGE,
          borderTop: `12px solid ${NAVY}`,
          padding: "64px 64px 56px 72px",
          fontFamily: "Figtree",
          gap: 44,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 470 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: NAVY }}>
              US Tariff Intelligence
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "Sora",
                fontSize: 64,
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: -2,
                color: INK,
              }}
            >
              <span>Tariff Alerts, Savings, & Audits</span>
              <span style={{ color: NAVY }}>on Autopilot</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26 }}>
            <span style={{ fontWeight: 700, color: INK }}>HTS Hero</span>
            <span style={{ color: MUTED }}>htshero.com</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, color: MUTED }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: SUCCESS }} />
            Scanning your imports 24/7
          </div>
          {RESULTS.map((r) => (
            <div
              key={r.kind}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: CARD,
                border: `2px solid ${LINE}`,
                borderRadius: 16,
                padding: "18px 24px",
                boxShadow: "0 6px 20px rgba(15, 23, 42, 0.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 60,
                  height: 60,
                  borderRadius: 14,
                  background: `${r.color}1a`,
                }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="1.6">
                  <path d={r.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: r.color }}>
                    {r.kind}
                  </span>
                  <span style={{ fontSize: 26, fontWeight: 700, color: r.valueColor }}>{r.value}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: INK }}>{r.product}</div>
                <div style={{ fontSize: 19, color: MUTED }}>{r.detail}</div>
              </div>
            </div>
          ))}
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
