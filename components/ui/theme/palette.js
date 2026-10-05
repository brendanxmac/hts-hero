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

module.exports = { light, dark, chart, series, shape };
