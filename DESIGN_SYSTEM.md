# HTS Hero Design System

This is the reference for HTS Hero's analytical UI. `/duty-calculator` and `/hts/[code]` are the reference pages: they follow every rule here. Use this doc for any new page and for moving the rest of the app off DaisyUI.

The look is **clean, professional and analytical**. It should feel like a financial terminal or a well-made report, not a marketing site. Data is the hero. Decoration is not.

---

## 1. Principles

1. **Data first.** Numbers, codes and rates are the content. Everything else (chrome, color, motion) is there to help someone read them.
2. **Flat and quiet.** Surfaces are separated by 1px borders and small changes in tone. No glows, no gradients, no blur, no large colored blocks.
3. **One accent.** Use `--dc-accent` for interactive things and for the single most important element in a region. If everything is accented, nothing is.
4. **Both themes, always.** Every color comes from a token, and every token has a light and a dark value. If something only looks right in one theme, it's a bug.
5. **A small, fixed vocabulary.** One type scale, one radius scale, two shadows, a handful of primitives. Reuse them. Don't invent a variant for one screen.
6. **Desktop first.** About 99% of traffic is desktop. Design at 1440px, then make sure it degrades cleanly to a 375px phone with no horizontal page scroll.

---

## 2. Where things live

```
components/ui/                 ← the design system: shared by every page
  theme.module.css             ← tokens (light + dark) and CSS primitives
  font.ts                      ← `mono` (IBM Plex Mono) for codes
  SectionHeader.tsx            ← kicker + <h2> + lead paragraph
  FaqList.tsx                  ← FAQ disclosures
  heat.ts                      ← tint for duty totals in tables/lists
components/<feature>/          ← feature components (duty-calculator/, hts-page/, …)
```

**Rule:** if two features need it, it goes in `components/ui/`. If only one feature needs it, it stays in that feature's folder. Never import from another feature's folder (for example, `hts-page/` must not import from `duty-calculator/`). Move the shared piece to `ui/` first.

### Opting a page in

Tokens are scoped to `.root`. Put it on the page's outermost element:

```tsx
import styles from "@/components/ui/theme.module.css";

<main className={`${styles.root} w-full flex-1 flex flex-col`}>…</main>
```

When a token-styled component sits inside a page that isn't on the system yet (for example, a duty estimate embedded in a classification), wrap it in `${styles.root} ${styles.embedded}`. `.embedded` keeps the host page's background.

---

## 3. Tokens

All tokens are CSS custom properties defined in `components/ui/theme.module.css`. Use them through Tailwind arbitrary values, `text-[var(--dc-text-2)]`, or through the primitive classes.

**Never** write a hex, `rgb()` or Tailwind palette color (`text-gray-500`, `bg-blue-600`) in a component. **Never** use DaisyUI semantic classes (`bg-base-100`, `text-base-content/60`, `btn`, `badge`, `text-primary`) on a page that's on the system.

### Surfaces and lines

| Token | Use |
|---|---|
| `--dc-bg` | Page background |
| `--dc-surface` | Cards, panels, table bodies, the header, and "reference" bands such as notes and FAQ |
| `--dc-surface-2` | Table headers, footers inside a card, inset areas, hover rows, segmented-control tracks |
| `--dc-surface-3` | Hover on a `surface-2` element, skeleton shimmer |
| `--dc-border` | Default 1px border and divider |
| `--dc-border-strong` | Inputs, secondary buttons, and anything that must read as a control |

### Text

| Token | Use |
|---|---|
| `--dc-text` | Headings, numbers, primary values |
| `--dc-text-2` | Body copy, table cells, labels |
| `--dc-text-3` | Captions, hints, metadata, placeholder, icons at rest |

All three meet WCAG AA on every surface in both themes. Don't lower contrast with opacity (`opacity-60`). Pick a lower text token instead.

### Accent and status

