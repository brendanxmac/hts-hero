# HTS Hero Design System

This is the reference for HTS Hero's analytical UI. `/duty-calculator` and `/hts/[code]` are the reference pages: they follow every rule here. Use this doc for any new page and for the app-wide redesign.

The look is **clean, professional and analytical**. It should feel like a financial terminal or a well-made report, not a marketing site. Data is the hero. Decoration is not.

---

## 1. Principles

1. **Built-ins first, our own components.** Use Tailwind's scales (`text-sm`, `p-4`, `rounded-lg`, `shadow-sm`) and the theme's semantic colors (`bg-base-100`, `text-base-content/70`, `text-primary`). Controls (buttons, inputs, toggles, badges) come from `components/ui/`, never from daisyUI's component classes (§5). Write an exact value (`text-[13px]`, `w-[312px]`) or custom CSS only when nothing built in can do the job. Section 9 lists the few accepted exceptions.
2. **Data first.** Numbers, codes and rates are the content. Everything else (chrome, color, motion) is there to help someone read them.
3. **Flat and quiet.** Surfaces are separated by 1px borders and small changes in tone. No glows, no gradients, no blur, no large colored blocks, and no tinted panels: a panel is always a white (dark: `base-100`) card on the gray page, so it stands out instead of blending in.
4. **Color means something.** Navy is for actions and the one most important thing in a region. Green means savings or exemptions, orange means a caveat or an added cost, and red means an error or an increase. Everything else is neutral.
5. **Both themes, always.** Only use semantic colors, which have a light and a dark value. If something only looks right in one theme, it's a bug.
6. **Desktop first.** About 99% of traffic is desktop. Design at 1440px, then make sure it degrades cleanly to a 375px phone with no horizontal page scroll.

---

## 2. Color palette

### Brand and status

| Role | daisyUI name | Light | Dark | Use |
|---|---|---|---|---|
| Primary | `primary` | Navy `#1b3a8c` | Blue `#6b9bff` | Buttons, links, selection, focus, the key figure or code in a region |
| Secondary | `secondary` | Teal green `#167a6f` | `#4cc3a8` | Second data series. Rarely for UI |
| Accent | `accent` | Orange `#b45f1d` | `#f0a860` | Third data series, highlights that aren't status. Sparingly |
| Neutral | `neutral` | Slate `#1e293b` | `#2a313c` | Dark UI chrome (tooltips, the promo bar) |
| Success | `success` | `#0b7045` | `#5bd79c` | Savings, exemptions, "Free", a lower rate |
| Warning | `warning` | `#b45309` | `#f3c56b` | Unverified data, caveats, "not included" |
| Error | `error` | `#b42318` | `#ff8f8a` | Errors, revoked rulings, a higher rate |
| Info | `info` | `#2563eb` | `#60a5fa` | Neutral notices (prefer a plain notice with `primary`) |

**Retired:** daisyUI's default purple primary and pink secondary. Don't use purple or pink anywhere, including in charts.

**Why dark mode uses different values:** navy is 10:1 against white but only 1.8:1 against the dark page, which is unreadable. In dark mode, primary becomes a lighter blue from the same family (6.5:1). The orange and green also hold up in dark mode, but only in their brightened dark values. Every value above meets WCAG AA for text on `base-100` and `base-200` in its theme. The light chart orange (`#c7702a`, 3.6:1) is only for fills, never for text.

### Neutrals

| daisyUI | Light | Dark | Use |
|---|---|---|---|
| `base-200` | `#f5f6f8` | `#0d1117` | Page background; table header rows; footers and inset areas inside a card |
| `base-100` | `#ffffff` | `#151a22` | Cards, panels, the header, reference bands (notes, FAQ, guide) |
| `base-300` | `#e3e6eb` | `#2a313c` | Borders and dividers, hover on `base-200` |
| `base-content` | `#0f172a` | `#e6e9ef` | Text |

