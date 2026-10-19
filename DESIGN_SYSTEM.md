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

### Stat strip

A few headline numbers side by side are always `StatStrip` (`components/ui/StatStrip.tsx`): cells divided by 1px rules (`gap-px` over `bg-base-300`), each a `ui.label`, a `ui.metric.secondary` number (the first one `ui.metric.primary` with `lead`, in a wider cell) and a muted note, plus anything under it (`extra`, e.g. a sparkline). On its own it's a card; inside a card (`framed={false}`) it's one of the card's sections. Never a card per number, never tiles.

### Cards and sections

A card never sits inside another card. When one card holds several parts (the calculator's results, a panel with a table and a sidebar), wrap its body in `CardSections` (`components/ui/Card.tsx`): each child is a section with a 1px rule above it (never above the first section with anything in it, so a card with no header doesn't start with a line; empty sections take no room), and side-by-side parts go in a `CardRow` (a vertical rule between them from lg). A panel that is a card elsewhere and a section here takes its class from `useCardClass()` instead of `ui.card`, so it draws no card of its own inside `CardSections`. A notice, a note or a strip of text and a button inside the card sits in `ui.cardSection` padding. Inside a card, only soft-filled tiles (`tt.tile`, no border) and controls (inputs, dropzones) have their own corners.

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

`/tariff-tracker` is the product people pay for, so it gets its own layer: **simple, colorful, and always about the money**. Chosen Oct 2026 as "Option D" (the Atlas look with the Command concept's charts and path to lower duty; mockups on the "Tariff Tracker Dashboard Concepts" canvas). It replaces §1–13's flat, quiet analytical look inside the Tracker, the calculator (`/duty-calculator` and the country pages, through §14's `.follow-theme`) and the HTS code pages (`/hts/[code]`, since Oct 2026); other tools and SEO pages keep §1–13, landing pages keep §14. Built Oct 2026: the palette is `palette.tracker` in `components/ui/theme/palette.js`, applied by the theme plugin inside `.hts-theme.hts-tracker` on the same variables as everything else (so existing themed components in the Tracker follow it), plus `--tt-*` extras exposed as Tailwind colors (`bg-tt-soft`, `bg-tt-side`, `bg-tt-side-card`, `bg-tt-side-active`, `tt-sky`, `tt-slate`). The sidebar carries `.hts-tracker-on-dark`, which gives it the dark palette in both modes. Class helpers: `import * as tt from "@/components/ui/styles/tracker"` (`panel`, `tile`, `title`, `metric`, `eyebrow(tone)`, `chip(tone)`, `numberChip(tone)`, `metricSm`). **Inside this look, `ui.*` and `tt.*` draw the same thing** (Oct 2026, through `tracker:` classes on the `ui` helpers): `ui.card` and `tt.panel` are one card (20px corners, 1px border, the two-layer `--tt-shadow`), `ui.cardTitle` is `tt.title` (Sora 18), `ui.metric.*` are Sora, and there is one button, `ui.button` (no `tt.button`). Toggles anywhere in the Tracker and the calculator are `SegmentedControl` (one look: the selected option raised in white on a soft track, never a brand fill), never a hand-rolled track; tabs that switch what a whole view shows (the calculator results' Duty · Compare · Changes, an import's tabs) are `TabBar` (`components/ui/TabBar`): pills at the foot of the header card, the open one tinted in the brand color, because the header is a card of its own with the view's modules below it on the ground. Fonts: `trackerSans` (Figtree) and `trackerDisplay` (Sora) in `components/ui/font.ts`. Inside the Tracker, `rounded-lg` panels round to 20px.

### Principles

1. **Home is a short list of what needs the user** (Oct 2026 restructure, `overview/AttentionList.tsx`): "Needs Your Attention", ranked by what it costs and how soon. Rates that went up in the last 90 days first (red stripe), then tariff actions still to take effect or that name an import (amber), then AD/CVD cases (red when the user said one covers them, amber to check), then setting up: alerts, then import values (cobalt). Each item is one line on what happened, one caption line of detail, and one button that opens the fix; the first setup step's button is the screen's one cobalt action. An item leaves the list once it's dealt with, and an empty list says "Nothing needs you today." Changes and tariff actions older than 60 days never show on it. Above it, Home's header card ends with the three key numbers (12-month rate change, average rate, changes in 12 months), each with its 12-month line. Under it, the average rate's 12-month chart beside **Tariff Health** (`overview/TariffHealth.tsx`: one score as a ring, green from 80% and amber below, with a bar for each part: Alerts, the share of imports with alerts on and somewhere for them to go; Impact Checks, the share of tariff actions that may affect them reviewed (in the score once there are imports with alerts on); Savings, the share reviewed; Audits, the share with an entry audited. The score averages the parts that are live, so until Savings and Audits launch it's alerts alone and they show "Coming Oct 2026" on a dashed bar, outside the score). That row is at least 26rem and grows with Tariff Health if it must; the chart fills whatever height its card is given, so the two are always one height. Then a row of one height: what changed on the user's imports beside the latest tariff actions, each list cut to fit. Exposure and origins live in Your Imports' Insights view.
2. **One number, once.** A figure shown as a headline on a screen isn't repeated as a headline elsewhere on it (the 12-month chart has no "Today" tile: the average rate is in the header's numbers).
3. **Color is meaning.** Cobalt is the user's data, links and the next step; green is money (savings, trial, done); red is an increase or a new change; amber is a heads-up, pending action or a lock.
4. **Soft and roomy.** Round corners, generous padding, white space.
5. **Savings are always potential.** Importers may not qualify, or may need a process (certificates of origin, rulings, a supplier move) to lock a saving in. Say "potential savings", "could save", "up to", "may qualify"; never "you save", "will save" or a bare "Save $X". Show the real number, blur only the detail, then offer the trial (§10.5).

