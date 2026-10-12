// The Tariff Tracker's layer (DESIGN_SYSTEM.md §15): simple, colorful, soft and round. Used
// inside .hts-tracker, whose palette sets the colors these name. Import on its own:
//   import * as tt from "@/components/ui/styles/tracker";
import { trackerDisplay } from "../font";

type Tone = "primary" | "success" | "error" | "warning" | "neutral";

// A panel on the ground: big rounded corners, a 1px border, no shadow
export const panel = "rounded-3xl border border-base-300 bg-base-100";

// Padding inside a panel
export const panelPad = "p-6 lg:p-7";

// A tile inside a panel: soft fill, no border
export const tile = "rounded-2xl bg-tt-soft";

// Sora, for headlines and every big number
export const display = trackerDisplay.className;

// A panel's title, and the line under it
export const title = `${display} text-lg font-semibold text-base-content`;
export const subtitle = "text-sm text-base-content/70";

// Big numbers
export const metric = `${display} text-[1.75rem] font-semibold leading-tight tabular-nums text-base-content`;
export const metricLg = `${display} text-4xl font-semibold leading-none tabular-nums text-base-content`;

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

type Button = "primary" | "money" | "next" | "secondary" | "ghost";

const BUTTONS: Record<Button, string> = {
  // The main action: the text color as a fill
  primary: "bg-base-content text-base-100 hover:bg-base-content/90",
  // Money: savings, the trial, plans
  money: "bg-success text-success-content hover:bg-success/90",
  // The next step
  next: "bg-primary text-primary-content hover:bg-primary/90",
  secondary: "border border-base-300 bg-base-100 text-base-content hover:bg-tt-soft",
  ghost: "text-base-content/70 hover:bg-tt-soft hover:text-base-content",
};

// Buttons are pills (or, beside tabs, "rounded" to match their slightly rounded corners). One
// green or cobalt button per panel.
export const button = (variant: Button = "secondary", size: "sm" | "md" = "md", shape: "pill" | "rounded" = "pill") =>
  `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap ${shape === "pill" ? "rounded-full" : "rounded-[8px]"} font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 ${
    size === "sm" ? "h-8 px-3.5 text-xs" : "h-10 px-5 text-sm"
  } ${BUTTONS[variant]}`;

// A segmented toggle on a soft track, and its options
export const toggleTrack = "inline-flex gap-0.5 rounded-full bg-tt-soft p-1";
export const toggleOption = (active: boolean) =>
  `h-8 rounded-full px-3.5 text-xs font-semibold transition-colors ${
    active ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/60 hover:text-base-content"
  }`;