Text hierarchy comes from opacity on `base-content`, in three steps only:

| Class | Use |
|---|---|
| `text-base-content` | Headings, numbers, primary values |
| `text-base-content/70` | Body copy, table cells, labels |
| `text-base-content/60` | Captions, hints, metadata, icons at rest. **Never go lower for text.** |

Borders: `border-base-300`. A control that must read as one (input, secondary button) gets a stronger `border-base-content/15`–`/20` (built into the `ui` helpers).

Soft fills: `bg-primary/10` (selected, callout), `bg-success/10`, `bg-warning/10`, `bg-error/10`. Their borders are `border-primary/30`, `border-warning/40` and so on.

### Data visualization

Charts need more fixed hues than daisyUI has. These are CSS variables, used in `style` (see §9):

| Variable | Light | Dark | Use |
|---|---|---|---|
| `--dc-chart-1` | navy | blue | Base duty (always the first part of a whole) |
| `--dc-chart-2` | orange `#c7702a` | `#f0a860` | First added program |
| `--dc-chart-3` | green `#1f8a7e` | `#4cc3a8` | Second program |
| `--dc-chart-4` | ochre `#a37b12` | `#e0b84a` | Third program |
| `--dc-chart-5` | slate `#64748b` | `#94a3b8` | Fourth program |
| `--dc-chart-6` | gray `#a1a7b0` | `#5b6472` | Fees or "other" (always last) |
| `--dc-series-1…5` | blue, orange, green, yellow, slate | brightened versions of the same | Entities compared side by side (countries), assigned in slot order |
| `heat(pct)` | primary-tinted, darker as the total rises | same | Background behind a duty total |

Keep a color tied to the same thing everywhere on a page: if China is `series-1` in one chart, it's `series-1` in the next.

### Where the palette lives

`components/ui/theme.module.css` sets the palette as daisyUI's theme variables (`--p`, `--b1`, …), scoped to `.root`, so the new palette applies only to pages that opt in. When the whole app is on it, those values move into the daisyUI themes in `tailwind.config.js` and `.root` goes away.

To opt a page in, put `styles.root` on its outermost element:

```tsx
import styles from "@/components/ui/theme.module.css";

<main className={`${styles.root} w-full flex-1 flex flex-col`}>…</main>
```

When a component on the new theme is embedded in a page that isn't on it yet, wrap it in `${styles.root} ${styles.embedded}`. `.embedded` keeps the host page's background.

`theme.module.css` also holds legacy `--dc-*` tokens and primitive classes (`styles.card`, `styles.button`, …) for components still shared with other pages. **Don't use them in new code.** Delete them once nothing imports them.

### daisyUI's role

daisyUI is used **only as the theme engine**: it turns the palette above into semantic color utilities (`bg-base-100`, `text-primary`, `border-base-300`, `text-success`, with `/opacity`) that switch with light and dark mode. That's the consistency we want from it.

Its component classes (`btn`, `join`, `input`, `select`, `checkbox`, `badge`, `link`, `collapse`, `alert`, `stats`, `tabs`, `skeleton`, …) are **not used** on pages on the theme. Their shapes, sizes and states are fixed in daisyUI's CSS (only colors, radii and border width are themeable in v4), so they can't reach the look we want without fighting them. `components/ui/` replaces them (§5).

---

## 3. Type

Use Tailwind's type scale. No exact pixel sizes.

| Role | Classes |
|---|---|
| Hero headline (one per site page) | `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight` |
| Page title | `text-3xl lg:text-4xl font-semibold tracking-tight` |
| Section title (`<h2>`) | `text-2xl sm:text-3xl font-semibold tracking-tight` (use `SectionHeader`) |
| Card or panel title (`<h3>`) | `text-base font-semibold` |
| Kicker (above a section title) | `text-xs font-semibold uppercase tracking-wider text-primary` |
| Label (stat labels, table headers, rail headings) | `text-xs font-semibold uppercase tracking-wider text-base-content/60` |
| Lead paragraph | `text-lg leading-relaxed text-base-content/70` |
| Body | `text-base leading-relaxed text-base-content/70` |
| Dense UI (tables, lists, controls, card text) | `text-sm` |
| Caption, fine print | `text-xs text-base-content/60` |