### Color (light / dark)

**Surfaces (Oct 2026 review).** Five roles, generated in OKLCH from the cobalt hue (265) at very low chroma so each step looks even, and lighter as they come forward in dark: **ground** (the page, `bg-base-200`) → **surface** (cards, `bg-base-100`) → **container** (fills inside a card: totals, tips, a table's head, `bg-tt-soft`) → **container high** (hover and selected rows, `bg-tt-soft-high`). Lines: **border** (`border-base-300`, at least 1.4:1 against a card) for edges and rows, and the **strong rule** (`border-tt-rule`, about 1.8:1) only where structure changes (under a table's head, above a total). Inside a card (`ui.card` and `tt.panel` carry `tt-card`), any `bg-base-200` fill takes the container tone, so a tint never reads as a hole through to the ground. Cards cast the Tracker's two-layer shadow (`--tt-shadow`: a tight edge and a soft spread); in dark the tone does the lifting and the shadow only settles the edge.

| Role | Light | Dark | Soft tint |
|---|---|---|---|
| Ground | `#E3E6EE` | `#0B0D13` | |
| Surface (cards) | `#FFFFFF` | `#161A22` | |
| Container (fills inside cards) | `#F2F4F9` | `#1F232C` | |
| Container high (hover, selected) | `#E8EBF1` | `#262B36` | |
| Border | `#D4D7E0` | `#333843` | |
| Strong rule | `#BFC4CF` | `#3F4551` | |
| Text | `#0E1220` | `#F1F3F8` | |
| Muted text | 60–70% of text (never below 50% for words) | same | |
| Sidebar (always dark) | `#0E1220`, active `#20273D`, card `#1A2033` | `#101319` (a step darker than cards), active `#20252F`, card `#191D26` | |
| Cobalt | `#2F49D1` | `#8EA2FF` | 9% / 14% |
| Green | `#138A5B` | `#4FD39B` | 10% / 14% |
| Red | `#C2412D` | `#FF8A7C` | 9% / 14% |
| Amber | `#A86A0C` | `#F2B24C` | 10% / 14% |
| Sky (second series) | `#7CC4F2` | `#5CC3F5` | |
| Slate (base duty, quiet marks) | `#CDD2E0` | `#3A4154` | |

**Color roles.** Cobalt: the one primary action on a screen, links, selection. Red: a cost going up or something wrong, never a score that's simply low (a low readiness score is amber). Green: money saved or could be, and done. Amber: needs a look. Charts use their own data palette (below). **One sign-up ask per screen**, where it pays off: the locked feature itself (its lock, once per module, never per row) and the sidebar's "Save your imports" card; no banner for being signed out, and steps that need an account open the feature's page, which asks. **Sidebar counts** are one small pill each: neutral for a count, cobalt for something new, green for money, amber for what needs a look.

