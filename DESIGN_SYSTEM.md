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
  Switch.tsx                       ← on/off for one setting
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
| `components/tariff-tracker/` | The Tariff Tracker app (`/tariff-tracker`) |

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

### Building charts

New charts are built from the shared kit, `@/components/ui/charts/kit`: `ChartFrame` (measured width, never a stretched viewBox), the scales (`linearScale`, `timeScale`, `bandScale`, `niceMax`, `stepIndexAt`), `ValueAxis` and `BottomAxis`, the marks (`StepLine`, `StepArea`, `Bar`, `GroupedBars`, `Dot`), the hover layer (`HitArea`, `Crosshair`, `Tooltip`, `TooltipRow`, `useHovered`) and `Legend`. The maths underneath is d3 (`d3-scale`, `d3-shape`, `d3-array`), wrapped by the kit, so charts never import d3 themselves. Rates that hold until a tariff changes them are always steps, never smoothed curves. Existing charts move onto the kit one at a time (Rate pulse first, Oct 2026); the maps (`WorldMap`, `LaneMap`) keep their own d3-geo code. Every tariff takes its color from `partColors` (`@/components/ui/charts/partColors`: base duty, then each program by its role, then fees), and every stacked bar is `StackedBar`. On server-rendered pages (marketing, SEO) give `ChartFrame` an `initialWidth`, so the chart is in the page's HTML before it's measured. Marketing visuals keep their own program palette (`PROGRAM`, §14), shared with the lanes map.

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
| Subsection title (`<h3>` in long-form writing) | `ui.subsectionTitle` | `text-xl`, semibold, tight |
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
| Turn one setting on or off, applied at once | `<Switch checked onChange label? labelledBy? />` |
| Card or panel | `ui.card`, with `ui.cardHeader` (title row) and `ui.cardFooter` (sources, CTA). It clips its contents to its rounded corners |
| Card holding a dropdown | `ui.cardOverflowVisible`, so the dropdown can extend past the card. Anything inside with a background that reaches a corner must round itself (`rounded-t-lg` / `rounded-b-lg`) |
| Badge | `ui.badge("neutral" \| "primary" \| "success" \| "warning" \| "error")` |
| Notice (caveat, unverified data, error) | `ui.notice("warning" \| "error" \| "success" \| "primary")`: a card with a colored left rule; icon in the tone's color, text in `base-content` |
| Dropdown, combobox list, menu | `ui.popover`, positioned by the caller |
| Floating label on a chart | `ui.tooltip`, positioned by the caller |
| Loading | `ui.skeleton` blocks in the final layout's shape |

Behavior-heavy controls (comboboxes, menus, dialogs) use Headless UI, which is already a dependency. Style them with these helpers; see `CountryField` and `tariff-tracker/ExportMenu`.

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