**Metrics** (big numbers) are `font-semibold tracking-tight leading-none tabular-nums`:

| Metric | Size |
|---|---|
| Headline result | `text-5xl sm:text-6xl` |
| Primary stat | `text-4xl` (`text-3xl` when compact) |
| Secondary stat | `text-2xl` (`text-xl` when compact) |

Other rules:

- **Numbers:** add `tabular-nums` to anything numeric in a column, a table or a stat, or that changes as the user types.
- **Codes:** HTS codes, Chapter 99 headings and program codes are always mono (§9), so digits and dots line up.
- **Weights:** `font-medium` and `font-semibold` only.
- **Line length:** body copy is capped at `max-w-prose`, or `max-w-3xl` for wider leads.

---

## 4. Layout, spacing, shape

- **Page width:** `mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8`. Every band on a page uses it, so edges line up from header to footer.
- **Bands:** a page is a stack of full-width bands, all on the page background (`base-200`) and separated by `border-t border-base-300`. Don't give a band a `bg-base-100` fill: cards on it would blend in. Cards (`base-100`) are the only lighter surface.
- **Vertical rhythm:** band padding is `py-12 sm:py-16`. Sections inside a band are spaced `gap-16 sm:gap-20`. A section header and its content are `gap-6`. Card padding is `p-5` (`p-6` for large cards). Card title rows are `px-5 py-4`.
- **Spacing:** Tailwind's scale only. Prefer 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20.
- **Grids:** main + rail is `lg:grid-cols-[minmax(0,1fr)_20rem]`. Always use `minmax(0,…)` and `min-w-0`, so long codes and tables can't blow out the layout.
- **Anchors:** every section with an `id` gets `scroll-mt-6`.
- **Radius:** `rounded` for chips and badges, `rounded-md` for buttons, inputs and rows, `rounded-lg` for cards, panels and the segmented-control track, `rounded-full` for dots and avatars.
- **Shadow:** `shadow-sm` on resting cards, `shadow-lg` only on things that float (menus, popovers, tooltips, modals). Nothing else.

---

## 5. Controls and surfaces (`components/ui/`)

Class helpers live in `components/ui/styles.ts`. They're strings and functions rather than components, so the same look applies to a `<button>`, a `<Link>`, an `<a>` or an `<input>`, in server and client components:

```tsx
import * as ui from "@/components/ui/styles";

<Link href="/duty-calculator" className={ui.button({ variant: "primary", size: "lg" })}>Calculate</Link>
<button className={`${ui.button({ size: "sm" })} shrink-0`}>Copy</button>
<input className={ui.input} />
```

| Need | Use |
|---|---|
| Primary button | `ui.button({ variant: "primary" })`. **One per region** |
| Secondary button | `ui.button()`: surface, hairline border, `shadow-sm` |
| Quiet button (nav, dismiss) | `ui.button({ variant: "ghost" })` |
| Icon-only button | `ui.button({ variant: "ghost", size: "sm", icon: true })` + `aria-label` |
| Button sizes | `sm` (h-8) in toolbars and panel headers; `md` (h-9) default; `lg` (h-11) for page-level calls to action |
| Toggle between views or units | `<SegmentedControl label options value onChange size? fullWidth? />`: an inset track with the selected option raised |
| Text input | `ui.input` (h-10); `ui.inputSm` (h-8) in dense rows; `ui.inputBox` for chip inputs that wrap |
| Select | `ui.select` / `ui.selectSm` |
| Checkbox | `ui.checkbox` (native, `accent-primary`) |
| Inline link | `ui.link` |
| Card or panel | `ui.card` (`rounded-lg border border-base-300 bg-base-100 shadow-sm`) |
| Badge | `ui.badge("neutral" \| "primary" \| "success" \| "warning" \| "error")` |
| Notice (caveat, unverified data, error) | `ui.notice("warning")`: a card with a colored left rule. The icon takes the tone's color, the text stays `base-content` |
| Small caps label | `ui.label` |
| Loading | `ui.skeleton` blocks in the final layout's shape |
| Section header | `<SectionHeader>` |
| FAQ | `<FaqList>` |