| Token | Use |
|---|---|
| `--dc-accent` / `-hover` / `-contrast` | Primary buttons, links, focus, selected state, HTS codes that are links |
| `--dc-accent-soft` / `-border` | Selected or hovered rows, callouts, icon tiles |
| `--dc-focus` | Focus ring on inputs |
| `--dc-positive` / `-soft` | Savings, exemptions, "Free", good outcomes |
| `--dc-negative` / `-soft` | Increases, revoked, errors |
| `--dc-warning` / `-soft` / `-border` | Unverified data, caveats, "not included" |

Status colors carry meaning. Don't use green for decoration or red for emphasis.

### Data visualization

| Token | Use |
|---|---|
| `--dc-chart-1 … 6` | Parts of one whole: base duty, then each program, then fees (`chart-6` is reserved for fees or "other") |
| `--dc-series-1 … 5` | Separate entities compared side by side (countries). A colorblind-checked categorical set, assigned in slot order |
| `heat(pct)` | Tint behind a duty total in a table or list. One hue, darker as the total rises |

Keep a color tied to the same thing everywhere on a page: if China is `series-1` in one chart, it's `series-1` in the next.

### Shadows

| Token | Use |
|---|---|
| `--dc-shadow` | Resting cards (already part of `.card`) |
| `--dc-shadow-pop` | **Floating things only:** dropdowns, combobox menus, popovers, tooltips, modals |

A static panel never gets `--dc-shadow-pop`, however important it is. Emphasis comes from position, size and the accent, not from elevation.

### Adding or changing a token

- Add it to all three blocks in `theme.module.css`: light (`.root`), `html[data-theme="dark"]`, and the `prefers-color-scheme` block. The last two must stay identical.
- Check contrast in both themes. Text tokens need at least 4.5:1 on `--dc-surface` and `--dc-surface-2`.
- Name it by role (`--dc-warning-border`), not by appearance (`--dc-amber`).

---

## 4. Type

### Families

- **Sans:** the site font, for everything except codes.
- **Mono:** `mono.className` from `components/ui/font.ts`, for HTS codes, Chapter 99 headings, and program codes. Codes are always mono, so digits and dots line up.
- **Numbers:** add `styles.num` (tabular figures) to anything that shows numbers in a column, a table, a stat, or that changes as the user types.

### Scale

Sizes come only from this scale: **11 · 12 · 13 · 14 · 15 · 16 · 18 · 20 · 24 · 28 · 32 · 36 · 40 · 48 · 56 · 64**. Don't use half pixels (`text-[13.5px]`) or sizes off the scale.

| Role | Class | Spec |
|---|---|---|
| Hero headline (one per site page) | inline | 36 → 48 → 56, semibold, `tracking-[-0.03em]`, `leading-[1.05]` |
| Page title | inline | 32 → 40, semibold, `tracking-[-0.02em]` |
| Section title (`<h2>`) | `styles.h2` | 24 → 28, semibold |
| Card or panel title (`<h3>`) | `styles.h3` | 16, semibold |
| Kicker (above a section title) | `styles.kicker` | 12, uppercase, `0.08em`, accent |
| Eyebrow (stat labels, table headers, rail headings) | `styles.eyebrow` | 11, uppercase, `0.06em`, `--dc-text-3` |
| Lead paragraph | `styles.lead` | 16, `--dc-text-2` |
| Body | `styles.body` | 15, `leading-[1.65]`, `--dc-text-2` |
| Dense UI text (tables, lists, controls) | inline | 13–14 |
| Caption / fine print | `styles.caption` | 12, `--dc-text-3` |
| Form label | `styles.label` | 13, semibold, `--dc-text-2` |

**Metrics** (big numbers in stat tiles) use `styles.num`, semibold, `tracking-tight`, `leading-none`:

| Metric | Size |
|---|---|
| Headline result | 56 → 64 |
| Primary stat | 36 (28 when compact) |
| Secondary stat | 24 (20 when compact) |

