import * as ui from "@/components/ui/styles";

// The look every table shares (DESIGN_SYSTEM.md "Data table"), used by DataTable and Table so the
// two can't drift: small-caps headers on the soft background, ruled rows lit on hover, the first
// and last cells padded to the card's edge. Inside the Tracker (`tracker:`, §15) headers sit on
// its soft fill and rows are roomier.

export const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;
export type Align = keyof typeof ALIGN;

export const table = "w-full border-separate border-spacing-0 text-sm tabular-nums";

// Each cell's sides: the first and last line up with the card's padding
export const pad = "px-4 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6";

export const headCell = `${ui.label} whitespace-nowrap bg-base-200 py-2.5 tracker:bg-tt-soft tracker:py-3 tracker:font-bold tracker:text-base-content/70`;

export const bodyCell = "border-t border-base-300 py-3 align-middle tracker:py-3.5";

// Table (static, and fine in server components) can't hand its options to its cells through
// context, so the <table> carries them (data-edge, data-dense, data-valign) and each cell reads them with a
// group variant. flush: on a card's own padding (no frame, no fill under the headers); dense:
// tighter rows.
export const tableGroup = "group/t";
const flushPad =
  "group-data-[edge=flush]/t:px-3 group-data-[edge=flush]/t:first:pl-0 group-data-[edge=flush]/t:last:pr-0 sm:group-data-[edge=flush]/t:first:pl-0 sm:group-data-[edge=flush]/t:last:pr-0";
export const staticHead = `${headCell} ${pad} ${flushPad} group-data-[edge=flush]/t:bg-transparent group-data-[edge=flush]/t:pb-2 group-data-[edge=flush]/t:pt-0`;
// valign="top" (data-valign): rows of several lines read from the top
export const staticCell = `${bodyCell} ${pad} ${flushPad} group-data-[dense]/t:py-2 group-data-[valign=top]/t:align-top`;

export const rowHover = "transition-colors hover:bg-base-200/60 tracker:hover:bg-tt-soft";
export const rowSelected = "bg-primary/5";

// The card around a table: round in the Tracker; clipped, so a static table's corners are clean
export const frame = `${ui.card} tracker:rounded-3xl tracker:shadow-none`;
// For DataTable: free to overflow, so the header row can stick and menus can drop out of it
export const frameOpen = `${ui.cardOverflowVisible} tracker:rounded-3xl tracker:shadow-none`;
