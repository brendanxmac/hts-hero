import { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";

// One card of a product's Summary: its title, an optional chip, and the way into the tab it sums up
export const SummaryCard = ({
  title,
  chip,
  link,
  className = "",
  children,
}: {
  title: string;
  chip?: ReactNode;
  link?: { label: string; onClick: () => void };
  className?: string;
  children: ReactNode;
}) => (
  <section className={`${tt.panel} flex min-w-0 flex-col gap-4 p-5 ${className}`} aria-label={title}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h2 className={tt.title}>{title}</h2>
        {chip}
      </div>
      {link && (
        <button type="button" onClick={link.onClick} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {link.label}
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
    {children}
  </section>
);