If you need a control that isn't here (a menu, a tooltip, a modal), build it in `components/ui/` on these styles and add it to this table. For behavior-heavy controls (comboboxes, menus, dialogs), use Headless UI, which is already a dependency (see `CountryField`), and style it with these classes.

---

## 6. Patterns

### Section

```tsx
<section id="rulings" className="scroll-mt-6 flex flex-col gap-6">
  <SectionHeader kicker="CBP rulings" title={`Related CROSS Rulings for HTS ${htsno}`}>
    One or two sentences that say what's here and why it matters.
  </SectionHeader>
  {/* content */}
</section>
```

For reference sections (FAQ, notes), put the header in a left column: `grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12`, with the header `lg:sticky lg:top-6 lg:self-start`.

### Card with a header

`ui.card` with `overflow-hidden`. The title row is `px-5 py-4 border-b border-base-300`, with an `<h3>` and an optional caption. Controls (a `SegmentedControl` with `size="sm"`, a `sm` button) sit at its right. Footer rows are `border-t border-base-300 bg-base-200`.

### Data tables

- A plain `<table className="w-full text-sm tabular-nums">` inside `ui.card` with `overflow-hidden`, wrapped in `overflow-x-auto`.
- `<thead>` row: the label style on `bg-base-200`.
- Rows: `border-t border-base-300 hover:bg-base-200/60`. Cells are `px-4 py-3`.
- The row's subject is a `<th scope="row">`. Numbers are right-aligned with `tabular-nums`. Codes are mono, `text-xs text-base-content/60`.
- Sources and a CTA go in a footer row: `border-t border-base-300 bg-base-200`.

### Stat row in a card

A `grid` with `gap-px bg-base-300` and `bg-base-100` cells, so 1px dividers draw themselves at every breakpoint (see `SummaryStats` in `Results.tsx`). Labels use `ui.label`; values use the metric sizes.

### Code chips

- HTS code as a link: mono, `font-semibold text-primary`.
- Program pill: `ui.badge("neutral")` plus `mono.className`.

### Color in data

- Totals and rates are `text-base-content`. Color a number only for meaning: `text-success` for a saving or a lower total, `text-error` for an increase.
- Duty totals in tables get `heat()`, not status colors.
- In a stacked bar, base duty is `--dc-chart-1`, then programs in order, then fees as `--dc-chart-6`.

### Calls to action

- **Inline:** `ui.link` with an arrow icon.
- **In a region:** one primary button, plus at most one secondary.
- **Page-level:** a `ui.card` holding a `SectionHeader` and a `lg` primary button. Its position, the heading and the navy button make it stand out, not a tinted fill.
- Never use a solid `bg-primary` block or a tinted (`bg-primary/5`, `bg-warning/10`) panel as a banner.

### Tints

Tinted fills (`bg-primary/10`, `bg-success/10`, …) are only for **small** elements: badges, the selected row in a list, highlighted table rows, a step number. Never for a card, panel, section or banner. To flag a panel's meaning, put an icon in the status color next to its title, or use `ui.notice`.

### Interaction

- **Hover:** rows `hover:bg-base-200`, card links `hover:border-primary/40`, icons `text-base-content/60` → `group-hover:text-primary`.
- **Focus:** always visible. The `ui` helpers include a focus ring; custom elements get `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`.
- **Motion:** `transition-colors` only. No translate or scale on hover. Respect `motion-reduce:`.

### Don't

