import { ReactNode } from "react";
import * as tt from "@/components/ui/styles/tracker";

// One section of an /hts/[code] page as one card (DESIGN_SYSTEM.md §15: a header belongs to what it
// introduces): the eyebrow, the section's <h2> and its lead in the card's header, the content
// under it (tables and lists edge to edge, or padded with `padded`), and an optional footer band.
// Nothing sits loose on the page's background.
export function CardSection({
  id,
  kicker,
  title,
  titleId,
  lead,
  action,
  footer,
  padded = false,
  children,
}: {
  id: string;
  kicker: ReactNode;
  title: ReactNode;
  titleId?: string;
  // The lead paragraph, under the title
  lead?: ReactNode;
  // Beside the title on wide screens (a link or small button)
  action?: ReactNode;
  // A soft band at the foot: notes, sources, a call to action
  footer?: ReactNode;
  // The content gets the card's padding (prose, chips); off for tables and divided lists
  padded?: boolean;
  children?: ReactNode;
}) {
  return (
    <section id={id} className={`${tt.panel} overflow-hidden scroll-mt-6`}>
      <div className="flex flex-col gap-3 border-b border-base-300 px-6 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className={tt.eyebrow("primary")}>{kicker}</span>
          <h2 id={titleId} className={`${tt.display} m-0 text-xl font-semibold leading-snug tracking-tight text-base-content`}>
            {title}
          </h2>
          {lead && <p className="m-0 max-w-3xl text-sm leading-relaxed text-base-content/70">{lead}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children && <div className={padded ? "px-6 py-5" : ""}>{children}</div>}
      {footer && <div className="border-t border-base-300 bg-tt-soft px-6 py-4">{footer}</div>}
    </section>
  );
}
