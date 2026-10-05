# HTS Hero Design System

This is the reference for HTS Hero's analytical UI. `/duty-calculator` and `/hts/[code]` are the reference pages: they follow every rule here. Use this doc for any new page and for the app-wide redesign.

The look is **clean, professional and analytical**. It should feel like a financial terminal or a well-made report, not a marketing site. Data is the hero. Decoration is not.

**Every design decision lives in code, in one place:** `components/ui/`. This doc explains those decisions. When the two disagree, fix one of them in the same change.

---

## 0. Quick start

```tsx
import * as ui from "@/components/ui/styles";        // class names: type, buttons, forms, surfaces, layout
import { THEME, CHART_COLORS } from "@/components/ui/theme"; // theme class and chart colors
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function Page() {
  return (
    <main className={`${THEME} min-h-screen`}>
      <div className={`${ui.container} ${ui.bandPadding}`}>
        <section className={ui.section}>
          <SectionHeader kicker="Duty by country" title="US Import Duty on HTS 6110.20.20">
            One or two sentences on what's here.
          </SectionHeader>
          <div className={`${ui.card} p-5`}>
            <h3 className={ui.cardTitle}>Total duty</h3>
            <p className={ui.metric.primary}>36.5%</p>
            <button className={ui.button({ variant: "primary" })}>Calculate</button>
          </div>
        </section>
      </div>
    </main>
  );
}
```

Before you write a class string, check whether `ui.*` already has it. Before you write a component, check `components/ui/` and §8.

---

## 1. Principles

1. **One source for every decision.** Colors come from `components/ui/theme/palette.js`. Type, buttons, forms, surfaces and layout come from `components/ui/styles/`. Shared components come from `components/ui/`. A component never invents its own color, type size or control style.
2. **Built-ins underneath.** The `ui` helpers are plain Tailwind on the theme's semantic colors. Where you need layout or spacing beyond them, use Tailwind's scales (`p-4`, `gap-6`, `rounded-lg`). Exact values (`text-[13px]`) only per §10.
3. **Data first.** Numbers, codes and rates are the content. Chrome, color and motion are there to help someone read them.
4. **Flat and quiet.** Surfaces are separated by 1px borders and small changes in tone. No glows, gradients or blur, and no tinted panels: a panel is always a card (`base-100`) on the gray page (`base-200`), so it stands out instead of blending in.
5. **Color means something.** Navy is for actions and the one key figure in a region. Green means savings or exemptions, orange a caveat, red an error or an increase. Everything else is neutral.
6. **Both themes, always.** Semantic colors switch with light and dark. If something only looks right in one theme, it's a bug.
7. **Desktop first.** About 99% of traffic is desktop. Design at 1440px, then make sure it degrades cleanly to a 375px phone with no horizontal page scroll.

---

## 2. Where everything lives

```
components/ui/                     ← the design system: the only place design decisions live
  theme/
    palette.js                     ← EVERY color, light and dark, with roles and contrast notes
    plugin.js                      ← Tailwind plugin: applies the palette inside .hts-theme
    index.ts                       ← THEME, THEME_EMBEDDED, CHART_COLORS, FEES_COLOR, SERIES_COLORS, heat()…
  styles/
    index.ts                       ← import * as ui from "@/components/ui/styles"
    typography.ts                  ← display, pageTitle, sectionTitle, cardTitle, kicker, label, body, caption, metric…
    buttons.ts                     ← button({ variant, size, icon }), link
    forms.ts                       ← input, inputSm, inputBox, select, selectSm, textarea, checkbox
    surfaces.ts                    ← card, cardHeader, cardFooter, badge(), notice(), popover, tooltip, skeleton
    layout.ts                      ← container, band, bandPadding, section
  charts/
    StackedBar.tsx                 ← parts of a whole as one bar + legend
  SectionHeader.tsx                ← kicker + <h2> + lead: the top of every section
  SegmentedControl.tsx             ← toggle between options
  FaqList.tsx                      ← FAQ disclosures
  font.ts                          ← mono (IBM Plex Mono) for codes

components/<feature>/              ← a feature: one folder per area, one component per file
  <area>/
    ComponentName.tsx              ← one exported component, named like the file
    helperName.ts                  ← logic, constants and types for that area
    index.ts                       ← what the rest of the app may import from this area
  lib/                             ← the feature's logic: hooks, calculations, formatting
```

