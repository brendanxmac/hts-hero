// Panels, notices, badges and loading placeholders.

// A resting panel: the lighter surface on the gray page, with a 1px border. The only kind
// of panel: never a tinted one (see "Tints" in DESIGN_SYSTEM.md)
export const card = "rounded-lg border border-base-300 bg-base-100 shadow-sm";

// The row across the top of a card, holding its title (and any controls on the right)
export const cardHeader = "flex items-start justify-between gap-3 border-b border-base-300 px-5 py-4";

// The row across the bottom of a card: sources, a call to action
export const cardFooter = "border-t border-base-300 bg-base-200 px-5 py-4";

type Tone = "neutral" | "primary" | "success" | "warning" | "error";

const BADGE_TONES: Record<Tone, string> = {
  neutral: "bg-base-200 text-base-content/70 ring-base-300",
  primary: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/25",
  error: "bg-error/10 text-error ring-error/20",
};

// A short label on a row or a title: a type, a status, a program code
export const badge = (tone: Tone = "neutral") =>
  `inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONES[tone]}`;

const NOTICE_TONES: Record<Exclude<Tone, "neutral">, string> = {
  primary: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  error: "border-l-error",
};

// A message about the data on screen (unverified dates, caveats, errors): a card marked by a
// colored left rule, not a tinted fill. The icon takes the tone's color; text stays base-content.
export const notice = (tone: Exclude<Tone, "neutral"> = "warning") =>
  `rounded-md border border-base-300 border-l-4 ${NOTICE_TONES[tone]} bg-base-100 px-4 py-3 shadow-sm`;

// A floating list under a control: dropdowns, comboboxes, menus. Position it yourself
// ("absolute z-30 mt-2 w-full …"); options inside are rounded-md rows
export const popover = "rounded-lg border border-base-300 bg-base-100 p-1.5 shadow-lg";

// A floating label over a chart or a mark: position it yourself
export const tooltip = "pointer-events-none rounded-md border border-base-300 bg-base-100 text-base-content shadow-lg";

// A loading placeholder: give it the size of what it stands in for
export const skeleton = "animate-pulse rounded-md bg-base-300/70";
