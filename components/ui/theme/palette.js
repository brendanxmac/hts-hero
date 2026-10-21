// HTS Hero's color palette: every color the analytical theme uses, light and dark, in one
// place. The theme plugin (./plugin.js) turns this into the daisyUI color variables behind
// the semantic classes (bg-base-100, text-primary, text-success...) and the chart variables
// (--chart-1, --series-1...). Components never use these hex values directly.
//
// Contrast: every text color meets WCAG AA (4.5:1) on base-100 and base-200 in its theme.
// Change a value here, check both themes, and update the palette table in DESIGN_SYSTEM.md.
// CommonJS, so the theme plugin can require it.

const light = {
  // Brand
  primary: "#1b3a8c", // navy: actions, links, selection, the key figure (10.3:1 on white)
  "primary-content": "#ffffff",
  secondary: "#167a6f", // teal green: second data series (5.2:1)
  "secondary-content": "#ffffff",
  accent: "#b45f1d", // orange: third data series, sparing highlights (4.6:1)
  "accent-content": "#ffffff",
  neutral: "#1e293b", // slate: dark chrome (tooltips, the promo bar)
  "neutral-content": "#f8fafc",

  // Surfaces and text
  "base-100": "#ffffff", // cards, panels, the header
  "base-200": "#f5f6f8", // page background, table headers, card footers
  "base-300": "#e3e6eb", // borders and dividers
  "base-content": "#0f172a", // text: full for headings and numbers, /70 body, /60 muted

  // Status
  info: "#2563eb",
  "info-content": "#ffffff",
  success: "#0b7045", // savings, exemptions, "Free", a lower rate
  "success-content": "#ffffff",
  warning: "#b45309", // unverified data, caveats, "not included"
  "warning-content": "#ffffff",
  error: "#b42318", // errors, revoked, a higher rate
  "error-content": "#ffffff",
};

// The same hues, lightened for the dark page. Navy itself is only 1.8:1 on the dark page,
// so the primary becomes a lighter blue from the same family (6.5:1).
const dark = {
  primary: "#6b9bff",
  "primary-content": "#0b0f17",
  secondary: "#4cc3a8",
  "secondary-content": "#0b0f17",
  accent: "#f0a860",
  "accent-content": "#0b0f17",
  neutral: "#2a313c",
  "neutral-content": "#e6e9ef",

  "base-100": "#151a22",
  "base-200": "#0d1117",
  "base-300": "#2a313c",
  "base-content": "#e6e9ef",

  info: "#60a5fa",
  "info-content": "#0b0f17",
  success: "#5bd79c",
  "success-content": "#0b0f17",
  warning: "#f3c56b",
  "warning-content": "#0b0f17",
  error: "#ff8f8a",
  "error-content": "#0b0f17",
};

// Parts of one whole, in order: base duty, then each added program, then fees. For fills
// only: the light orange is 3.6:1 on white, too light for text.
const chart = {
  light: ["#1b3a8c", "#c7702a", "#1f8a7e", "#a37b12", "#64748b", "#a1a7b0"],
  dark: ["#6b9bff", "#f0a860", "#4cc3a8", "#e0b84a", "#94a3b8", "#5b6472"],
};

// Separate entities compared side by side (countries), assigned in slot order: blue,
// orange, green, yellow, slate. Colorblind-checked; no purple or pink.
const series = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#64748b"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#94a3b8"],
};

// Shapes daisyUI reads from the theme. Our controls set their own, but these keep any
// remaining daisyUI element in line.
const shape = {
  "--radius-box": "0.5rem",
  "--radius-field": "0.375rem",
  "--radius-selector": "0.25rem",
  "--border": "1px",
  "--depth": "0",
  "--noise": "0",
};