The reference features:

| Folder | What it is |
|---|---|
| `components/duty-calculator/calculator/` | The calculator page: layout, entry rail, results header, empty state, tool tabs |
| `components/duty-calculator/results/` | Results: summary stats, statement, simple summary, questions, comparison, cost bar |
| `components/duty-calculator/fields/` | Calculator inputs: `Field`, `NumberField`, `Segmented`, `CountryField`, `HtsCodeField` |
| `components/duty-calculator/rate-history/` | The "Duty Over Time" chart and timeline |
| `components/duty-calculator/country-rate-charts/` | Rates-by-country charts and table |
| `components/duty-calculator/guide/` | The tariff guide under the calculator (and its FAQ content) |
| `components/duty-calculator/hero/`, `changelog/`, `notices/`, `referenced-notes/` | Hero, changelog, date notices, cited legal notes |
| `components/duty-calculator/embed/` | The duty estimate embedded in classification and explorer pages |
| `components/duty-calculator/lib/` | `useTariffFinder`, `estimate`, `questions`, `format` |
| `components/hts-code-page/` | The `/hts/[code]` page |
| `components/tariff-watcher/` | The Tariff Watcher tool |

---

## 3. Color

### The palette

All values live in `components/ui/theme/palette.js`. That file is the only place a hex value may appear. Components use the semantic classes below, or the exports of `components/ui/theme`.

| Role | Class name | Light | Dark | Use |
|---|---|---|---|---|
| Primary | `primary` | Navy `#1b3a8c` | Blue `#6b9bff` | Buttons, links, selection, focus, the key figure or code in a region |
| Secondary | `secondary` | Teal green `#167a6f` | `#4cc3a8` | Second data series. Rarely for UI |
| Accent | `accent` | Orange `#b45f1d` | `#f0a860` | Third data series. Sparingly |
| Neutral | `neutral` | Slate `#1e293b` | `#2a313c` | Dark chrome (the promo bar) |
| Success | `success` | `#0b7045` | `#5bd79c` | Savings, exemptions, "Free", a lower rate |
| Warning | `warning` | `#b45309` | `#f3c56b` | Unverified data, caveats, "not included" |
| Error | `error` | `#b42318` | `#ff8f8a` | Errors, revoked rulings, a higher rate |
| Info | `info` | `#2563eb` | `#60a5fa` | Rarely; prefer a `primary` notice |
| Page | `base-200` | `#f5f6f8` | `#0d1117` | Page background, table header rows, card footers |
| Surface | `base-100` | `#ffffff` | `#151a22` | Cards, panels, the header |
| Line | `base-300` | `#e3e6eb` | `#2a313c` | Borders and dividers |
| Text | `base-content` | `#0f172a` | `#e6e9ef` | Text, at three strengths (below) |

**No purple or pink anywhere**, including charts. daisyUI's default purple primary and pink secondary are retired.

**Why dark mode uses different values:** navy is 10:1 against white but only 1.8:1 against the dark page, which is unreadable. In dark mode the primary becomes a lighter blue from the same family (6.5:1). The other hues are brightened the same way. Every text color meets WCAG AA on `base-100` and `base-200` in its theme.

### Text strength

Use three steps of `base-content` only. The `ui` type roles already apply them.

| Class | Use |
|---|---|
| `text-base-content` | Headings, numbers, primary values |
| `text-base-content/70` | Body copy, table cells, labels |
| `text-base-content/60` | Captions, hints, metadata, icons at rest. **Never lighter for text.** |

### Tints