Weights: `font-medium` (500) and `font-semibold` (600) only. Avoid `font-bold`.

Line length: body copy is capped at `max-w-[80ch]` (`SectionHeader` does this).

---

## 5. Layout and spacing

- **Page width:** `styles.container`, which is 1440px max with 16/24px gutters. Every band on a page uses it, so edges line up from header to footer. Don't write `mx-auto max-w-[…] px-…` by hand.
- **Bands:** a page is a stack of full-width bands, each holding a `container`. Separate bands with `border-t border-[var(--dc-border)]`. Alternate between `--dc-bg` (working area) and `--dc-surface` (reference material: notes, rulings, FAQ, guides) to group content.
- **Vertical rhythm:** band padding is `py-12 sm:py-16`. Sections inside a band are spaced `gap-14 sm:gap-20`. Inside a section, the header and its content are `gap-6`. Inside a card, `p-5` (or `p-5 sm:p-6` for large cards).
- **Spacing steps:** Tailwind's 4px scale. Stick to 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20.
- **Grids:** main + rail is `lg:grid-cols-[minmax(0,1fr)_320px]` (or `360px`). Always use `minmax(0,…)` and `min-w-0` so long codes and tables can't blow out the layout.
- **Anchors:** every section with an `id` gets `scroll-mt-6`.

### Radius scale

| Radius | Use |
|---|---|
| `rounded` (4px) | Chips, badges, code pills, total tints, small inner elements |
| `rounded-[6px]` | Buttons, inputs, nav items, icon tiles, menu items, row-level links |
| `rounded-[8px]` | Cards, panels, callouts, tables, modals |
| `rounded-full` | Avatars, dots, step numbers, pills that are explicitly round |

Nothing else (`rounded-md`, `rounded-xl`, `rounded-2xl`, `rounded-[10px]`, `rounded-[5px]`).

---

## 6. Primitives (CSS classes in `theme.module.css`)

| Class | What it is |
|---|---|
| `root` | Opts a subtree into the tokens |
| `embedded` | With `root`, keeps the host page's background |
| `container` | Page-width wrapper |
| `card` | Surface, 1px border, 8px radius, resting shadow |
| `callout` | Accent-tinted flat panel, for a CTA or one section that should stand out. No more than one or two per page |
| `h2`, `h3`, `kicker`, `eyebrow`, `lead`, `body`, `caption`, `label` | Type roles (see §4) |
| `num` | Tabular figures |
| `button` | Secondary button (surface, strong border) |
| `buttonPrimary` | Primary button (accent fill). **One per region** |
| `buttonLg` | Size modifier for a page-level CTA: `${styles.buttonPrimary} ${styles.buttonLg}` |
| `link` | Inline text link |
| `input` | Text input, select, combobox shell |
| `segmented` + `segment` + `segmentActive` | Segmented control. Add `segmentedSm` / `segmentSm` for the 32px size in panel headers |
| `checkbox` | Checkbox |
| `skeleton` | Loading placeholder |

**Don't override a primitive with `!important` utilities** (`!h-11`, `!text-[15px]`, `!p-0`). If you need a variant more than once, add a modifier class next to the primitive (as `buttonLg` and `segmentedSm` are) and document it here.

Layout utilities (margin, flex, grid, width) next to a primitive class are fine: `${styles.card} p-5 flex flex-col gap-3`.

---

## 7. Components (React, in `components/ui/`)

| Component | Use |
|---|---|
| `<SectionHeader kicker title titleId? className?>lead</SectionHeader>` | The top of every page section. Don't hand-roll kicker + `<h2>` + `<p>` |
| `<FaqList faqs openFirst? />` | FAQ disclosures. The text must match the page's `FAQPage` JSON-LD |
| `heat(pct)` | Background tint for a duty total |

Feature-level building blocks that already follow the system and should be reused before writing new ones:

