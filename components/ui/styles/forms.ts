// Form controls: text inputs, selects and checkboxes.

// Text inputs, and wrappers that hold an input (add "flex items-center gap-2")
export const input =
  "h-10 w-full rounded-md border border-base-content/20 bg-base-100 px-3 text-sm text-base-content shadow-sm outline-none transition-colors placeholder:text-base-content/60 hover:border-base-content/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20";

// In dense rows
export const inputSm = input.replace("h-10", "h-8");

// A box that holds chips and an input, and grows as they wrap
export const inputBox = input.replace("h-10", "min-h-10");

export const select = `${input} cursor-pointer pr-8`;

export const selectSm = select.replace("h-10", "h-8");

// Multi-line text: grows with its rows instead of sitting at an input's fixed height
export const textarea = input.replace("h-10", "min-h-20 py-2");

// The native checkbox in the primary color
export const checkbox = "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary";