Tinted fills (`bg-primary/10`, `bg-success/10`, …) are only for **small** elements: badges, the selected row in a list, a highlighted table row, a step number. **Never** use them on a card, panel, section or banner. They wash the panel into the page. To flag a panel's meaning, put an icon in the status color next to its title, or use `ui.notice(tone)`.

### Chart colors

Charts need more fixed hues than the semantic set. Import them from `@/components/ui/theme`. Don't write `var(--chart-2)` in a component.

| Export | Use |
|---|---|
| `CHART_COLORS`, `BASE_DUTY_COLOR`, `PROGRAM_COLORS` | Parts of one whole, in order: base duty (navy), then each added program (orange, green, ochre, slate) |
| `FEES_COLOR` | Fees or "other", always last (gray) |
| `SERIES_COLORS` | Entities compared side by side (countries), assigned in slot order: blue, orange, green, yellow, slate |
| `PRIMARY_MARK`, `MUTED_MARK` | A mark in the primary color; marks that aren't selected |
| `heat(pct)` | Background behind a duty total in a table or list. Primary, darker as the total rises |

Keep a color tied to the same thing everywhere on a page: if China is `series-1` in one chart, it's `series-1` in the next. Chart colors go in `style` (an accepted exception, §10). The light chart orange is too light for text, so use it for fills only.

### Applying the theme

The plugin applies the palette inside the class `hts-theme`. Put `THEME` on a page's outermost element:

```tsx
import { THEME } from "@/components/ui/theme";
<main className={`${THEME} w-full flex-1 flex flex-col`}>…</main>
```

For a themed component embedded in a page that isn't themed yet, use `THEME_EMBEDDED`, which keeps the host page's background.

### Changing or adding a color

1. Edit `components/ui/theme/palette.js`, changing light and dark together.
2. Check contrast: text colors need 4.5:1 on `base-100` and `base-200`; chart fills need 3:1.
3. If it's a chart color, export it by role from `components/ui/theme/index.ts`.
4. Update the table above.

### daisyUI's role

daisyUI is used **only as the color engine**. It turns the palette into the semantic classes (`bg-base-100`, `text-primary`, `border-base-300`, `text-success`, with `/opacity`) that switch with the theme. Its component classes (`btn`, `join`, `input`, `select`, `checkbox`, `badge`, `link`, `collapse`, `alert`, `stats`, `tabs`, `table`, `skeleton`, …) are **not used** on themed pages. In v4 only colors, radii and border width are themeable. Their shapes and states are fixed and can't reach this look without fighting them. `components/ui/` replaces them.

---

## 4. Type (`ui/styles/typography.ts`)

Use a role, not a size. Each role is a class string on Tailwind's type scale.

| Role | Helper | What it is |
|---|---|---|
| Hero headline (one per site page) | `ui.display` | `text-4xl sm:text-5xl lg:text-6xl`, semibold, tight |
| Page title | `ui.pageTitle` | `text-3xl lg:text-4xl`, semibold, tight |
| Section title (`<h2>`) | `ui.sectionTitle` | `text-2xl sm:text-3xl` (use `SectionHeader`) |
| Card or panel title (`<h3>`) | `ui.cardTitle` | `text-base`, semibold |
| Kicker (above a section title) | `ui.kicker` | `text-xs`, uppercase, wide tracking, primary |
| Label (stats, table headers, rails) | `ui.label` | `text-xs`, uppercase, wide tracking, `/60` |
| Form field label | `ui.fieldLabel` | `text-sm`, semibold, `/70` |
| Lead paragraph | `ui.lead` | `text-lg`, relaxed, `/70` |
| Body | `ui.body` | `text-base`, relaxed, `/70` |
| Dense text (cards, lists) | `ui.bodySm` | `text-sm`, snug, `/70` |
| Caption, fine print | `ui.caption` | `text-xs`, `/60` |
| Headline result | `ui.metric.hero` | `text-5xl sm:text-6xl`, tabular |
| Primary stat | `ui.metric.primary` / `primaryCompact` | `text-4xl` / `text-3xl`, tabular |
| Secondary stat | `ui.metric.secondary` / `secondaryCompact` | `text-2xl` / `text-xl`, tabular |