- `duty-calculator/controls.tsx`: `Field`, `NumberField`, `Segmented`
- `duty-calculator/shared.tsx`: `ShareButtons`, `DateNotice` (warning notice pattern), `Disclaimer`
- `duty-calculator/MoneyBreakdown.tsx`: stacked cost bar + legend
- `hts-page/DutyByCountry.tsx`: the canonical data table (see §8)

When one of these is needed by a second feature, move it to `components/ui/` (§10).

---

## 8. Patterns

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

A `card` with `overflow-hidden`. The header row is `px-4 pt-3.5 pb-3 border-b border-[var(--dc-border)]` holding an `h3` and an optional `caption`. Action controls (`segmentedSm`, a `button`) sit at the right of the header. Footer rows are `border-t … bg-[var(--dc-surface-2)]`.

### Stat tiles

Labels use `eyebrow`, values use metric sizes with `num`, and notes use 12–13px `--dc-text-3`. For a row of stats inside one card, use a 1px-gap grid over `bg-[var(--dc-border)]`, so dividers draw themselves at every breakpoint (see `Results.tsx` and `MicroCalculator.tsx`).

### Data tables

- Inside a `card overflow-hidden`, wrapped in `overflow-x-auto`.
- `<table className={`w-full text-[14px] ${styles.num}`}>`
- Header row: `className={`${styles.eyebrow} text-left bg-[var(--dc-surface-2)]`}`, cells `px-4 py-3` (first and last `px-5 sm:px-6`).
- Body rows: `border-t border-[var(--dc-border)]`, `hover:bg-[var(--dc-surface-2)]/60`.
- The row's subject is a `<th scope="row">`. Numbers are right-aligned. Codes are mono at 11–13px in `--dc-text-3`.
- A footer for sources and the CTA goes in `border-t bg-[var(--dc-surface-2)]`.

### Code chips and badges

- HTS code as a link: mono, semibold, accent.
- Program or code pill: mono, `rounded`, `border border-[var(--dc-border)] bg-[var(--dc-surface-2)] px-1 py-px text-[11px] text-[var(--dc-text-2)]`.
- Status badge: `rounded px-1.5 py-0.5 text-[11px] font-semibold`, using the status color on its `-soft` background.

### Notices

Warning: `rounded-[6px] border border-[var(--dc-warning-border)] bg-[var(--dc-warning-soft)] px-4 py-3.5`, with an icon and text in `--dc-warning`. See `DateNotice`. Errors and success use the same shape with `negative` and `positive`.

### Calls to action

- **Inline:** a `link` with an arrow icon.
- **In a region:** one `buttonPrimary`, plus at most one `button` next to it.
- **Page-level:** a `callout` (or `card`) holding a `SectionHeader` and a `buttonPrimary buttonLg`.
- Never use a solid accent-filled block as a banner. It's too loud in dark mode, where the accent is light.

### Charts

Follow the `dataviz` skill. Use `chart-*` for parts of a whole and `series-*` for compared entities. Gridlines use `--dc-border`, axis labels are 11–12px `--dc-text-3`, and tooltips are floating (`--dc-shadow-pop`). Every chart gets a caption (`h3` + `caption`) that says what it shows.

### Interaction states

- **Hover:** row or tile, `hover:bg-[var(--dc-surface-2)]` or `hover:bg-[var(--dc-accent-soft)]`. Card links get `hover:border-[var(--dc-accent-border)]`. Icons go from `--dc-text-3` to accent on `group-hover`.
- **Focus:** always visible. Use `focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)]` (the primitives already do this).
- **Motion:** `transition-colors` at about 120ms. No translate or scale on hover. Respect `prefers-reduced-motion`.
- **Loading:** `styles.skeleton` blocks that have the final layout's shape. No spinners for page content.

### Don't

