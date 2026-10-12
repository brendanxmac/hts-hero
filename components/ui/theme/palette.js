// HTS Hero's color palette: every color the analytical theme uses, light and dark, in one
// place. The theme plugin (./plugin.js) turns this into the daisyUI color variables behind
// the semantic classes (bg-base-100, text-primary, text-success...) and the chart variables
// (--chart-1, --series-1...). Components never use these hex values directly.
//
// Contrast: every text color meets WCAG AA (4.5:1) on base-100 and base-200 in its theme.
// Change a value here, check both themes, and update the palette table in DESIGN_SYSTEM.md.
// CommonJS, so tailwind.config.js can require it.

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
  "--rounded-box": "0.5rem",
  "--rounded-btn": "0.375rem",
  "--rounded-badge": "0.25rem",
  "--tab-radius": "0.375rem",
  "--animation-btn": "0",
  "--animation-input": "0",
  "--btn-focus-scale": "1",
  "--border-btn": "1px",
};

// The Tariff Tracker's own palette (DESIGN_SYSTEM.md §15): simple and colorful, applied inside
// "hts-tracker" on the same variables, so every themed component in the Tracker follows it.
// Cobalt is the user's data and the next step, green is money, red an increase, amber a
// heads-up or a lock, sky a second series, slate base duty. The sidebar is dark in both modes.
const tracker = {
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
    "base-200": "#eef0f5",
    "base-300": "#e3e6ee",
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
  dark: {
    primary: "#8ea2ff",
    "primary-content": "#0e1220",
    secondary: "#5cc3f5",
    "secondary-content": "#0e1220",
    accent: "#f2b24c",
    "accent-content": "#0e1220",
    neutral: "#111319",
    "neutral-content": "#f1f3f8",
    "base-100": "#111319",
    "base-200": "#08090d",
    "base-300": "#232733",
    "base-content": "#f1f3f8",
    info: "#8ea2ff",
    "info-content": "#0e1220",
    success: "#34c98b",
    "success-content": "#0e1220",
    warning: "#f2b24c",
    "warning-content": "#0e1220",
    error: "#ff7d6e",
    "error-content": "#0e1220",
  },
  // Plain CSS variables for the Tracker's extra surfaces and chart marks
  extra: {
    light: {
      "--tt-soft": "#f5f6fa",
      "--tt-side": "#0e1220",
      "--tt-side-card": "#1a2033",
      "--tt-side-active": "#20273d",
      "--tt-sky": "#7cc4f2",
      "--tt-slate": "#cdd2e0",
    },
    dark: {
      "--tt-soft": "#181b23",
      "--tt-side": "#111319",
      "--tt-side-card": "#1a1e28",
      "--tt-side-active": "#1f2431",
      "--tt-sky": "#5cc3f5",
      "--tt-slate": "#3a4154",
    },
  },
  // Product chart parts in the Tracker: base duty slate, then cobalt, sky, amber, red, green
  chart: {
    light: ["#cdd2e0", "#2f49d1", "#7cc4f2", "#a86a0c", "#c2412d", "#138a5b"],
    dark: ["#3a4154", "#8ea2ff", "#5cc3f5", "#f2b24c", "#ff7d6e", "#34c98b"],
  },
};

module.exports = { light, dark, chart, series, shape, tracker };