// The Tariff Tracker's own palette (DESIGN_SYSTEM.md §15): simple and colorful, applied inside
// "hts-tracker" on the same variables, so every themed component in the Tracker follows it.
// Cobalt is the user's data and the next step, green is money, red an increase, amber a
// heads-up or a lock, sky a second series, slate base duty. The sidebar is dark in both modes.
const tracker = {
  // Surfaces (Oct 2026 review, DESIGN_SYSTEM.md §15 "Surfaces"): ground (base-200) → surface, the
  // cards (base-100) → container (--tt-soft, fills inside a card) → container-high (--tt-soft-high:
  // hover, selected). Generated in OKLCH from the cobalt hue (265) at very low chroma, so each step
  // is even; in dark they get lighter as they come forward. Border (base-300) is at least 1.4:1
  // against a card, the strong rule (--tt-rule) about 1.8:1 for where structure changes.
  light: {
    primary: "#2f49d1",
    "primary-content": "#ffffff",
    secondary: "#7cc4f2",
    "secondary-content": "#0e1220",
    accent: "#a86a0c",
    "accent-content": "#ffffff",
    neutral: "#0e1220",
    "neutral-content": "#f1f3f8",
    "base-100": "#ffffff",
    "base-200": "#e3e6ee",
    "base-300": "#d4d7e0",
    "base-content": "#0e1220",
    info: "#2f49d1",
    "info-content": "#ffffff",
    success: "#138a5b",
    "success-content": "#ffffff",
    warning: "#a86a0c",
    "warning-content": "#ffffff",
    error: "#c2412d",
    "error-content": "#ffffff",
  },
  // Colors a step lighter and softer than light mode's, so they don't vibrate on the dark surfaces
  dark: {
    primary: "#8ea2ff",
    "primary-content": "#0e1220",
    secondary: "#5cc3f5",
    "secondary-content": "#0e1220",
    accent: "#f2b24c",
    "accent-content": "#0e1220",
    neutral: "#101319",
    "neutral-content": "#f1f3f8",
    "base-100": "#161a22",
    "base-200": "#0b0d13",
    "base-300": "#333843",
    "base-content": "#f1f3f8",
    info: "#8ea2ff",
    "info-content": "#0e1220",
    success: "#4fd39b",
    "success-content": "#0e1220",
    warning: "#f2b24c",
    "warning-content": "#0e1220",
    error: "#ff8a7c",
    "error-content": "#0e1220",
  },
  // Plain CSS variables for the Tracker's other surfaces, its shadow and chart marks
  extra: {
    light: {
      "--tt-soft": "#f2f4f9",
      "--tt-soft-high": "#e8ebf1",
      "--tt-rule": "#bfc4cf",
      // Two layers: a tight edge and a soft spread under the card
      "--tt-shadow": "0 1px 2px rgb(14 18 32 / 0.05), 0 8px 24px -12px rgb(14 18 32 / 0.16)",
      "--tt-side": "#0e1220",
      "--tt-side-card": "#1a2033",
      "--tt-side-active": "#20273d",
      "--tt-sky": "#7cc4f2",
      "--tt-slate": "#cdd2e0",
      // The import takeover (onboarding/ImportTakeover): headlines and callouts sit straight on its
      // ground, so in light it's near white and neutral, never the app's blue-gray, which turns
      // every warm tint on it muddy. Its lifts are a neutral shadow: a colored glow only reads as
      // light on a dark ground.
      "--tt-ob-ground": "#f7f8fb",
      "--tt-ob-glow": "rgb(14 18 32 / 0.3)",
      "--tt-ob-glow-success": "rgb(14 18 32 / 0.3)",
      // A tile straight on that ground: a white card with a hairline, not a gray fill
      "--tt-ob-tile": "#ffffff",
      "--tt-ob-tile-edge": "#d4d7e0",
    },
    dark: {
      "--tt-soft": "#1f232c",
      "--tt-soft-high": "#262b36",
      "--tt-rule": "#3f4551",
      // Tone does the lifting in dark; the shadow only settles the card's edge
      "--tt-shadow": "0 0 0 1px rgb(255 255 255 / 0.02), 0 8px 24px -12px rgb(0 0 0 / 0.6)",
      // A step darker than the cards, so the content leads
      "--tt-side": "#101319",
      "--tt-side-card": "#191d26",
      "--tt-side-active": "#20252f",
      "--tt-sky": "#5cc3f5",
      "--tt-slate": "#3a4154",
      // The import takeover: the app's ground, and lifts that glow in the color they're under
      "--tt-ob-ground": "#0b0d13",
      "--tt-ob-glow": "var(--color-primary)",
      "--tt-ob-glow-success": "var(--color-success)",
      "--tt-ob-tile": "var(--tt-soft)",
      "--tt-ob-tile-edge": "transparent",
    },
  },
  // Product chart parts in the Tracker: base duty a clear gray, then each program in a hue far
  // from the last (blue, orange, yellow, teal), then fees sage. A data palette of its own: none of
  // them is a state color (cobalt the brand, red an increase, green money), so a Section 232 bar
  // never reads as "something went up". Neighbours also differ in lightness, so they stay apart
  // side by side and for colorblind viewers.
  chart: {
    light: ["#959eb0", "#2a78d6", "#ea7a26", "#d9a90f", "#12949a", "#7f9c56"],
    dark: ["#a7afc0", "#5ea0ff", "#ff9547", "#f2c94c", "#3cc6c4", "#a8c47e"],
  },
};

module.exports = { light, dark, chart, series, shape, tracker };
