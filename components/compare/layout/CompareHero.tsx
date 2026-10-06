import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BlogBreadcrumbs, formatPostDate } from "@/components/blog";
import * as ui from "@/components/ui/styles";

// The top band of a comparison page: where it sits, the title and the bottom line, the main
// call to action, and an optional panel on the right (the "at a glance" card)
export function CompareHero({
  crumb,
  kicker,
  title,
  lead,
  checkedAt,
  aside,
}: {
  crumb?: string;
  kicker: string;
  title: string;
  lead: string;
  checkedAt: string;
  aside?: ReactNode;
}) {
  return (
    <header className="w-full border-b border-base-300">
      <div className={`${ui.container} flex flex-col gap-6 pb-10 pt-6`}>
        <BlogBreadcrumbs trail={crumb ? [{ href: "/compare", label: "Compare" }, { label: crumb }] : [{ label: "Compare" }]} />
        <div className={`grid gap-8 ${aside ? "lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12" : ""}`}>
          <div className="flex max-w-4xl flex-col gap-4">
            <span className={ui.kicker}>{kicker}</span>
            <h1 className={ui.display}>{title}</h1>
            <p className={`${ui.lead} max-w-3xl`}>{lead}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link href="/duty-calculator" className={ui.button({ variant: "primary", size: "lg" })}>
                Try HTS Hero free
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pricing-calculator" className={ui.button({ size: "lg" })}>
                See pricing
              </Link>
            </div>
            <p className={ui.caption}>
              No demo, no sales call, no contract. Last checked{" "}
              <time dateTime={checkedAt}>{formatPostDate(checkedAt)}</time>.
            </p>
          </div>
          {aside}
        </div>
      </div>
    </header>
  );
}
