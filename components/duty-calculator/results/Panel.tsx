// A titled card for the side panels, with an optional count beside the title, an action across
// from it, and a description
import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";

export const Panel = ({
  title,
  count,
  action,
  description,
  bare = false,
  children,
}: {
  title: string;
  // How many of what it lists are still open, in a pill beside the title
  count?: number;
  // Across from the title (the calculator's "See which ones apply")
  action?: ReactNode;
  description?: string;
  // No card or heading of its own: it sits inside a host's, which names it (the calculator's results)
  bare?: boolean;
  children: ReactNode;
}) => (
  <section className={bare ? "" : `${ui.card} p-5 sm:p-6`}>
    {!bare && (
      <>
        {/* The action drops under the title when they don't fit side by side */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <h3 className={`${ui.cardTitle} flex items-center gap-2`}>
            {title}
            {count !== undefined && count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold tabular-nums text-primary">
                {count}
              </span>
            )}
          </h3>
          {action}
        </div>
        {description && (
          <p className={`${ui.caption} mt-0.5 leading-snug`}>{description}</p>
        )}
      </>
    )}
    <div className={bare ? "" : "mt-4"}>{children}</div>
  </section>
);
