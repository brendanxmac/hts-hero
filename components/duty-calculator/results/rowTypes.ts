// The shape of a duty statement line, shared by the table rows and the stacked phone rows

export interface RowProps {
  code: string;
  slice?: string;
  name: string;
  program?: string;
  effectiveFrom?: string;
  detail?: string;
  // The heading's legal text, for Chapter 99 lines
  legal?: { text: string; asOf: string; htsCode: string };
  basis: number;
  basisText?: string;
  rate?: number;
  rateText?: string;
  amount: number;
}

// A line's tie to "Where the money goes": its chart color, and whether it's the hovered slice
export interface RowLink {
  color?: string;
  active: boolean;
  onHover?: (on: boolean) => void;
}

export const linkClass = (link?: RowLink) =>
  link?.active ? "bg-primary/10" : "";
