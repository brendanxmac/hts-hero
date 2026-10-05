// Class names for HTS Hero's controls and surfaces, in plain Tailwind on the theme's
// semantic colors (see DESIGN_SYSTEM.md). Functions and strings rather than components, so
// they work on <button>, <Link>, <a> and <input> alike, in server and client components.

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:pointer-events-none disabled:opacity-50";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-content shadow-sm hover:bg-primary/90",
  secondary: "border border-base-content/15 bg-base-100 text-base-content shadow-sm hover:bg-base-200",
  ghost: "text-base-content/70 hover:bg-base-200 hover:text-base-content",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

const ICON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

// A button, or a link that looks like one: <Link className={button({ variant: "primary" })}>
export const button = ({
  variant = "secondary",
  size = "md",
  icon = false,
}: { variant?: ButtonVariant; size?: ButtonSize; icon?: boolean } = {}) =>
  `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${icon ? ICON_SIZES[size] : BUTTON_SIZES[size]}`;

// Text inputs, and wrappers that hold an input (add "flex items-center gap-2")
export const input =
  "h-10 w-full rounded-md border border-base-content/20 bg-base-100 px-3 text-sm text-base-content shadow-sm outline-none transition-colors placeholder:text-base-content/60 hover:border-base-content/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20";

export const inputSm = input.replace("h-10", "h-8");

// A box that holds chips and an input, and grows as they wrap
export const inputBox = input.replace("h-10", "min-h-10");

export const select = `${input} cursor-pointer pr-8`;

export const selectSm = select.replace("h-10", "h-8");

// The native checkbox in the primary color
export const checkbox = "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary";

export const link = "font-medium text-primary underline-offset-4 hover:underline";

// A resting panel: white (or the dark surface) on the page background, 1px border
export const card = "rounded-lg border border-base-300 bg-base-100 shadow-sm";

type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-base-200 text-base-content/70 ring-base-300",
  primary: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/25",
  error: "bg-error/10 text-error ring-error/20",
};

export const badge = (tone: BadgeTone = "neutral") =>
  `inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONES[tone]}`;

type NoticeTone = "primary" | "warning" | "error" | "success";

const NOTICE_TONES: Record<NoticeTone, string> = {
  primary: "border-l-primary",
  warning: "border-l-warning",
  error: "border-l-error",
  success: "border-l-success",
};

// A message about the data on screen (unverified dates, caveats, errors): a surface panel
// marked by a colored left rule, not a tinted fill, so it stands out without washing out.
// Put the icon in the tone's color and keep the text in base-content.
export const notice = (tone: NoticeTone = "warning") =>
  `rounded-md border border-base-300 border-l-4 ${NOTICE_TONES[tone]} bg-base-100 px-4 py-3 shadow-sm`;

export const skeleton = "animate-pulse rounded-md bg-base-300/70";

// Small caps over a stat, a table column or a rail
export const label = "text-xs font-semibold uppercase tracking-wider text-base-content/60";
