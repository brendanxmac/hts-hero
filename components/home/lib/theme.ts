// The homepage in the Tariff Tracker's look (DESIGN_SYSTEM.md §15). The page follows the site's
// light/dark setting (FollowTheme in app/page.tsx); these are its fixed parts.

// A band that stays dark in both modes (the hero, savings, the closing offer): the Tracker's
// dark palette, as on its sidebar, so theme classes inside read light on dark. Its ground is the
// darkest Tracker tone, so it stays apart from the page in dark mode too
export const darkBand = "hts-tracker-on-dark bg-base-200 text-base-content";

// A product view inside a dark band that follows the page's light/dark setting again
export const followPage = "hts-theme hts-tracker bg-transparent";

// Sora, for headlines and big numbers
export const display = "[font-family:var(--font-tracker-display)]";

// The big call to action: the trial is money, so green (one per band)
export const moneyButton =
  "group inline-flex h-16 items-center gap-3 rounded-full bg-success px-9 text-lg font-semibold text-success-content transition-colors hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/50";

// The same at the size of the page's other buttons
export const moneyButtonMd =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-success px-6 text-base font-semibold text-success-content transition-colors hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/50";

// The homepage's dark bands carry a soft glow, cobalt from the top right and green from the bottom
// left (an exception to §15's no-glow rule, for this page only: DESIGN_SYSTEM.md §10)
export const glow =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(64rem_30rem_at_55%_-10%,oklch(var(--p)/0.3),transparent),radial-gradient(44rem_26rem_at_0%_110%,oklch(var(--su)/0.16),transparent)]";
