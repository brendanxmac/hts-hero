// Call-to-action bands on pages in the Tariff Tracker's look (DESIGN_SYSTEM.md §15): bold and
// eye-catching, and inverted from the page, so they're dark in light mode and light in dark mode
// (.hts-tracker-inverse, in the theme plugin). Theme classes inside follow the inversion.

// The band
export const band = "hts-tracker-inverse relative overflow-hidden bg-base-100 text-base-content";
// Its padding: closing bands roomier than mid-page ones
export const bandPad = "py-24 sm:py-28";
export const bandPadSm = "py-16 sm:py-20";

// The headline: Sora, big
export const title =
  "max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight text-base-content [font-family:var(--font-tracker-display)] sm:text-6xl";
export const titleSm =
  "text-3xl font-semibold leading-tight tracking-tight text-base-content [font-family:var(--font-tracker-display)] sm:text-4xl";
export const accent = "text-primary";
export const lead = "text-lg leading-relaxed text-base-content/70 sm:text-xl";
export const eyebrow = "text-xs font-bold uppercase tracking-wider text-primary";

// The one button: a big green pill (the trial and free starts are money), and a quiet second way
export const button =
  "group inline-flex h-16 items-center justify-center gap-3 rounded-full bg-success px-10 text-lg font-semibold text-success-content transition-colors hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/50";
export const buttonSm =
  "group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-success px-8 text-base font-semibold text-success-content transition-colors hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/50";
export const secondary =
  "inline-flex h-14 items-center justify-center gap-2 rounded-full border border-base-content/20 px-7 text-base font-semibold text-base-content transition-colors hover:bg-base-content/5";
export const link = "font-semibold text-base-content/80 underline decoration-base-content/30 underline-offset-4 hover:text-base-content hover:decoration-base-content";
