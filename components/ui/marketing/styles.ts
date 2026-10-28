// The marketing layer: the look of landing pages (/tariff-monitor, /tariff-audit), from the
// "Command center" direction: always light, crisp slate and navy with a teal accent, big type, and
// dark bands for contrast. Pages that opt in with .follow-theme (FollowTheme: /duty-calculator and
// the country pages) get the Tariff Tracker's look instead through the skin: variants: its theme
// tokens and fonts, following the site's light/dark setting. Analytical pages use the main design system (components/ui/styles)
// instead. See DESIGN_SYSTEM.md §14.

// color-scheme keeps native controls (checkboxes, selects, scrollbars) light under the dark toggle
export const page =
  "bg-white text-slate-900 antialiased scheme-light skin:bg-base-100 skin:text-base-content follow-dark:scheme-dark"
export const container = "mx-auto w-full max-w-(--breakpoint-xl) px-6 lg:px-8"

// Bands: the full-width stripes a page is made of
export const band = "py-20 sm:py-28"
export const bandTint =
  "bg-linear-to-b from-teal-50/70 to-white skin:bg-none skin:bg-base-100"
export const bandMuted = "bg-slate-50 skin:bg-tt-soft"
// .mk-dark: on pages in the Tracker's look, the theme plugin gives it the dark palette in both modes
export const bandDark =
  "mk-dark bg-slate-950 text-white skin:bg-base-200 skin:text-base-content"

// Type
export const eyebrow =
  "text-sm font-semibold uppercase tracking-wider text-teal-700 skin:text-xs skin:font-bold skin:text-primary"
export const eyebrowDark =
  "text-sm font-semibold uppercase tracking-wider text-teal-300 skin:text-xs skin:font-bold skin:text-primary"
export const display =
  "text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl sm:leading-none skin:font-semibold skin:text-base-content skin:[font-family:var(--font-tracker-display)]"
export const h2 =
  "text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl sm:leading-none skin:font-semibold skin:text-base-content skin:[font-family:var(--font-tracker-display)]"
export const h2Dark =
  "text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl sm:leading-none skin:font-semibold skin:text-base-content skin:[font-family:var(--font-tracker-display)]"
export const h3 =
  "text-xl font-semibold text-slate-900 skin:text-base-content skin:[font-family:var(--font-tracker-display)]"
export const lead =
  "text-lg leading-relaxed text-slate-600 sm:text-xl sm:leading-7 skin:text-base-content/70"
export const leadDark =
  "text-lg leading-relaxed text-slate-300 sm:text-xl sm:leading-7 skin:text-base-content/70"
export const body =
  "text-base leading-relaxed text-slate-600 skin:text-base-content/70"
export const small = "text-sm text-slate-500 skin:text-base-content/60"
export const accent = "text-teal-600 skin:text-primary"
export const accentDark = "text-teal-300 skin:text-primary"

// Surfaces
export const card =
  "rounded-2xl border border-slate-200 bg-white shadow-xs skin:rounded-3xl skin:border-base-300 skin:bg-base-100 skin:shadow-none"
export const cardDark =
  "rounded-2xl border border-white/10 bg-white/4 skin:rounded-3xl skin:border-base-300 skin:bg-base-100"
// A framed product view: the dashboard, the app screenshot
export const frame =
  "rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-2xl shadow-slate-900/10 skin:rounded-3xl skin:border-base-300 skin:bg-tt-soft skin:shadow-none"

// Buttons
const button =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-base font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500/60 skin:rounded-full skin:focus-visible:ring-primary/40"
export const buttonPrimary = `${button} bg-slate-900 text-white hover:bg-slate-800 skin:bg-base-content skin:text-base-100 skin:hover:bg-base-content/90`
export const buttonSecondary = `${button} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 skin:border-base-300 skin:bg-base-100 skin:text-base-content hover:skin:bg-tt-soft`
export const buttonOnDark = `${button} bg-teal-400 text-slate-950 hover:bg-teal-300 skin:bg-success skin:text-success-content skin:hover:bg-success/90`
export const buttonGhostDark = `${button} border border-white/15 text-white hover:bg-white/5 skin:border-base-content/20 skin:text-base-content skin:hover:bg-base-content/5`

export const link =
  "font-semibold text-teal-700 underline decoration-teal-300 decoration-2 underline-offset-4 hover:decoration-teal-600 skin:text-primary skin:decoration-primary/40 skin:hover:decoration-primary"

// Forms
export const fieldLabel =
  "text-sm font-semibold text-slate-700 skin:text-base-content/70"
export const input =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 skin:rounded-xl skin:border-base-300 skin:bg-base-100 skin:text-base-content skin:placeholder:text-base-content/50 skin:focus:border-primary skin:focus:ring-primary/30"
export const textarea =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 skin:rounded-xl skin:border-base-300 skin:bg-base-100 skin:text-base-content skin:placeholder:text-base-content/50 skin:focus:border-primary skin:focus:ring-primary/30"
export const checkbox =
  "h-4 w-4 rounded-sm border-slate-300 accent-teal-600 skin:accent-primary"
