/* eslint-disable @typescript-eslint/no-var-requires -- CommonJS: app/globals.css loads this with @plugin */
// Tailwind plugin that applies the palette (./palette.js) to anything inside the class
// "hts-theme": the daisyUI color variables behind the semantic classes, and the chart
// variables. Follows <html data-theme="dark|light">, falling back to the OS setting.
// Scoped to a class so pages can move to the theme one at a time; when every page has, the
// palette can become the daisyUI themes in app/globals.css and this plugin goes away.

const plugin = require("tailwindcss/plugin");
const palette = require("./palette");

// daisyUI 5 reads each color from --color-<name>, in any CSS color format
const colorVars = (colors) => Object.fromEntries(Object.entries(colors).map(([name, color]) => [`--color-${name}`, color]));

const chartVars = (mode) => ({
  ...Object.fromEntries(palette.chart[mode].map((color, i) => [`--chart-${i + 1}`, color])),
  ...Object.fromEntries(palette.series[mode].map((color, i) => [`--series-${i + 1}`, color])),
});

const themeVars = (mode) => ({ ...colorVars(palette[mode]), ...chartVars(mode), colorScheme: mode });

// The Tariff Tracker's palette (palette.tracker), on the same variables
const trackerVars = (mode) => ({
  ...colorVars(palette.tracker[mode]),
  ...Object.fromEntries(palette.tracker.chart[mode].map((color, i) => [`--chart-${i + 1}`, color])),
  ...palette.tracker.extra[mode],
  colorScheme: mode,
});

module.exports = plugin(({ addBase }) => {
  addBase({
    ".hts-theme": {
      ...themeVars("light"),
      ...palette.shape,
      backgroundColor: "var(--color-base-200)",
      color: "var(--color-base-content)",
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
    // (Cards round to 20px in the Tracker's look: app/globals.css, so it wins over rounded-lg)
    // Inside a card, a fill made with base-200 (a table head, a footer, a hover) takes the
    // container tone instead of the ground's, so it never reads as a hole through the card
    ".hts-tracker .tt-card, .hts-tracker.tt-card": { "--color-base-200": "var(--tt-soft)" },
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
