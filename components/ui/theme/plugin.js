/* eslint-disable @typescript-eslint/no-var-requires -- CommonJS: tailwind.config.js loads this */
// Tailwind plugin that applies the palette (./palette.js) to anything inside the class
// "hts-theme": the daisyUI color variables behind the semantic classes, and the chart
// variables. Follows <html data-theme="dark|light">, falling back to the OS setting.
// Scoped to a class so pages can move to the theme one at a time; when every page has, the
// palette can become the daisyUI themes in tailwind.config.js and this plugin goes away.

const plugin = require("tailwindcss/plugin");
// daisyUI's own hex-to-oklch conversion (a method: keep it on its object)
const daisyTheming = require("daisyui/src/theming/functions");
const palette = require("./palette");

const chartVars = (mode) => ({
  ...Object.fromEntries(palette.chart[mode].map((color, i) => [`--chart-${i + 1}`, color])),
  ...Object.fromEntries(palette.series[mode].map((color, i) => [`--series-${i + 1}`, color])),
});

const themeVars = (mode) => {
  const vars = daisyTheming.convertColorFormat(palette[mode]);
  // daisyUI adds its default shapes; ours come from the palette
  Object.keys(vars).forEach((key) => {
    if (!/^--[a-z0-9]+$/.test(key) || key.startsWith("--rounded") || key.startsWith("--animation")) delete vars[key];
  });
  return { ...vars, ...chartVars(mode), colorScheme: mode };
};

// The Tariff Tracker's palette (palette.tracker), on the same variables
const trackerVars = (mode) => {
  const vars = daisyTheming.convertColorFormat(palette.tracker[mode]);
  Object.keys(vars).forEach((key) => {
    if (!/^--[a-z0-9]+$/.test(key) || key.startsWith("--rounded") || key.startsWith("--animation")) delete vars[key];
  });
  return {
    ...vars,
    ...Object.fromEntries(palette.tracker.chart[mode].map((color, i) => [`--chart-${i + 1}`, color])),
    ...palette.tracker.extra[mode],
    colorScheme: mode,
  };
};

module.exports = plugin(({ addBase }) => {
  addBase({
    ".hts-theme": {
      ...themeVars("light"),
      ...palette.shape,
      backgroundColor: "oklch(var(--b2))",
      color: "oklch(var(--bc))",
      "-webkit-font-smoothing": "antialiased",
    },
    '[data-theme="dark"] .hts-theme': themeVars("dark"),
    "@media (prefers-color-scheme: dark)": {
      ":root:not([data-theme]) .hts-theme": themeVars("dark"),
      // The Tracker's dark palette, more specific so it wins over the line above
      ":root:not([data-theme]) .hts-theme.hts-tracker": trackerVars("dark"),
      // A call-to-action band inverts to light (rule below, by the OS setting)
      ":root:not([data-theme]) .hts-tracker .hts-tracker-inverse": trackerVars("light"),
    },
    // Inside another page (explorer, classification): keep that page's background
    ".hts-theme.hts-theme-embedded": { backgroundColor: "transparent" },
    // Always light, whatever the toggle says: marketing pages, and any themed tool inside one
    // (the duty calculator on /duty-calculator). Placed last and as specific as the dark rules
    // above, so it wins over both of them.
    ":root .hts-theme.hts-theme-light, [data-theme] .hts-theme.hts-theme-light, :root .hts-theme-light .hts-theme, [data-theme] .hts-theme-light .hts-theme":
      themeVars("light"),
    // Always dark, on a transparent background: themed text that sits straight on a dark band
    // (the calculator's results heading and fine print on /duty-calculator). Placed after the
    // light rule and more specific, so it wins inside a light page too.
    ":root .hts-theme.hts-theme-dark, :root .hts-theme-light .hts-theme.hts-theme-dark": {
      ...themeVars("dark"),
      backgroundColor: "transparent",
    },
    // The Tariff Tracker (DESIGN_SYSTEM.md §15): its palette, and softer, rounder panels. Placed
    // after the rules above and more specific, so it wins inside the Tracker in both modes.
    ":root .hts-theme.hts-tracker": trackerVars("light"),
    '[data-theme="dark"] .hts-theme.hts-tracker': trackerVars("dark"),
    // Inside a page held light (THEME_LIGHT, e.g. the country pages), the Tracker look stays light
    // too. As specific as the dark rules above and after them, so it wins.
    ":root .hts-theme-light .hts-theme.hts-tracker, [data-theme] .hts-theme-light .hts-theme.hts-tracker": trackerVars("light"),
    // A page that follows the site's light/dark setting (.follow-theme): anything inside it held
    // light (the footer, themed blocks in marketing sections) follows too
    '[data-theme="dark"] .follow-theme .hts-theme.hts-theme-light, [data-theme="dark"] .follow-theme.hts-theme.hts-theme-light': themeVars("dark"),
    ".hts-tracker .rounded-lg": { borderRadius: "1.25rem" },
    // The sidebar is dark in both modes: everything inside it takes the dark palette
    ".hts-tracker .hts-tracker-on-dark, [data-theme] .hts-tracker .hts-tracker-on-dark": trackerVars("dark"),
    // Landing pages in the Tracker's look: their dark bands (mk.bandDark marks them .mk-dark) take
    // the dark palette in both modes, so theme classes inside read light on dark
    ".follow-theme .mk-dark, [data-theme] .follow-theme .mk-dark": trackerVars("dark"),
    // A call-to-action band, inverted from the page: dark in light mode, light in dark mode
    ".hts-tracker .hts-tracker-inverse": trackerVars("dark"),
    '[data-theme="dark"] .hts-tracker .hts-tracker-inverse': trackerVars("light"),
  });
});
