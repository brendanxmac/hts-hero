// Buttons, and links that look like buttons. A function rather than a component, so the
// same look applies to <button>, <Link> and <a>:
//   <Link href="/classify" className={button({ variant: "primary", size: "lg" })}>

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  // The one main action in a region
  primary: "bg-primary text-primary-content shadow-sm hover:bg-primary/90",
  // Everything else
  secondary: "border border-base-content/15 bg-base-100 text-base-content shadow-sm hover:bg-base-200",
  // Nav items, dismiss and icon buttons
  ghost: "text-base-content/70 hover:bg-base-200 hover:text-base-content",
};

const SIZES: Record<ButtonSize, string> = {
  // Toolbars and panel headers
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  // A page's main call to action
  lg: "h-11 px-5 text-base",
};

const ICON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export const button = ({
  variant = "secondary",
  size = "md",
  icon = false,
}: { variant?: ButtonVariant; size?: ButtonSize; icon?: boolean } = {}) =>
  `${BASE} ${VARIANTS[variant]} ${icon ? ICON_SIZES[size] : SIZES[size]}`;

// A text link in the primary color
export const link = "font-medium text-primary underline-offset-4 hover:underline";