- Glows, radial or linear gradients, `blur-*`, `backdrop-blur`, or decorative blobs
- `shadow-pop` on anything that doesn't float
- Solid accent-filled panels or banners
- Emoji or icons as decoration (flags next to country names are data, so they're fine)
- Opacity for text hierarchy
- More than one primary button per region
- Centered body text (except short empty states)

---

## 9. Light and dark mode

- The site sets `<html data-theme="light|dark">` from the header toggle, or from the OS until the user picks one. The tokens follow it automatically. Components never check the theme.
- Because the dark accent is light (`#8ea6ff`), text on an accent fill must use `--dc-accent-contrast`, never white.
- Soft fills in dark mode are translucent (`rgba(…, 0.1)`), so they work on any surface. Don't stack two soft fills.
- Before you ship, check both themes with `html[data-theme]` set each way. Look at contrast, borders that disappear, and anything that looks "lit up".

---

## 10. Component and file rules

### Creating a component

1. **Search first.** Check `components/ui/` and the feature folders listed in §7. Extend what exists before you add something new.
2. **Where it goes:** used by one feature, it lives in `components/<feature>/`. Used by two or more, it lives in `components/ui/`. Promote it when a second user appears, not before.
3. **One component per file** for anything exported and reused. Small private helpers (`Chevron`, `RateRow`) can live below the main component in the same file.
4. **File names:** components in `PascalCase.tsx`, matching the export (`SectionHeader.tsx` exports `SectionHeader`). Hooks are `useThing.ts`. Pure helpers are `camelCase.ts` (`format.ts`, `heat.ts`).
5. **Named exports** for components (`export function SectionHeader`). Default exports only where Next.js requires them (`page.tsx`, `layout.tsx`).
6. **Server first.** Leave out `"use client"` unless the component uses state, effects, or browser APIs. Keep SEO content (rates, explanations, FAQs) server-rendered.
7. **Props:** type them inline or with a local `type Props`. Pass data, not class names. A `className` prop is only for layout (margin, grid placement) from the parent.
8. **Size:** if a file grows past about 400 lines or holds more than one screen-level concern, split it by concern (see `duty-calculator/`). `Results.tsx`, `RateHistory.tsx` and `HtsCodePageContent.tsx` are already candidates.

### Styling rules

- Tokens, primitives and `ui/` components first. Tailwind utilities for layout and one-off spacing.
- No new CSS files per component. If a pattern needs real CSS (pseudo-elements, keyframes, many states), add a primitive to `components/ui/theme.module.css` and document it in §6.
- No inline `style={{}}` except for values computed at runtime (chart geometry, `heat()`, series colors).
- No hex or `rgb()` in TSX. No Tailwind palette colors. No DaisyUI classes on system pages.
- Arbitrary values must come from the scales: type (§4), radius (§5), and Tailwind's spacing steps.
- Don't duplicate class strings across files. If the same 4+ utilities appear in two places, make a primitive or a component.

### Code cleanliness

- **Comments say why, not what.** One short line above a non-obvious block (`// 1px gaps over the border color draw the dividers at every breakpoint`). Match the plain, sentence-case style of the existing files.
- **Delete, don't comment out.** Git keeps history. Commented-out JSX blocks (as still exist in `Hero.tsx` and `TariffGuide.tsx`) should be removed during the redesign, unless they're a deliberate, dated "coming back" with a reason.
- **No unused imports or variables.** `npx eslint <files>` should be clean for every file you touch.
- **Types:** no `any`. Derive types from data (`HtsDutySummary["rows"][number]`) instead of re-declaring them.
- **Keep logic out of JSX.** Compute values above the `return`. Put formatting in `format.ts`, data shaping in `libs/`, and keep components presentational where you can.
- **Accessibility:** use real elements (`<button>`, `<a>`, `<table>`, `<th scope>`), give icon-only controls an `aria-label`, mark decorative icons `aria-hidden`, use `role="radiogroup"` for segmented controls, and add `aria-live` where results update.
- **Naming:** say what something is in domain terms (`DutyByCountry`, `BaseRates`), not in visual terms (`BlueBox`, `TopCard`).
- Run `npx tsc --noEmit` and `npx eslint` on touched files before committing.

---

## 11. Rolling this out to the rest of the app

About 220 files still use DaisyUI semantic classes. Migrate them page by page, not with a global swap.

**Order:** start with public, SEO-facing pages, which carry the most traffic and are the most visible. That means `/section/[n]` and `/chapter/[n]` (`HtsPageShell`, `ChildrenList`, `CtaGrid`, `hts-page/PlaybookBanner`), then `/explore`, then the marketing pages, then the signed-in app (classify, classifications, tariffs, settings).

**For each page:**

1. Add `styles.root` to the page wrapper and replace the hand-written widths with `styles.container`.
2. Replace DaisyUI classes using the map below.
3. Replace headers with `SectionHeader`, panels with `card`/`callout`, and buttons with the button primitives.
4. Remove glows, gradients, blur and `shadow-pop` on static elements.
5. Check type sizes and radii against the scales.
6. Check light and dark at 1440px and at 375px.
7. Shared components that are also rendered on legacy pages (for example, `cross-rulings/*`, `Explore`) can't switch until every host page is on the system. Until then, branch on a prop, as `RelatedCrossRulingsSection`'s `bare` mode does, or migrate the hosts together.

**DaisyUI to tokens:**

| DaisyUI | System |
|---|---|
| `bg-base-100` | `bg-[var(--dc-surface)]` (or `--dc-bg` for the page) |
| `bg-base-200` / `base-300` | `bg-[var(--dc-surface-2)]` / `bg-[var(--dc-surface-3)]` |
| `text-base-content` | `text-[var(--dc-text)]` |
| `text-base-content/60–80` | `text-[var(--dc-text-2)]` |
| `text-base-content/30–50` | `text-[var(--dc-text-3)]` |
| `border-base-content/10`, `border-base-300` | `border-[var(--dc-border)]` |
| `text-primary`, `bg-primary` | `--dc-accent` tokens |
| `btn btn-primary` | `styles.buttonPrimary` |
| `btn`, `btn-outline`, `btn-ghost` | `styles.button` (ghost: a `rounded-[6px]` hover row) |
| `card`, `card-body` | `styles.card` + `p-5` |
| `badge` | Code pill or status badge (§8) |
| `alert-warning` / `-error` / `-success` | Notice pattern (§8) |
| `input input-bordered`, `select` | `styles.input` |
| `tabs`, `join` | `styles.segmented` |
| `loading loading-spinner` | `styles.skeleton` placeholders |
| `text-error` / `text-success` / `text-warning` | `--dc-negative` / `--dc-positive` / `--dc-warning` |

**When most pages are on the system:** move the token blocks from `theme.module.css` into `app/globals.css` under `:root` / `[data-theme="dark"]`, so `.root` isn't needed. Consider exposing them as Tailwind theme colors (`bg-surface`, `text-ink-2`) to shorten class names. Then remove DaisyUI.

---

## 12. Review checklist

Before you merge UI work:

- [ ] Only tokens: no hex, `rgb()`, Tailwind palette colors or DaisyUI classes
- [ ] Type sizes on the scale, no half pixels; codes in mono; numbers have `num`
- [ ] Radii on the scale; `shadow-pop` only on floating elements
- [ ] No glows, gradients, blur, or accent-filled banners
- [ ] Sections use `SectionHeader`; bands use `container`
- [ ] At most one primary button per region
- [ ] Looks right in light and dark, at 1440px and 375px
- [ ] Focus is visible; icon buttons have labels; tables use `<th>`
- [ ] New shared pieces live in `components/ui/` and are listed in this doc
- [ ] `npx tsc --noEmit` and `npx eslint` are clean for touched files
