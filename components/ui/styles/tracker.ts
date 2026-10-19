// The Tariff Tracker's layer (DESIGN_SYSTEM.md §15): simple, colorful, soft and round. Used
// inside .hts-tracker, whose palette sets the colors these name. Import on its own:
//   import * as tt from "@/components/ui/styles/tracker";
import { trackerDisplay } from "../font";

type Tone = "primary" | "success" | "error" | "warning" | "neutral";

// A panel on the ground: the one card (ui.card's look here: 20px corners, a 1px border, the
// Tracker's shadow), without clipping, so a dropdown inside can reach past it
export const panel = "tt-card rounded-lg border border-base-300 bg-base-100 shadow-[var(--tt-shadow)]";

// Padding inside a panel
export const panelPad = "p-6 lg:p-7";

// A tile inside a panel: soft fill, no border, smaller corners than the panel's
export const tile = "rounded-xl bg-tt-soft";

// Sora, for headlines and every big number
export const display = trackerDisplay.className;

// A panel's title, and the line under it
export const title = `${display} text-lg font-semibold text-base-content`;
export const subtitle = "text-sm text-base-content/70";

// Big numbers
export const metric = `${display} text-[1.75rem] font-semibold leading-tight tabular-nums text-base-content`;
export const metricLg = `${display} text-4xl font-semibold leading-none tabular-nums text-base-content`;
// A smaller figure beside a big one (a stat row's other numbers)
export const metricSm = `${display} text-xl font-semibold leading-tight tabular-nums text-base-content`;

const EYEBROW_TONES: Record<Tone, string> = {
  primary: "text-primary",
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  neutral: "text-base-content/60",
};

// Small bold caps over a block, in the color of what it's about
export const eyebrow = (tone: Tone = "neutral") => `text-xs font-bold uppercase tracking-wider ${EYEBROW_TONES[tone]}`;

const CHIP_TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-tt-soft text-base-content/70",
};

// A status label: POTENTIAL, CHANGED, PROGRAM, HEADS-UP
export const chip = (tone: Tone = "neutral") =>
  `inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${CHIP_TONES[tone]}`;

// A number inside a sentence
export const numberChip = (tone: Tone = "primary") => `rounded-xl px-2 ${CHIP_TONES[tone]}`;
