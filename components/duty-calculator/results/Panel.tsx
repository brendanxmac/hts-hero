// A titled card for the side panels, with an optional badge and description
import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";

export const Panel = ({
  title,
  badge,
  description,
  bare = false,
  children,
}: {
  title: string;
  badge?: string;
  description?: string;
  // No card or heading of its own: it sits inside a host's, which names it (the calculator's results)
  bare?: boolean;
  children: ReactNode;
}) => (
  <section className={bare ? "" : `${ui.card} p-5 sm:p-6`}>
    {!bare && (
      <>
        {/* The badge drops under the title when they don't fit side by side */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <h3 className={ui.cardTitle}>{title}</h3>
          {badge && (
            <span className="whitespace-nowrap rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-xs font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className={`${ui.caption} mt-0.5 leading-snug`}>{description}</p>
        )}
      </>
    )}
    <div className={bare ? "" : "mt-4"}>{children}</div>
  </section>
);