Other rules:
- Table cells and controls are `text-sm`.
- Add `tabular-nums` to any number in a column or a value that changes as the user types.
- Codes (HTS, Chapter 99 headings, program codes) are always `mono.className`, so digits and dots line up.
- Use only `font-medium` and `font-semibold`.
- Cap body copy at `max-w-prose`, or `max-w-3xl` for a lead.

---

## 5. Layout (`ui/styles/layout.ts`)

- **Page width:** `ui.container` (`max-w-screen-2xl`, gutters 16/24/32px). Every band uses it, so edges line up from header to footer.
- **Bands:** a page is a stack of full-width bands, all on the page background. After the first, each is `ui.band` (a top border) with `ui.bandPadding` inside. Don't give a band a `bg-base-100` fill, or its cards will blend in.
- **Sections:** `<section className={ui.section}>` (`flex-col gap-6` with `scroll-mt-6`), starting with `SectionHeader`. Sections in a band are `gap-16 sm:gap-20` apart.
- **Spacing:** use Tailwind's scale, preferring 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20. Card padding is `p-5` (`p-6` when large).
- **Grids:** main + rail is `lg:grid-cols-[minmax(0,1fr)_20rem]`. Always use `minmax(0,…)` and `min-w-0`, so long codes and tables can't blow out the layout.
- **Radius:** `rounded` for chips and badges, `rounded-md` for buttons, inputs and rows, `rounded-lg` for cards and popovers, `rounded-full` for dots.
- **Shadow:** `shadow-sm` on resting cards (in `ui.card`). `shadow-lg` only on floating things (`ui.popover`, `ui.tooltip`, modals).

---

## 6. Controls and surfaces

All of these are class helpers from `ui/styles`. They're strings and functions rather than components, so the same look applies to a `<button>`, a `<Link>`, an `<a>` or an `<input>`, in server and client components. Add layout classes next to them; never override their colors or sizes.

| Need | Use |
|---|---|
| Primary button (**one per region**) | `ui.button({ variant: "primary" })` |
| Secondary button | `ui.button()` |
| Quiet button (nav, dismiss) | `ui.button({ variant: "ghost" })` |
| Icon-only button | `ui.button({ variant: "ghost", size: "sm", icon: true })` + `aria-label` |
| Button sizes | `sm` (h-8) in toolbars and card headers; `md` (h-9) by default; `lg` (h-11) for a page's main call to action |
| Inline link | `ui.link` |
| Text input | `ui.input` (h-10); `ui.inputSm` (h-8); `ui.inputBox` for chip inputs that wrap |
| Multi-line text | `ui.textarea` (add `min-h-*` for taller) |
| Select | `ui.select` / `ui.selectSm` |
| Checkbox | `ui.checkbox` (native, primary accent) |
| Toggle between options | `<SegmentedControl label options value onChange size? fullWidth? />` |
| Card or panel | `ui.card`, with `ui.cardHeader` (title row) and `ui.cardFooter` (sources, CTA). It clips its contents to its rounded corners |
| Card holding a dropdown | `ui.cardOverflowVisible`, so the dropdown can extend past the card. Anything inside with a background that reaches a corner must round itself (`rounded-t-lg` / `rounded-b-lg`) |
| Badge | `ui.badge("neutral" \| "primary" \| "success" \| "warning" \| "error")` |
| Notice (caveat, unverified data, error) | `ui.notice("warning" \| "error" \| "success" \| "primary")`: a card with a colored left rule; icon in the tone's color, text in `base-content` |
| Dropdown, combobox list, menu | `ui.popover`, positioned by the caller |
| Floating label on a chart | `ui.tooltip`, positioned by the caller |
| Loading | `ui.skeleton` blocks in the final layout's shape |

Behavior-heavy controls (comboboxes, menus, dialogs) use Headless UI, which is already a dependency. Style them with these helpers; see `CountryField` and `tariff-watcher/ExportMenu`.

---

## 7. Patterns

### Section

