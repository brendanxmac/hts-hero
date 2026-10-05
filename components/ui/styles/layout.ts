// Page layout. See "Layout, spacing, shape" in DESIGN_SYSTEM.md.

// Page width: every band on a page uses it, so edges line up from header to footer
export const container = "mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8";

// A full-width band of the page, below the first. All bands sit on the page background.
export const band = "w-full border-t border-base-300";

// Vertical padding inside a band
export const bandPadding = "py-12 sm:py-16";

// A <section> in a band: its header, then its content
export const section = "scroll-mt-6 flex flex-col gap-6";
