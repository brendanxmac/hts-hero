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
    },
    // Inside another page (explorer, classification): keep that page's background
    ".hts-theme.hts-theme-embedded": { backgroundColor: "transparent" },
  });
});