```tsx
<section id="rulings" className={ui.section}>
  <SectionHeader kicker="CBP rulings" title={`Related CROSS Rulings for HTS ${htsno}`}>
    One or two sentences that say what's here and why it matters.
  </SectionHeader>
  {/* content */}
</section>
```

For reference sections (FAQ, notes), put the header in a left column: `grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12`, with the header `lg:sticky lg:top-6 lg:self-start`.

### Corners

A rounded box's corners must never be cut off. When a header, table row, stat grid or footer inside a card has its own background, its square corners paint over the card's rounded border and the corner looks clipped. So:

- Every panel is `ui.card`, which clips its contents (`overflow-hidden`). Don't hand-roll `rounded-lg border bg-base-100` panels.
- Only a card that holds a dropdown uses `ui.cardOverflowVisible`. Then any child with a background that touches a corner rounds itself to match (`rounded-t-lg`, `rounded-b-lg`).
- Nested rounded boxes (a badge in a cell, a chip in a row) round themselves and don't touch the parent's corners.

### Card with a header

`ui.card` with `overflow-hidden`. The title row is `ui.cardHeader`, holding an `<h3 className={ui.cardTitle}>` and an optional `ui.caption`. Controls (a `SegmentedControl` with `size="sm"`, a `sm` button) sit at its right. The footer is `ui.cardFooter`.

### Data table

- A plain `<table className="w-full text-sm tabular-nums">` inside `ui.card` with `overflow-hidden`, wrapped in `overflow-x-auto`. See `hts-code-page/DutyByCountry.tsx`.
- Header row: `ui.label` on `bg-base-200`.
- Body rows: `border-t border-base-300 hover:bg-base-200/60`. Cells are `px-4 py-3`, with `px-5 sm:px-6` on the first and last.
- The row's subject is a `<th scope="row">`. Numbers are right-aligned. Codes are mono, `text-xs text-base-content/60`.
- Totals get `heat()`, not status colors.

### Stat row in a card

A grid with `gap-px bg-base-300` and `bg-base-100` cells, so 1px dividers draw themselves at every breakpoint (see `results/SummaryStats.tsx`). Labels use `ui.label`; values use `ui.metric.*`.

### Parts of a whole

Use `<StackedBar parts formatValue size? highlight? onHighlight? />` from `components/ui/charts`, with colors from `CHART_COLORS` and `FEES_COLOR`. Base duty first, programs in order, fees last.

### Calls to action

- **Inline:** `ui.link` with an arrow icon.
- **In a region:** one primary button, plus at most one secondary.
- **Page-level:** a `ui.card` holding a `SectionHeader` and a `lg` primary button. Position, heading and the navy button make it stand out, not a tinted fill.

### Interaction

- **Hover:** rows `hover:bg-base-200`, card links `hover:border-primary/40`, icons `text-base-content/60` → `group-hover:text-primary`.
- **Focus:** always visible. The `ui` helpers include a focus ring; custom elements get `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`.
- **Motion:** `transition-colors` (or `transition-opacity`) only. No translate or scale on hover.

### Don't