- Glows, gradients, `blur-*`, `backdrop-blur`, or decorative shapes
- `shadow-md` or larger on anything that doesn't float
- Solid primary-filled or tinted panels and banners
- daisyUI component classes (`btn`, `join`, `input`, `badge`, `collapse`, `alert`, …) on themed pages
- A `bg-base-100` band holding `bg-base-100` cards
- Purple or pink, or Tailwind palette colors (`text-gray-500`, `bg-blue-600`), or hex/`rgb()` in TSX
- Exact pixel values where a Tailwind step exists
- Text below `/60` opacity
- More than one primary button per region
- Emoji or icons as decoration (flags next to country names are data, so they're fine)

---

## 7. Shared components (`components/ui/`)

| Component | Use |
|---|---|
| `theme.module.css` | Palette (`styles.root`, `styles.embedded`) and chart variables |
| `font.ts` | `mono` (IBM Plex Mono): `className={mono.className}` for codes |
| `<SectionHeader kicker title titleId? className?>lead</SectionHeader>` | The top of every page section |
| `<FaqList faqs openFirst? />` | FAQ disclosures. The text must match the page's `FAQPage` JSON-LD |
| `heat(pct)` | Tint behind a duty total |
| `styles.ts` | Class helpers for controls and surfaces (§5) |
| `<SegmentedControl>` | Toggle between options (§5) |

Feature components to reuse before writing new ones: `duty-calculator/controls.tsx` (`Field`, `NumberField`, `Segmented`), `duty-calculator/shared.tsx` (`ShareButtons`, `DateNotice`, `Disclaimer`), `duty-calculator/MoneyBreakdown.tsx` (stacked bar + legend), and `hts-page/DutyByCountry.tsx` (the reference data table).

---

## 8. Light and dark mode

- The site sets `<html data-theme="light|dark">` from the header toggle, or from the OS until the user picks one. Semantic classes follow it automatically. Components never check the theme.
- Text on a `primary` fill uses `text-primary-content`, never `text-white`: in dark mode the primary is light and its content is dark.
- Soft fills (`bg-primary/10`) work in both themes, but only on small elements (§6, Tints).
- Before you ship, check both themes. Look at contrast, borders that disappear, and anything that looks "lit up".

---

## 9. Accepted exceptions to "built-ins first"

These are the only places exact values or custom CSS are expected. Keep a short comment on each saying why.

1. **Palette and chart colors:** `theme.module.css`, and `style={{ background: "var(--dc-chart-2)" }}` for chart marks and legend swatches.
2. **Runtime values:** bar widths, chart geometry, `heat()` tints, and series colors in `style`.
3. **Mono font:** `mono.className` from `next/font`.
4. **Grid templates:** `grid-cols-[minmax(0,1fr)_20rem]` and similar. Tailwind has no built-in for "fluid + fixed rail".
5. **A width a design depends on** (a dropdown's `min-w-[16rem]`, an axis label column). Use rem, not px.

Everything else uses the scales. If you need the same exception twice, it should probably be a component.

---

## 10. Component and file rules

### Creating a component

1. **Search first.** Check `components/ui/` and the feature folders in §7. Extend what exists before you add something new.
2. **Where it goes:** used by one feature, it lives in `components/<feature>/`. Used by two or more, it lives in `components/ui/`. Promote it when a second user appears, not before. Never import from another feature's folder; move the shared piece to `ui/` first.
3. **One component per file** for anything exported and reused. Small private helpers can live below the main component in the same file.
4. **File names:** components in `PascalCase.tsx`, matching the export. Hooks are `useThing.ts`. Pure helpers are `camelCase.ts`.
5. **Named exports** for components. Default exports only where Next.js requires them (`page.tsx`, `layout.tsx`).
6. **Server first.** Leave out `"use client"` unless the component uses state, effects or browser APIs. Keep SEO content (rates, explanations, FAQs) server-rendered.
7. **Props:** pass data, not class names. A `className` prop is only for layout (margin, grid placement) from the parent.
8. **Size:** split a file past about 400 lines, or one with more than one screen-level concern, by concern. `Results.tsx`, `RateHistory.tsx` and `HtsCodePageContent.tsx` are candidates.

### Styling rules

- `components/ui/` helpers and semantic colors first, then Tailwind's scales, then the exceptions in §9. No daisyUI component classes.
- No new CSS files. No `!important` (`!h-11`). No inline `style` except for runtime values.
- No hex, `rgb()`, Tailwind palette colors or `--dc-*` legacy tokens in new code.
- Don't repeat long class strings. If the same 4+ classes appear in several places, make a component.

### Code cleanliness

- **Comments say why, not what.** One short line above a non-obvious block. Match the plain, sentence-case style of the existing files.
- **Delete, don't comment out.** Git keeps history.
- **No unused imports or variables.** Lint clean on every file you touch.
- **No `any`.** Derive types from data (`HtsDutySummary["rows"][number]`).
- **Keep logic out of JSX.** Compute values above the `return`. Put formatting in `format.ts`, data shaping in `libs/`.
- **Accessibility:** use real elements (`<button>`, `<a>`, `<table>`, `<th scope>`), give icon-only controls an `aria-label`, mark decorative icons `aria-hidden`, and add `aria-live` where results update.
- **Naming:** say what something is in domain terms (`DutyByCountry`), not in visual terms (`BlueBox`).
- Run `npx tsc --noEmit` and `npx eslint` on touched files before committing.

---

## 11. Rolling this out to the rest of the app

1. **Promote the palette.** Move the light and dark values from `theme.module.css` into the daisyUI themes in `tailwind.config.js` (replacing the default purple/pink `light` and `dark`). Every page picks up navy at once. Then check pages that relied on purple or pink, such as gradients and `secondary` badges.
2. **Replace daisyUI components with `components/ui/`** page by page: `btn` → `ui.button`, `input`/`select` → `ui.input`/`ui.select`, `join`/`tabs` → `SegmentedControl`, `badge` → `ui.badge`, `alert` → `ui.notice`, `collapse` → `<details>` as in `FaqList`, `modal` → a `ui` dialog built on Headless UI.
3. **Migrate page by page.** Start with public SEO pages (`/section/[n]`, `/chapter/[n]`, `/explore`), then the marketing pages, then the signed-in app. For each page, replace exact sizes with Tailwind steps and custom colors with semantic ones, remove glows and gradients, and use the patterns in §6. Check light and dark at 1440px and 375px.
4. **Delete legacy code.** Remove `.root`, the legacy `--dc-*` tokens and the primitive classes from `theme.module.css` when nothing uses them.
5. **Optionally drop daisyUI.** Once no page uses its component classes, it's only providing color utilities. Those can be defined directly as Tailwind theme colors on CSS variables (`colors: { primary: "oklch(var(--p) / <alpha-value>)", … }`), keeping the same class names, and daisyUI can be removed.

---

## 12. Review checklist

- [ ] `components/ui/` controls, no daisyUI component classes; semantic colors; Tailwind scale sizes; exceptions only from §9
- [ ] No tinted panels; cards are `ui.card` on the gray page
- [ ] No purple or pink; no hex, `rgb()` or palette colors; no `--dc-*` in new code
- [ ] Color used only for meaning (primary = action or key figure; success, warning, error = status)
- [ ] Text no lighter than `text-base-content/60`; `tabular-nums` on numbers; codes in mono
- [ ] `shadow-lg` only on floating elements; no glows, gradients or blur
- [ ] Sections use `SectionHeader`; bands use the page-width classes
- [ ] At most one primary button per region
- [ ] Looks right in light and dark, at 1440px and 375px
- [ ] Focus is visible; icon buttons have labels; tables use `<th>`
- [ ] `npx tsc --noEmit` and `npx eslint` are clean for touched files
