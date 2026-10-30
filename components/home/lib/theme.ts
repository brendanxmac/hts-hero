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

// The big call to action, in the primary (button) color like every button on the page
export const moneyButton =
  "group inline-flex h-16 w-full items-center justify-center gap-3 rounded-full bg-primary px-9 sm:w-auto sm:min-w-80 text-lg font-semibold text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50";

// The same at the size of the page's other buttons
export const moneyButtonMd =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50";

// The homepage's dark bands carry a soft glow, cobalt from the top right and green from the bottom
// left (an exception to §15's no-glow rule, for this page only: DESIGN_SYSTEM.md §10)
export const glow =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(64rem_30rem_at_55%_-10%,color-mix(in_oklab,var(--color-primary)_30%,transparent),transparent),radial-gradient(44rem_26rem_at_0%_110%,color-mix(in_oklab,var(--color-success)_16%,transparent),transparent)]";

// The page's regular buttons (mk.buttonPrimary's shape), in the primary color
export const primaryButton =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50";