- Hex, `rgb()`, `var(--…)` color literals or Tailwind palette colors (`text-gray-500`) in a component
- Purple or pink
- Glows, gradients, `blur-*`, decorative shapes
- Tinted or solid-primary panels and banners; a `bg-base-100` band holding cards
- daisyUI component classes on themed pages
- `!important` utilities (`!h-11`) or overriding a `ui` helper's colors or sizes
- Text lighter than `/60`; more than one primary button per region
- `shadow-md` or larger on anything that doesn't float
- A hand-rolled panel (`rounded-lg border bg-base-100 …`) instead of `ui.card`, or a child that paints square corners over a card's rounded ones
- Emoji or icons as decoration (flags next to country names are data, so they're fine)

---

## 8. Shared components (`components/ui/`)

| Component | Use |
|---|---|
| `<SectionHeader kicker title titleId? className?>lead</SectionHeader>` | The top of every page section |
| `<SegmentedControl label options value onChange size? fullWidth? />` | Toggle between a few options (views, units, detail levels) |
| `<FaqList faqs openFirst? />` | FAQ disclosures. Text must match the page's `FAQPage` JSON-LD |
| `<StackedBar parts formatValue size? highlight? onHighlight? />` | Parts of a whole as one bar plus legend |

Feature building blocks worth reusing before writing new ones:
- `duty-calculator/fields/` (`Field`, `NumberField`, `Segmented`, `CountryField`, `HtsCodeField`)
- `duty-calculator/notices/` (`DateNotice`, `VerifiedNotice`)
- `duty-calculator/results/SummaryStats`
- `hts-code-page/DutyByCountry` (the reference data table)

When one of these is needed outside its feature, move it to `components/ui/` first.

---

## 9. Light and dark mode

- The site sets `<html data-theme="light|dark">` from the header toggle, or from the OS until the user picks one. The plugin follows it. Components never check the theme.
- Text on a `primary` fill uses `text-primary-content`, never `text-white`: in dark mode the primary is light and its content is dark.
- Before you ship, check both themes. Look at contrast, borders that disappear, and anything that looks "lit up".

---

## 10. Accepted exceptions

These are the only places exact values or inline styles are expected. Keep a short comment on each saying why.

1. **Chart colors and runtime values in `style`:** bar widths, chart geometry, `heat()`, chart and series colors (always imported from `@/components/ui/theme`), and highlight opacity.
2. **Mono font:** `mono.className` from `components/ui/font.ts`.
3. **Grid templates:** `grid-cols-[minmax(0,1fr)_20rem]` and similar. Tailwind has no built-in for "fluid + fixed rail". Use rem, not px.
4. **A width a design depends on** (a dropdown's `min-w-64`, an axis label column). Use a Tailwind step if one exists, otherwise rem.
5. **Legacy hosts:** `ExploreModal` keeps daisyUI's `modal` around the legacy Explore component, and `RelatedCrossRulingsSection` keeps daisyUI in its non-`bare` branch for the explorer. Both change when those pages migrate.

If you need the same exception twice, it should probably be a helper or a component in `components/ui/`.

---

## 11. Component and file rules

### Where code goes

1. **Search first.** Check `components/ui/` (§2, §6, §8) and the feature's folders. Extend what exists before you add something new.
2. **Design decisions go in `components/ui/`.** A new color goes in `theme/palette.js` (and `theme/index.ts` if a component needs it by role). A new type role or control style goes in the matching `styles/*.ts` file. A component that more than one feature needs goes in `components/ui/`. Then add it to this doc.
3. **Features are folders of areas.** `components/<feature>/<area>/`, named in kebab-case for what the area is (`rate-history`, `country-rate-charts`). Logic shared across a feature's areas goes in `components/<feature>/lib/`.
4. **Never import from another feature's internals.** Import from its `index.ts`, or move the shared piece to `components/ui/` (or `libs/` for non-UI logic).

### Files

1. **One exported component per file**, named exactly like the file (`SummaryStats.tsx` exports `SummaryStats`). A tiny private sub-component (under ~25 lines) used only by that component may stay in its file. Anything bigger or shared gets its own file.
2. **Names:** components in `PascalCase.tsx`. Hooks `useThing.ts`. Logic, constants and types in `camelCase.ts` (`slices.ts`, `chartGeometry.ts`, `types.ts`). macOS is case-insensitive, so never give a `.ts` file and a `.tsx` file in the same folder names that differ only in case (`emptyState.ts` vs `EmptyState.tsx`). Name the helper for what it holds (`emptyStateCopy.ts`).
3. **`index.ts` per area** exports only what's used outside the area. Inside an area, import files directly (`./StatementRow`), not through its own `index.ts`, to avoid cycles.
4. **Imports:** use `@/components/ui/...` for the design system and `@/` for anything outside the feature. Use relative paths inside a feature.
5. **Named exports** for components. Default exports only where Next.js requires them (`page.tsx`, `layout.tsx`).
6. **Server first.** Leave out `"use client"` unless the file uses state, effects or event handlers. Keep SEO content (rates, explanations, FAQs) server-rendered.
7. **Props:** pass data, not class names. A `className` prop is only for layout (margin, padding, grid placement) from the parent.
8. **Size:** split a file past about 300 lines, or one doing more than one job.

### Styling

- `ui.*` helpers and shared components first, then semantic color classes and Tailwind's scales for layout, then the exceptions in §10.
- No new CSS files, no `!important`, no inline `style` except runtime values (§10).
- If the same 4+ classes appear in two places, they're a missing `ui` helper or component.

### Code cleanliness

- **Comments say why, not what.** One short line above a non-obvious block, and a one-line comment at the top of a file whose purpose isn't obvious from its name. Match the plain, sentence-case style of the existing files.
- **Delete, don't comment out.** Git keeps history.
- **No unused imports, variables, props or files.** Lint clean on every file you touch.
- **No `any`.** Derive types from data (`HtsDutySummary["rows"][number]`).
- **Keep logic out of JSX.** Compute values above the `return`. Put pure logic in `camelCase.ts` files and state in hooks.
- **Accessibility:** use real elements (`<button>`, `<a>`, `<table>`, `<th scope>`), give icon-only controls an `aria-label`, mark decorative icons `aria-hidden`, and add `aria-live` where results update.
- **Naming:** say what something is in domain terms (`DutyByCountry`, `RateHistoryChart`), not visual terms (`BlueBox`).
- **Before committing:** run `npx tsc --noEmit`, `npx eslint` on touched files, and `npm run tests`.

---

## 12. Rolling this out to the rest of the app

About 220 files still use daisyUI component classes and its default purple theme.

1. **Migrate page by page.** Start with public SEO pages: `/section/[n]` and `/chapter/[n]` (`components/hts-page/`: `HtsPageShell`, `CtaGrid`, `ChildrenList`, `PlaybookBanner`), then `/explore`, then marketing pages, then the signed-in app. For each page:
   - Add `THEME` to the page wrapper.
   - Split it into areas and components per §11.
   - Swap daisyUI classes for `ui.*`:
     - `btn` → `ui.button`
     - `input` and `select` → `ui.input` and `ui.select`
     - `join` and `tabs` → `SegmentedControl`
     - `badge` → `ui.badge`
     - `alert` → `ui.notice`
     - `collapse` → `<details>` as in `FaqList`
     - `table` → the data table pattern
   - Replace `base-content/50`-style text with the three strengths.
   - Remove glows, gradients and tinted panels.
   - Check light and dark at 1440px and 375px.
2. **Promote the palette.** When most pages use `THEME`, make the palette the app's daisyUI `light` and `dark` themes in `tailwind.config.js` (the plugin's `convertColorFormat` output). Then drop `THEME` from pages and delete `theme/plugin.js`.
3. **Optionally drop daisyUI.** Once no page uses its component classes, it only provides color utilities. Define those as Tailwind theme colors on the same CSS variables, keeping the class names, and remove daisyUI.

---

## 13. Review checklist

- [ ] No hex, `rgb()`, `var(--…)` or palette colors in components; chart colors from `@/components/ui/theme`
- [ ] Type uses `ui.*` roles; controls and surfaces use `ui.*` helpers; no daisyUI component classes
- [ ] No tinted panels; cards are `ui.card` on the gray page; no glows, gradients or blur
- [ ] Every card's corners are intact: nothing inside paints square corners over them (check headers, table rows, stat grids and footers)
- [ ] Color only for meaning; text no lighter than `/60`; `tabular-nums` on numbers; codes in mono
- [ ] One exported component per file, named like the file; area folders with an `index.ts`; logic in `camelCase.ts` or `lib/`
- [ ] New design decisions added to `components/ui/` **and** this doc
- [ ] Looks right in light and dark, at 1440px and 375px
- [ ] Focus is visible; icon buttons have labels; tables use `<th>`
- [ ] `npx tsc --noEmit`, `npx eslint` and `npm run tests` are clean
