import { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import * as s from "./styles";

// A table that only shows data (no sorting, filtering or search): the same look as DataTable,
// written as markup, and fine in server components. For a table people work with, use DataTable.
//
//   <Table label="Duty by country">
//     <THead><Tr><Th>Country</Th><Th align="right">Rate</Th></Tr></THead>
//     <TBody>
//       <Tr onClick={…}><RowHeader>China</RowHeader><Td align="right">25%</Td></Tr>
//     </TBody>
//   </Table>
//
// edge="flush" sits a table on a card's own padding (no frame, no fill under the headers);
// framed={false} keeps the card-edge look for a table that's already inside a card (between its
// header and footer); dense tightens the rows; valign="top" reads rows of several lines from the
// top. A row can open something (onClick), be lit (selected), or be a total. Rows and cells pass
// any other attribute through (id, title, style, aria-*, data-*).

export const Table = ({
  label,
  labelledBy,
  edge = "card",
  framed = edge === "card",
  dense = false,
  valign = "middle",
  className = "",
  children,
}: {
  // What the table is, for screen readers (or the id of a visible heading)
  label?: string;
  labelledBy?: string;
  edge?: "card" | "flush";
  framed?: boolean;
  dense?: boolean;
  valign?: "middle" | "top";
  className?: string;
  children: ReactNode;
}) => (
  <div className={framed ? `${s.frame} overflow-x-auto` : "overflow-x-auto"}>
    <table
      className={`${s.table} ${s.tableGroup} ${className}`}
      aria-label={label}
      aria-labelledby={labelledBy}
      data-edge={edge}
      data-dense={dense ? "" : undefined}
      data-valign={valign}
    >
      {children}
    </table>
  </div>
);

export const THead = ({ children }: { children: ReactNode }) => <thead>{children}</thead>;

export const TBody = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;

export const Tr = ({
  onClick,
  selected = false,
  total = false,
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean;
  // A totals row: bold
  total?: boolean;
}) => (
  <tr
    className={`${onClick ? `cursor-pointer ${s.rowHover}` : ""} ${selected ? s.rowSelected : ""} ${total ? "font-semibold text-base-content" : ""} ${className}`}
    onClick={onClick}
    {...rest}
  >
    {children}
  </tr>
);

type Align = { align?: s.Align };

// A column's heading, in THead
export const Th = ({ align = "left", className = "", children, ...rest }: Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> & Align) => (
  <th scope="col" className={`${s.staticHead} ${s.ALIGN[align]} ${className}`} {...rest}>
    {children}
  </th>
);

// The row's subject: its heading for screen readers. Normal weight unless `strong`.
export const RowHeader = ({
  align = "left",
  strong = false,
  className = "",
  children,
  ...rest
}: Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> & Align & { strong?: boolean }) => (
  <th scope="row" className={`${s.staticCell} ${s.ALIGN[align]} ${strong ? "font-semibold text-base-content" : "font-normal"} ${className}`} {...rest}>
    {children}
  </th>
);

export const Td = ({
  align = "left",
  muted = false,
  className = "",
  children,
  ...rest
}: Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> &
  Align & {
    // Secondary figures
    muted?: boolean;
  }) => (
  <td className={`${s.staticCell} ${s.ALIGN[align]} ${muted ? "text-base-content/70" : ""} ${className}`} {...rest}>
    {children}
  </td>
);
