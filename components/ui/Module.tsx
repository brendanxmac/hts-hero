import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// The box rules (DESIGN_SYSTEM.md §15 "When to use a box"):
// - A Module is a card, for one thing that stands on its own and could move: a set of key numbers,
//   the Duty Breakdown, Possible Adjustments, a chart, a list.
// - Inside a module, groups are made with space and a section title (tt.sectionTitle), never with
//   another card. A container fill (tt.tile, ui.notice) only marks a total, a tip, a selected row
//   or a callout.
// - Never a card inside a card, or a tinted box inside a tinted box. A table is never boxed inside
//   a module: the module is its frame.
// - Modules sit on the ground with gap-module between them (Modules).

export const Module = ({
  title,
  subtitle,
  actions,
  children,
  padded = true,
  overflowVisible = false,
  className = "",
  id,
  label,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  // On the right of the title row
  actions?: ReactNode;
  children?: ReactNode;
  // Off when the content runs to the card's edges (a table, a row of stats, sections of its own)
  padded?: boolean;
  // For a module that holds a dropdown, which must be free to extend past the card
  overflowVisible?: boolean;
  className?: string;
  id?: string;
  // Names the module for screen readers when it has no visible title
  label?: string;
}) => (
  <section id={id} aria-label={title ? undefined : label} className={`${overflowVisible ? ui.cardOverflowVisible : ui.card} min-w-0 ${className}`}>
    {(title || actions) && (
      <header className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-5 sm:px-6 ${padded ? "" : "pb-4"}`}>
        <div className="min-w-0">
          {title && <h3 className={`${tt.moduleTitle} m-0`}>{title}</h3>}
          {subtitle && <p className={`${tt.subtitle} m-0 mt-0.5`}>{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    )}
    {padded ? <div className={`px-5 pb-5 sm:px-6 ${title || actions ? "pt-4" : "pt-5"}`}>{children}</div> : children}
  </section>
);

// Modules on the ground, one above the other (or in a grid: pass the grid's classes)
export const Modules = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`flex flex-col gap-module ${className}`}>{children}</div>
);
