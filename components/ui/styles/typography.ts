// Type roles, on Tailwind's type scale. One role per job, so the same kind of text looks the
// same everywhere. See "Type" in DESIGN_SYSTEM.md.

// One per site page: the hero headline
export const display = "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-base-content";

// A page's title
export const pageTitle = "text-3xl lg:text-4xl font-semibold tracking-tight text-base-content";

// A section's <h2> (SectionHeader uses it)
export const sectionTitle = "text-2xl sm:text-3xl font-semibold tracking-tight text-base-content";

// A card or panel's <h3>
export const cardTitle = "text-base font-semibold text-base-content";

// Above a section title, in the primary color: what the section is about
export const kicker = "text-xs font-semibold uppercase tracking-wider text-primary";

// Small caps over a stat, a table column or a rail
export const label = "text-xs font-semibold uppercase tracking-wider text-base-content/60";

// A form field's label
export const fieldLabel = "text-sm font-semibold text-base-content/70";

// The intro paragraph under a page title
export const lead = "text-lg leading-relaxed text-base-content/70";

// Paragraphs
export const body = "text-base leading-relaxed text-base-content/70";

// Dense text in cards, lists and tables
export const bodySm = "text-sm leading-snug text-base-content/70";

// Fine print: sources, hints, metadata, the line under a card title
export const caption = "text-xs text-base-content/60";

// Big numbers. Add them to a value with nothing else that sets size or weight.
const METRIC = "font-semibold tracking-tight leading-none tabular-nums text-base-content";
export const metric = {
  // The one headline result on a screen
  hero: `text-5xl sm:text-6xl ${METRIC}`,
  // The main stat in a row of stats
  primary: `text-4xl ${METRIC}`,
  primaryCompact: `text-3xl ${METRIC}`,
  // The other stats in a row
  secondary: `text-2xl ${METRIC}`,
  secondaryCompact: `text-xl ${METRIC}`,
};