Dark mode's colors are a step lighter and softer than light mode's, so they don't vibrate on dark surfaces; check every text color at 4.5:1 on the surface it sits on.

Soft tints are the role color at the given opacity, for chips and highlight panels. The heat ramp is cobalt alone, faint to deep; empty cells stay Soft.

### Type

Sora (600) for headlines and every big number; Figtree (400–700) for everything else; tabular figures everywhere. Five text roles, and at most three sizes on one screen (`components/ui/styles/tracker.ts`): **page title** Sora 28 (`tt.pageTitle`, one per page), **module title** Sora 18 (`tt.moduleTitle`, a card's title), **section title** Figtree 15 semibold (`tt.sectionTitle`, a group inside a module), **body** 14 (`tt.body`) and **caption** 12 muted (`tt.caption`). Numbers in three sizes only: the one hero figure of a view 40 (`tt.metricLg`), key figures 28 (`tt.metric`), figures inline or beside a bigger one 18 (`tt.metricSm`). Uppercase eyebrows (`tt.eyebrow`) only over key numbers and as a page's kicker, never on every section. Muted text is 60–70% of the text color, never below 50% for words.

### Shape and space

Radii: cards and the sidebar 20 (`rounded-lg` here); tiles, notices, dropzones and nav items 12 (`rounded-xl`); buttons and chips full pills. Page gutter and card gaps 16; card padding 20–24 (`px-5 sm:px-6`); tile padding 16–18. Buttons and nav items 40–44 tall. Cards have a 1px border and the Tracker's two-layer shadow (`--tt-shadow`); floating things (dialogs, popovers, locked overlays) cast a bigger one.

**Space in three tiers** (`@theme` in `app/globals.css`): within a group 4–12px; between groups inside a module 24px (`gap-group`, each group with a section title); between modules on the ground 16px (`gap-module`) and between page sections 40px (`gap-page`). The space between groups is always clearly bigger than the space inside them, so groups read without lines. Rows of cards size to their content: never stretch a card to the tallest in its row (pair cards whose content is similar in height instead).

### Page frame

Every page opens the same way (`shell/SectionPage`, `SectionHeader`), in **a header card**, like an import's header: its title (`tt.pageTitle`), one line on what it's for (Home's line is the day and how many imports it covers), its own actions on the right, then its views as `TabBar` pills at the card's foot, so the tabs are plainly part of what they switch (tabs set straight on the ground looked detached; Carbon and Polaris both keep tabs with the container they switch). A page's header card can end with one more section under a rule (Home's three key numbers with their 12-month lines). On the Calculator, the header card is Entry details: the page's title and line, then its fields. Then its modules on the ground. Above the header there is one status slot (the plan banner: the trial ending or ended, the free checks used), never more than one strip at a time.

**Rows never leave ground showing under a card.** Cards side by side in a row are one height: either the row has one full-width card, or its cards stretch to the row and their content fills them (a chart that grows, a list cut to fit with its "All…" link, as on Home's What Changed and Latest Tariff Actions, `xl:h-[26rem]`), or a master list sets the height and the detail column's last card fills the rest (Tariff Changes' Actions). Never `items-start` on a row of cards of different heights.

A side rail beside a page's main column is quieter than the main column: `tt.rail`, an outline on the ground with no fill or shadow.

### When to use a box

`components/ui/Module`: a **Module** is a card, for one thing that stands on its own and could move (a set of key numbers, the Duty Breakdown, Possible Adjustments, a chart, a list); **Modules** stacks them with `gap-module` of ground between. Inside a module, groups are made with space and a section title, never another card. A container fill (`tt.tile`, `ui.notice`) only marks a total, a tip, a selected row or a callout. Never a card inside a card, or a tinted box inside a tinted box. A table is never boxed inside a module: the module is its frame. Grouping by space comes first (NN/g: proximity is the strongest cue); a box is for what spacing can't group.


### Tables, states and motion

**Tables:** hairline rows (the border role), the head on the card's own surface over a 2px strong rule (`tt-rule`), totals under the strong rule with the grand total on the container fill; numbers right-aligned in tabular figures; rows about 48px, and on long tables a **Comfortable · Compact** switch (`useDensity`, about 40px rows, remembered on the device; Your Imports first). **Loading:** skeletons in the container-high tone (`ui.skeleton`), shaped like the modules they stand in for (`ResultsSkeleton`). **Empty:** a module with nothing to show is one short line and its action, sized to its content, never a tall empty card. **Motion:** quick and quiet: a view that comes into place (a Tracker page, a results tab) fades in and rises 4px over 180ms (`.tt-enter`), and nothing moves for anyone who asks for reduced motion.

### Components

- **Sidebar:** floating, dark in both modes, organized by what people come to do, not by data source (Oct 2026 restructure): **Home** (what needs attention), **Your Imports** (views: Imports, Insights), **Calculator**, **Tariff Changes** (views: Actions, Rate History, Alert Settings; it holds what were Tariff News, Tariff Impacts, Rate History and Alerts), then **Savings** and **Audits** (marked Soon until they launch). Expert Help sits apart at the sidebar's foot, above the plan card and the account. A page with several views shows them as pill tabs (`TabBar`) under its title (`SectionHeader`'s `tabs`), and a view is in the address (`&view=`). Old addresses of sections that moved open them in their new home (`MOVED_TABS` in `sections.ts`). Each item has one small pill for what's waiting there.
- **A tariff action, open in Tariff Changes' Actions** (`impact/TariffImpact`): its title and summary (cut to four lines; "Read the full summary" only when the text is actually cut, measured) with **Read the announcement** as a button under it, and beside them **Where It Stands** (`impact/StageTimeline`): its stage is a status (the latest it has reached, as a chip), then the path so far as a short vertical timeline, oldest first: each stage it reached with its date and a link to the official document behind it (the current stage dated by its latest one), the day it takes or took effect among them in amber (with "in 12 days" or "today"), the stages still ahead faded; stages it skipped aren't shown (`/api/tariff-updates/sources`). An AD/CVD proceeding uses its own milestones instead, from its notices (`adcvd_events`): petition filed, investigation started, preliminary and final determinations, ITC votes, order issued (or continued, revoked, ended), each dated and linked, the latest as the status chip; while an investigation is under way, the milestones still to come are faded. **Impact checks to review** (`impact/reviews.ts`): a tariff action that affects, or may affect, imports with alerts on, from the last 90 days or still to take effect, waits for the user to mark it reviewed ("Mark as reviewed" at the top of Your Imports It Touches; "Reviewed Oct 19 · Undo" after). The mark is saved on each import it touches (`adjustments.reviewed`, synced with the account), so an import added later is still to review. Those still to review lead the action list (27rem wide, its filters as a `SegmentedControl` with counts on the user's own two and one line under it on what the open one means: **Needs Review**, recent actions that may affect imports with alerts on and aren't reviewed; **Affect You**, every action that affects or may affect the imports, reviewed or not, past ones too; **Upcoming**, actions still to take effect, soonest first and grouped by the month they do; **All**, every action newest first, searchable by product, code, country or law. A "To review" or "Reviewed" chip on each row), lead Home's Needs Your Attention among actions (within its 60 days), put an amber count on Tariff Changes in the sidebar, and are a part of Tariff Health's score (Impact Checks: the share reviewed, once there are imports with alerts on). Then **What It Covers** (`impact/ActionScope`: its countries, HTS codes and Chapter 99 numbers as chips, a long list folding to its first twelve, and what it leaves out), then what it does to the imports. **Your Imports It Touches** (`impact/ImpactImports`) is one card in three groups, each with one line on what it means, in place of a filter: **Duty Changes** (worked out the day before and the day it takes effect), **May Apply** (it names their code and country; the new rate isn't in the HTS yet, so the row says when the after rate will be known instead of leaving it blank) and **Same Country, Other Products** (folded away). Every row says it all without opening: **why** it's there in plain words (the duty line it starts or ends, by name and number, or the code or country the scope names), its tariffs before and after as two bars, each duty line the action adds, ends or moves with its rate before → after, and the change; the row itself opens the import (Changes for a confirmed change, AD/CVD for a case, Duty otherwise). An AD/CVD case never reaches the HTS, so it never says "once it's in the HTS": its middle group is **The Case May Cover** (a deposit depends on what the goods are and who made them; check each on its AD/CVD tab), its rows' after reads "A deposit on top, if the case covers your goods" and their chip "Check the case".
- **Buttons:** one button, `ui.button`, in three kinds: primary (the cobalt fill, the one main action on a screen), secondary (outline pill) and ghost. No dark or green buttons; a card's other actions are secondary or links.
- **Chips:** number chips inside sentences; status chips (POTENTIAL green, CHANGED red, PROGRAM cobalt, HEADS-UP amber).
- **Tariff news tape:** the latest tariff news and newly added tariffs (proposals, HTS revisions, Federal Register, CSMS, court rulings), as pills with a colored dot.
- **Alert banner:** amber, only when something needs action, e.g. a free allowance used up (savings checks, audit checks, alert slots). Product counts against the plan are never a regular metric.
- **Empty state (no products yet):** the ask first (drop a file or paste codes, template and example links), four benefits, picks from the user's recent calculator lookups as toggle cards, then a clearly labeled EXAMPLE dashboard.
- **Alerts:** soft rows with a round role-colored icon.
- **Product tiles:** code, status chip, name · origin, sparkline, rate and payoff.

- **The calculator's top (Oct 2026), the same on every page** (`calculator/CalculatorTop`): **two groups, a page tier apart** (`gap-page`): the inputs, Entry details (the fields: the only place inputs change; the entry date is the one date, with ◀ ▶ that step to the dates its rates changed), on their own; then, once there's an answer, the results, close together (`gap-module`): a heading card (`ResultsHeading`: the code and origin as the title, its description in words, Share and the host's main action on the right) and the tabs **Duty · Compare · Changes** as `TabBar` pills. Then everything the open tab shows as module cards on the ground (`ResultsBox`, `ModuleSections`): on Duty, the key numbers (total duty, fees, duty + fees, landed cost) with the tariff bar and one line on AD/CVD (amber when a case may apply, taking the user down to the check; a green check when none was found), the duty breakdown beside Possible Adjustments (a `CardRow`), then **Antidumping and Countervailing Duties** as a heading on the ground (`data-plain`, `#adcvd-check`) over the AD/CVD check's own modules: AD/CVD is duty too, so it's part of the Duty tab, and the Duty pill carries "AD/CVD may apply". **Changes** is the rate history (Duty Over Time) then the news on this import; its pill counts both. Old links to `view=adcvd`, `history` or `news` open the tab they're now part of. On /duty-calculator the main action everywhere is **Track this import free** (`useTrackImport`); "Check if you're qualified" and the refund check stay as secondary links.
- **A header belongs to what it introduces.** Results go with their own heading, never with the inputs above them. A module's header and the content under it (Compare's Duty Comparison and its open view, the AD/CVD check's "N cases may cover this import" and its two panels) are one card, ruled apart inside (`CardSections`, a `CardRow` for side-by-side panels), never a header card with its content broken off into another.
- **Coming soon is a pitch, not a placeholder** (`shell/ComingSoon`, Savings and Audits until they launch, on their pages and an import's tabs): a hero card with a soft brand wash at its top (an icon tile, the eyebrow, the launch label and "Included in every Tracker plan", one promise as a big title and a paragraph, then one action: sign up free, or for an account "You're set" and a way to alerts meanwhile), ending in up to three numbers from the user's own imports (always "up to" for savings); then How It Will Work (three numbered steps), What It Will Check (six features with icons) beside an example finding (marked "Example", with the broker's part spelled out: we find, flag and explain; the broker decides and files).
- **Compare is Duty Comparison** (`compare/ComparePanel`, Oct 2026): one header like History's Duty Over Time, "Duty Comparison" / "See what it costs to import this from other countries", on one line with, on the right, the view as a `SegmentedControl` (**Insights · Side by Side · Globe · Table · Chart** when signed in; a visitor gets Side by Side first, then Insights; it opens on Side by Side) and the two controls every view follows: the entry date (`calculator/EntryDatePicker`: Today, each date the import's rates changed with what changed and its effect on the duty, or another date; the same date as Entry details and the import's header) and **Standard · Trade programs**. The views have no titles of their own (the tab names them; their title and description stay for screen readers). **Side by Side** (free) is the columns alone (no summary line): it starts on yours plus two large US suppliers (the cheaper first), with no tags or suggestions on them, so the **Add a country** column (a dashed tile filling the whole column: "Compare any of 199 countries, up to 4 at once") is always in view, and any country but yours can be swapped in place: its name (with a chevron) opens `compare/CountryPicker`, a dropdown with a search box (focused, Enter picks the first match), the cheapest countries that already ship it to the US, then every country A to Z, each with its rate and US imports; a pick, a click outside or Escape closes it. The Add a country tile opens the same picker. One column per country, yours on the left and the rest in the order they were added (a new one joins the end), each a `compare/CountryCard` with rates leading and dollars under them: who ("Yours", the agreement used), the duty rate and its dollars with a chip against yours, a bar of what it's made of (scaled to the highest rate shown), then one row per tariff program (Base duty, Section 301 – Forced Labor…) lined up across the columns ("—" where it doesn't apply), total duty, fees and landed cost (bold), then, apart in its own soft tile because it's a different question, **US Import Volume** from there (Census: the yearly value, a "#2 supplier" pill, its share of US imports and a sky bar of that share against the largest shown), and "Full breakdown"; "Add a country" is the last column while there's room. **Insights** is the answer, Where you stand and Cheaper options. **Globe** is three columns with nothing on top of the map: the picked country's `CountryCard` on the left (yours by default; hide it, and "Show Brazil (yours)" brings it back), the globe in the middle (sized so its glow fits inside the frame; the mouse wheel zooms it smoothly, and its controls, zoom out and in in small steps, back to yours and full screen, sit together beside Globe / Flat over the map, never on it), the cheapest origins on the right. **Table** is every origin (`OriginsList`), with a legend of the bars' colors over it: rank, country, the duty rate as a number then a bar of its tariffs in their colors (a hover card lists each), duty per shipment, against yours, US imports with their share, trend and swing. **Chart** is the Tariff Time Lapse, its every-change list the shared `TimelineList` (`components/ui/TimelineList`, also History's What Changed). Insights, Globe, Table and Chart need a free account (`AnalysisGate`: a blurred preview at most a screen tall, and the sign-up). On /duty-calculator, Side by Side ends with **Get advanced comparisons, free** ("Create a free account") for a visitor, or "Track this import free" when signed in.
- **An import's page in the Tracker** says what it is once, in its header (`product/ProductHeader`, one light panel that scrolls away with the page): the way back and its actions (Share, alerts, reset when something's been set, remove) along the top; what it is (flag, HTS code, origin, description) with, on Duty, Compare and History, the fields that can change beside it (`ImportInputs`: value, quantity when needed, entry date, mode of transport); then its views as `TabBar` pills at the foot of the header card, each with what's waiting on it: **Overview · Duty** ("AD/CVD may apply") **· Compare · Changes** (its changes and news) **· Savings · Audits**, opening on Overview, the quick answer: first its **Alerts, Savings and Audits** (`product/ImportPromises`: one module, three columns, each a status chip, one line and one button), then its rate, where it comes from, AD/CVD, ways it could cost less, its history and news in short, each with the way to its tab. Savings and Audits are always there; until they launch they carry a gray "Soon" and say what's coming, with the sign-up for visitors (`PlannedSection`). Duty, Compare and Changes are the calculator's own tabs, so there is no Entry details card: the header is that card and the results start at the answer. Compare is the same Duty Comparison as on /duty-calculator. Savings and Audit open with the one allowance notice (`access/FreeChecksNotice`: checks left, or "See plans" once they're used, or what a free account includes when signed out), then their own content. There is no Summary view. The Tracker's main sidebar folds down to its icons (remembered on the device). The globe ("Around the World", `analysis/WorldMap`) shades each country in cobalt, stronger with its rate, with duty-free origins in green. The **Tariff Time Lapse** (`analysis/TimeLapse`) keeps a steady height while it plays or is scrubbed: the flag chart never shrinks below its tallest frame, and under the timeline **Every change** lists each date's changes oldest first in a fixed-height tile that scrolls on its own (the date on screen lit and kept in view, later ones faded, three changes each with "Show all N changes"; select one to jump there). Compare's insights are "Where you stand" and "Cheaper options" (no "Risk and change").

### Charts

Few marks, round ends, no gridlines, no 3D, five series at most; events labelled with colored pills. A duty's parts (`palette.tracker.chart`): base duty a clear gray, then each program in a hue far from the last (blue, orange, yellow, teal), fees sage; a data palette of its own that never reuses a state color (cobalt the brand, red an increase, green money), so a Section 232 bar never reads as "something went up"; neighbours differ in lightness too, so no two read as the same color side by side. Savings ring (one green arc on a Soft track: the share of duty that could be saved), rate pulse (a smooth cobalt line with a fill fading from 25% to clear; changes marked green or red with pill labels), exposure heat map (cobalt ramp), origin distribution (round bars with share and count; a Products / Value toggle, Value estimated from the $10,000 default and labeled "est." until the user enters their own values), sparklines in the metric's color.

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
| `ui.badge(…)` | `tt.chip(…)` |
| `bg-base-200` inside a panel (table head, card footer) | `bg-tt-soft` |

- **Padding and shape:** panel rows and headers `px-6 py-4/5`; small figure chips (duty heat, rates) and link chips are `rounded-full`; icon squares `rounded-xl`; the last band of a panel rounds with it (`rounded-b-3xl`). HTS codes stay in `mono`.
- **Shared components follow on their own** through the `tracker:` variant (`.hts-tracker &`, in `tailwind.config.js`): `SectionHeader` (Sora title, bold eyebrow), `FaqList` (round panel, roomier rows) and the bare CROSS rulings list's button. Give a shared component `tracker:` classes rather than a prop when it should look different inside the Tracker's look; layout and content never change with it.
- **The homepage** (`/`, `components/home/`) is in this look too, through `FollowTheme` in `app/page.tsx`. Its parts use theme tokens directly (they appear nowhere else); the shared landing visuals it borrows (`CatalogFrame`, `Testimonials`) keep their marketing classes and add `skin:` twins, so `/tariff-monitor` and `/classify` stay as they were.
- **Dark bands** (the homepage hero with its tariff ticker, the savings band, the closing offer, the Tracker pricing card) stay dark in both modes: `darkBand` from `components/home/lib/theme.ts` (`hts-tracker-on-dark bg-base-200`), so ordinary theme classes inside read light on dark and the band stays darker than the page in dark mode. A product view inside one (the hero's dashboard, the savings finder) takes `followPage` (`hts-theme hts-tracker`) to follow the page's light/dark again. The trial button there is the green money pill (`moneyButton`); no glows or radial gradients.
- **The landing pages** `/tariff-monitor`, `/tariff-audit` and `/classify` are in this look too (`FollowTheme` in each `layout.tsx`). Their components use theme tokens; their SVG diagrams take theme colors as `oklch(var(--p))`-style values; `mk.bandDark` carries `.mk-dark`, which the theme plugin gives the dark palette on these pages, and the `mk.*Dark` helpers have `skin:` twins. Decorative glows are gone there.
- **Calls to action on landing pages are bold and inverted from the page** (never inside the Tracker, the calculator or /hts, where a call to action is a primary button): dark in light mode, light in dark mode (`.hts-tracker-inverse`, a theme plugin rule, so theme classes inside follow). Use `components/ui/marketing/cta.ts` (`band`, `bandPad`, `title`, `lead`, `button`: a big green pill, `secondary`, `link`). Every closing band uses it (homepage, Tariff Tracker, Tariff Audit), and so do `ClassifyCta` and the shared FAQ's "Still have questions?" box (through `tracker:` classes, so it changes only in this look).
- Colors need no work: every themed class (`text-primary`, `border-base-300`, `heat()`, chart colors) already takes the Tracker palette inside `.hts-tracker`, and `rounded-lg` rounds to 20px there.

### Don't

Gradients, glows or decorative blur (two exceptions: a chart's area fill may fade to clear, and blur hides locked values); purple or pink; a new color without a job; gray text below 4.5:1 contrast; shipping a screen without checking light and dark.