- Any table people sort, filter, search or pick rows in is built on `@/components/ui/table` (TanStack Table under the hood): `useDataTable({ data, columns, getRowId, searchText? })`, then `<DataTable table label onRowClick? empty? />`, with `TableSearch`, `FacetFilter` (one per filterable column, counts included), `FilterChips` and, for bulk actions, `selectColumn` plus `SelectionBar`. Columns describe themselves in `meta`: `align`, `width`, `rowHeader`, and `facet` (the filter's label and how each value reads). Sorting is by clicking a header; lists stay in their own order until then. Past 300 rows only the rows in view are drawn. The search, filters, count, chips and selection bar go in `DataTable`'s `toolbar`, inside the card over the rows they act on. Inside the Tracker every part restyles itself through `tracker:` (round panel, headers on `bg-tt-soft`, pill search and filter buttons, round chips); nothing is passed in. See `tariff-tracker/imports/ImportsTable.tsx`.
- `DataTable` draws the rules below. A small static table (no sorting, filtering or search) uses `Table` from `@/components/ui/table` (`Table`, `THead`, `TBody`, `Tr`, `Th`, `RowHeader`, `Td`), which draws the same rules and is fine in server components (import it from `@/components/ui/table/Table` there): `edge="flush"` on a card's own padding, `framed={false}` between a card's header and footer, `dense` for tight rows, `valign="top"` for rows of several lines; `Tr total` for a totals row, `Tr onClick` for a row that opens something (only those light on hover). Rows and cells pass other attributes through (`id`, `style`, `title`, `aria-*`). Both tables share `components/ui/table/styles.ts`, so they can't drift. Deliberately left hand-written: the duty statement (`results/Statement.tsx`), HTS note tables (`NoteTable`, `hts-coverage/sections.tsx`), the exposure heat map, and marketing tables. See `hts-code-page/DutyByCountry.tsx`.
- Body rows that only show data don't light on hover; a row lights when it opens something.
- Header row: `ui.label` on `bg-base-200`.
- Body rows: `border-t border-base-300` on the cells (rules on a `<tr>` don't draw in a separated table), `hover:bg-base-200/60` when clickable. Cells are `px-4 py-3`, with `px-5 sm:px-6` on the first and last.
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
| `<Switch checked onChange label? labelledBy? />` | On/off for one setting that applies at once (including a product in an estimate). Its knob slides; that's the one movement allowed |
| `<FaqList faqs openFirst? />` | FAQ disclosures. Text must match the page's `FAQPage` JSON-LD |
| `<StackedBar parts formatValue size? highlight? onHighlight? />` | Parts of a whole as one bar plus legend |
| `<LockedPreview title teaser? points? cta note? preview onShown? />` | A feature that needs an account or the Tracker trial: a blurred stand-in, a teaser (a real number where possible) and one call to action |

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
5. **Locked previews:** `<LockedPreview>` (`components/ui/LockedPreview.tsx`) blurs a stand-in for a feature the visitor hasn't unlocked (a free account for Duty over time and Analysis, the Tracker trial for premium sections). The user approved the blur for this one job (Oct 2026). The blurred content is a placeholder, except in the calculator's account gates (the Compare tab's Analysis and Duty Over Time's "What changed"), where the user chose (Oct 2026) to blur the real content, since seeing what they'd unlock sells it best. Behind the blur nothing can be clicked, selected, focused (`inert`) or read by assistive tech, and the card stays in view over a tall preview. Nowhere else.
6. **Legacy hosts:** `ExploreModal` keeps daisyUI's `modal` around the legacy Explore component, and `RelatedCrossRulingsSection` keeps daisyUI in its non-`bare` branch for the explorer. Both change when those pages migrate.

7. **Homepage glow:** the homepage's dark bands (hero, savings, closing offer) carry a soft cobalt and green glow (`glow` in `components/home/lib/theme.ts`), at the owner's request. Homepage only; §15's no-glow rule holds everywhere else.

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

---

## 14. Marketing layer (landing pages)

Landing pages that sell (`/tariff-monitor`, `/tariff-audit`) use a separate, bolder layer in `components/ui/marketing/`. The analytical rules above (flat, quiet, color only for meaning, color-only motion) are right for tools and wrong for persuasion, so these pages follow this section instead. Tools keep §1–13; the HTS code pages and the Tracker use §15.

The look is the "Command center" direction: **always light**, crisp slate and navy with a **teal** accent, big type, real product visuals, and **dark bands** (`bg-slate-950`) for contrast. It sells the product's accuracy and intelligence: every visual shows real tariff data or a real view of the product.

| Need | Use |
|---|---|
| Type, buttons, surfaces, bands | `import * as mk from "@/components/ui/marketing/styles"` (`mk.display`, `mk.h2`, `mk.lead`, `mk.card`, `mk.frame`, `mk.buttonPrimary`, `mk.band`, `mk.bandDark`, …) |
| Section top | `<SectionIntro eyebrow title id? center? dark?>lead</SectionIntro>` |
| A tariff program's color (alerts, heat map, map lanes, diagrams) | `PROGRAM["Section 232"]` from `components/ui/marketing/colors.ts`, the same everywhere |
| Duty heat (light teal to navy) | `heat(pct)` |
| Numbers that count up | `<CountUp to={…} />` (server renders the final number) |
| A visual that fades in on scroll | `<Reveal>` (visuals only; never wrap copy) |
| Something arriving (a new alert) | `<Enter>` |
| Calculator components inside a landing page | Wrap them in `THEME_LIGHT` so they stay light whatever the toggle says |

Rules:
- **Light, unless a page opts in to the Tracker's look.** No `dark:` variants. A page in the Tariff Tracker's look wraps in `.follow-theme` (the frame does it per path with `FollowTheme` in `components/ui/marketing/FollowTheme.tsx`, which also adds `hts-theme hts-tracker` and the Tracker fonts; `/duty-calculator` and the country pages do as of Oct 2026). There the `skin:` variants apply: theme tokens (`base-content`, `primary`, `tt-soft`, Sora headings via `--font-tracker-display`) in place of slate and teal, following light and dark. The `mk.*` helpers carry them; hard-coded palette classes need their own. `follow-dark:` remains only for `color-scheme`. The header shows the light/dark toggle on these pages only.
- **Tailwind palette colors are allowed here** (slate, teal, sky, amber, orange, emerald, rose), plus the hex values in `marketing/colors.ts` for SVG and inline styles. Still no purple or pink.
- **Motion is allowed**: SVG animation, entrances, count-ups, scroll reveals. Everything that moves stops for `prefers-reduced-motion` (`motion-reduce:hidden` on moving SVG parts; the helpers check it).
- **SEO stays intact**: copy is server-rendered text (never in images or canvas), one H1, the answer-first definition near the top, FAQPage and product schema, and visuals reserve their space so nothing jumps while loading.
- **Data honesty**: real engine output wherever possible (the worked example, verified history, changelog). Illustrative numbers are labeled "example" on the page and explained in a comment.

---

## 15. Tracker app layer (the paid dashboard)

`/tariff-tracker` is the product people pay for, so it gets its own layer: **simple, colorful, and always about the money**. Chosen Oct 2026 as "Option D" (the Atlas look with the Command concept's charts and path to lower duty; mockups on the "Tariff Tracker Dashboard Concepts" canvas). It replaces §1–13's flat, quiet analytical look inside the Tracker, the calculator (`/duty-calculator` and the country pages, through §14's `.follow-theme`) and the HTS code pages (`/hts/[code]`, since Oct 2026); other tools and SEO pages keep §1–13, landing pages keep §14. Built Oct 2026: the palette is `palette.tracker` in `components/ui/theme/palette.js`, applied by the theme plugin inside `.hts-theme.hts-tracker` on the same variables as everything else (so existing themed components in the Tracker follow it), plus `--tt-*` extras exposed as Tailwind colors (`bg-tt-soft`, `bg-tt-side`, `bg-tt-side-card`, `bg-tt-side-active`, `tt-sky`, `tt-slate`). The sidebar carries `.hts-tracker-on-dark`, which gives it the dark palette in both modes. Class helpers: `import * as tt from "@/components/ui/styles/tracker"` (`panel`, `tile`, `title`, `metric`, `eyebrow(tone)`, `chip(tone)`, `numberChip(tone)`, `button(variant)`, `metricSm`). Toggles anywhere in the Tracker and the calculator are `SegmentedControl`, never a hand-rolled track; tabs that switch what a whole panel shows (the calculator results' Duty · Compare · History) are `TabBar` (`components/ui/TabBar`): plain labels along the bottom of the panel's header, the open one in the brand color with an underline on the header's rule. Fonts: `trackerSans` (Figtree) and `trackerDisplay` (Sora) in `components/ui/font.ts`. Inside the Tracker, `rounded-lg` panels round to 20px.

### Principles

1. **Tariff health first.** Under the news tape and the next-step strip, the Overview leads with Tariff health (`overview/TariffHealth.tsx`): the three things the Tracker does for the user, side by side in one panel, with an overall score (their average) in its header. Alerts (the share of imports covered, with a "Set up" or "Not set up" chip for whether alerts have somewhere to go), the savings review (the share whose quick wins are all secured or ruled out) and the audit review (the share with an entry audited, split by what the audits found: possible overpayment, possible underpayment, paid as owed, not audited). Each card is a share, a bar of where every import stands with its legend, one line on what it's worth, and the one button that moves it on.
2. **One next step.** Lead with the next step that matters and what it's worth. The Overview's path strip (one slim row under the news) has five steps: add imports first, then, in any order (so they aren't numbered), set up alerts (say where they go), set import values (finish the ones still on the $10,000 default), see potential savings and audit past entries. The first one not done is the suggested next step.
3. **Color is meaning.** Cobalt is the user's data, links and the next step; green is money (savings, trial, done); red is an increase or a new change; amber is a heads-up, pending action or a lock.
4. **Soft and roomy.** Round corners, generous padding, white space.
5. **Savings are always potential.** Importers may not qualify, or may need a process (certificates of origin, rulings, a supplier move) to lock a saving in. Say "potential savings", "could save", "up to", "may qualify"; never "you save", "will save" or a bare "Save $X". Show the real number, blur only the detail, then offer the trial (§10.5).

### Color (light / dark)

| Role | Light | Dark | Soft tint |
|---|---|---|---|
| Ground | `#EEF0F5` | `#08090D` | |
| Surface (cards) | `#FFFFFF` | `#111319` | |
| Soft (tiles inside cards) | `#F5F6FA` | `#181B23` | |
| Border | `#E3E6EE` | `#232733` | |
| Text | `#0E1220` | `#F1F3F8` | |
| Muted text | `#5D6475` | `#9298A6` | |
| Sidebar (always dark) | `#0E1220`, active `#20273D`, card `#1A2033` | `#111319`, active `#1F2431`, card `#1A1E28` | |
| Cobalt | `#2F49D1` | `#8EA2FF` | 9% / 14% |
| Green | `#138A5B` | `#34C98B` | 10% / 14% |
| Red | `#C2412D` | `#FF7D6E` | 9% / 14% |
| Amber | `#A86A0C` | `#F2B24C` | 10% / 14% |
| Sky (second series) | `#7CC4F2` | `#5CC3F5` | |
| Slate (base duty, quiet marks) | `#CDD2E0` | `#3A4154` | |

Soft tints are the role color at the given opacity, for chips and highlight panels. The heat ramp is cobalt alone, faint to deep; empty cells stay Soft.

### Type

Sora (600) for headlines and every big number; Figtree (400–700) for everything else; tabular figures everywhere. metrics 26–32, card titles 18, body and rows 14, captions 12–13 muted, eyebrows 11–12 bold with +6% tracking in the role color.

### Shape and space

Radii: hero 28, cards and sidebar 24, tiles 18–20, nav items and inputs 12, buttons and chips full pills. Page gutter and card gaps 16; card padding 28 (hero 36–40); tile padding 18. Buttons and nav items 40–44 tall. Cards have a 1px border and no shadow; only floating things (dialogs, popovers, locked overlays) cast one.

### Components

- **Sidebar:** floating, dark in both modes. Workspace and Intelligence groups; each item has a colored dot and count for what's waiting (red "6 new", green "$6.7k", amber alerts). Plan card at the foot (the trial's free checks left as segments, payoff line, green button), then the account.
- **Buttons, one color per intent:** primary = Text fill (dark pill in light mode); money = green; next step = cobalt; secondary = outline pill. At most one green or cobalt button per card.
- **Chips:** number chips inside sentences; status chips (POTENTIAL green, CHANGED red, PROGRAM cobalt, HEADS-UP amber).
- **Tariff news tape:** the latest tariff news and newly added tariffs (proposals, HTS revisions, Federal Register, CSMS, court rulings), as pills with a colored dot.
- **Path strip (Oct 2026):** one slim row of its own under the tariff news tape, never inside another panel. "Your next step" with the whole path beside it as a small track (dots joined by short rules, no numbers: done steps a green check and struck through, the suggested one a cobalt dot, the rest open rings, each step still to do a one-click button with its payoff in the tooltip), then the next step's title in bold leading one line of payoff, and one cobalt (or green, for savings) button on the right. With imports in, the Overview has no visible title or date: it opens on the news tape. The empty overview keeps its title, and its add-products panel is the CTA (inverted, like every CTA).
- **Alert banner:** amber, only when something needs action, e.g. a free allowance used up (savings checks, audit checks, alert slots). Product counts against the plan are never a regular metric.
- **Empty state (no products yet):** the ask first (drop a file or paste codes, template and example links), four benefits, picks from the user's recent calculator lookups as toggle cards, then a clearly labeled EXAMPLE dashboard.
- **Alerts:** soft rows with a round role-colored icon.
- **Product tiles:** code, status chip, name · origin, sparkline, rate and payoff.

- **The calculator's top (Oct 2026), the same on every page** (`calculator/CalculatorTop`): two boxes, nothing floating between them. **Entry details** (the fields: the only place inputs change; the entry date is the one date, with ◀ ▶ that step to the dates its rates changed; in an import's own page the HTS code and origin are locked) and, once there's an answer, **the results** (`ResultsBox`): what it's about on the left (the code and origin as the title, the same on every tab, and its description in words) with Share and the host's main action on the right, then the tabs **Duty · Compare · History** as a `TabBar` on their own row along the header's bottom rule, then everything the open tab shows as sections of the one box, never boxes inside it: each panel directly inside loses its border, shadow, corners and fill (the `.results-body` rules in `app/globals.css`), a hairline divides each section from the last, panels side by side (`.results-row`) get a vertical rule, notices sit inset (`.results-pad`) and keep their tint, and the closing "Track this import free" strip keeps its tint (`.results-keep-fill`). On /duty-calculator, Compare ends with a card pointing to every country (tracking the import free) instead of that strip. On /duty-calculator the main action everywhere is **Track this import free** (`useTrackImport`, which can land on any of the import's views), led by savings and entry audits; "Explain this", "Check if you're qualified" and the refund check stay as secondary links.
- **Compare is countries side by side, nothing more** (`compare/ComparePanel` + `SideBySide`): up to four columns in their colors, each at the trade program claimed for it, with a row offering the agreement that would lower it and a "Claim it" checkbox, a one-line answer first (with a nudge when an unclaimed agreement would beat the cheapest), and supply from Census. No charts and no rates over time. One card at the end points to **Sourcing**: on /duty-calculator it tracks the import free and lands there; in the Tracker it opens it.
- **An import's page in the Tracker** opens with its header (`product/ProductHeader`, one light panel that scrolls away with the page): the way back and its actions (alerts, reset when something's been set, remove) along the top, what it is (flag, HTS code, origin, description), then its views as one `TabBar` along the header's bottom rule: **Duty · Compare · History · Savings · Audit (Beta)**, opening on Duty. Duty, Compare and History are the calculator's own tabs (so the calculator shows no tab row of its own here); Compare ends with every country for the import (`product/sourcing/ProductSourcing`, behind a free account), and selecting a country adds it to the side by side. There is no Summary view. The Tracker's main sidebar folds down to its icons (remembered on the device). The globe and the map are never restyled.

### Charts

Few marks, round ends, no gridlines, no 3D, five series at most; events labelled with colored pills. A duty's parts (`palette.tracker.chart`): base duty a clear gray, then each program in a hue far from the last (cobalt, orange, yellow, red), fees green; neighbours differ in lightness too, so no two read as the same color side by side. Savings ring (one green arc on a Soft track: the share of duty that could be saved), rate pulse (a smooth cobalt line with a fill fading from 25% to clear; changes marked green or red with pill labels), exposure heat map (cobalt ramp), origin distribution (round bars with share and count; a Products / Value toggle, Value estimated from the $10,000 default and labeled "est." until the user enters their own values), sparklines in the metric's color.

### Public pages in the Tracker look

A public page can take this layer without the Tracker's shell, so search visitors see the product's look before they sign up. The HTS reference pages (`/hts/[code]`, `/explore`, `/section/[n]`, `/chapter/[n]`) are the model:

- **The frame** is `HtsFrame` (`components/hts-page/HtsFrame.tsx`, used by each route's `layout.tsx`): `FollowTheme` with no paths (the Tracker's look on every page under it), then `MarketingLayout` with the `TrackerBanner` promo bar above the marketing header ("Start tracking free", or "Open the Tariff Tracker" when signed in) and the `ClassifyCta` band (the homepage's "Need the HTS code first?") above the footer. Page content uses `mk.container` so its edges line up with the header.

- **The HTS explorer** (`components/hts-explorer/`, Oct 2026) is in this look wherever it's shown: on `/explore`, and in `ExplorerDialog` over the calculator, the Tracker or a classification (it carries its own theme classes, since the dialog portals out of the page). The search is one compact pill beside the page title (or the dialog's title). Below it, two panes: the whole schedule as one outline on the left (sections, chapters, headings, codes, each opening in place with an indent guide per level), and a panel on the right showing the selection in full, one panel under another so none leaves a gap (code with Copy link top right, actions, `MicroCalculator`, rates, path, notes, CROSS rulings). On wide screens the two columns fill the screen under the site header and each scrolls on its own, with no overscroll containment, so reaching either end carries on to the page. "Confirm this classification" opens `/classifications/new?code=` (the assistant's HTS-code mode, prefilled) in a new tab. Rule: clicking never scrolls the page; only a selection made elsewhere (a search result's "Show in the schedule", the path) brings its row into view, and only if it's out of sight. Search results take the outline's place and stay while their selection shows on the right. Over a calculator, `onUseCode` adds "Use" to every 8- or 10-digit row and "Use this code" (cobalt) to the panel, which fill the calculator's input bar and close the dialog.
- **Wrap the page** in `${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} bg-base-200`: the Tracker palette (following light and dark), Figtree, Sora on `--font-tracker-display`, and the soft ground. No bordered bands: sections sit on the ground with 64–80px between them.
- **Swap the §1–13 helpers for their Tracker equivalents:**

| §1–13 (`ui.*`) | Tracker (`tt.*`) |
|---|---|
| `ui.card`, `ui.cardOverflowVisible` | `tt.panel` (add `overflow-hidden` for tables and rows that hover to the edge) |
| `ui.cardTitle` | `tt.title` |
| `ui.kicker` | `tt.eyebrow("primary")` |
| `ui.label` (stat labels, table headers) | `tt.eyebrow()` |
| `ui.metric.primary*` / `ui.metric.secondary*` | `tt.metric` / `tt.metricSm` |
| `ui.button({ variant: "primary" })` | `tt.button("primary")` (the next step after a figure, such as "Find my exact duty": `tt.button("next")`) |
| `ui.button()` | `tt.button("secondary")` |
| `ui.badge(…)` | `tt.chip(…)` |
| `bg-base-200` inside a panel (table head, card footer) | `bg-tt-soft` |

- **Padding and shape:** panel rows and headers `px-6 py-4/5`; small figure chips (duty heat, rates) and link chips are `rounded-full`; icon squares `rounded-xl`; the last band of a panel rounds with it (`rounded-b-3xl`). HTS codes stay in `mono`.
- **Shared components follow on their own** through the `tracker:` variant (`.hts-tracker &`, in `tailwind.config.js`): `SectionHeader` (Sora title, bold eyebrow), `FaqList` (round panel, roomier rows) and the bare CROSS rulings list's button. Give a shared component `tracker:` classes rather than a prop when it should look different inside the Tracker's look; layout and content never change with it.
- **The homepage** (`/`, `components/home/`) is in this look too, through `FollowTheme` in `app/page.tsx`. Its parts use theme tokens directly (they appear nowhere else); the shared landing visuals it borrows (`CatalogFrame`, `Testimonials`) keep their marketing classes and add `skin:` twins, so `/tariff-monitor` and `/classify` stay as they were.
- **Dark bands** (the homepage hero with its tariff ticker, the savings band, the closing offer, the Tracker pricing card) stay dark in both modes: `darkBand` from `components/home/lib/theme.ts` (`hts-tracker-on-dark bg-base-200`), so ordinary theme classes inside read light on dark and the band stays darker than the page in dark mode. A product view inside one (the hero's dashboard, the savings finder) takes `followPage` (`hts-theme hts-tracker`) to follow the page's light/dark again. The trial button there is the green money pill (`moneyButton`); no glows or radial gradients.
- **The landing pages** `/tariff-monitor`, `/tariff-audit` and `/classify` are in this look too (`FollowTheme` in each `layout.tsx`). Their components use theme tokens; their SVG diagrams take theme colors as `oklch(var(--p))`-style values; `mk.bandDark` carries `.mk-dark`, which the theme plugin gives the dark palette on these pages, and the `mk.*Dark` helpers have `skin:` twins. Decorative glows are gone there.
- **Calls to action are bold and inverted from the page**: dark in light mode, light in dark mode (`.hts-tracker-inverse`, a theme plugin rule, so theme classes inside follow). Use `components/ui/marketing/cta.ts` (`band`, `bandPad`, `title`, `lead`, `button`: a big green pill, `secondary`, `link`). Every closing band uses it (homepage, Tariff Tracker, Tariff Audit), and so do `ClassifyCta` and the shared FAQ's "Still have questions?" box (through `tracker:` classes, so it changes only in this look).
- Colors need no work: every themed class (`text-primary`, `border-base-300`, `heat()`, chart colors) already takes the Tracker palette inside `.hts-tracker`, and `rounded-lg` rounds to 20px there.

### Don't

Gradients, glows or decorative blur (two exceptions: a chart's area fill may fade to clear, and blur hides locked values); purple or pink; a new color without a job; gray text below 4.5:1 contrast; shipping a screen without checking light and dark.
