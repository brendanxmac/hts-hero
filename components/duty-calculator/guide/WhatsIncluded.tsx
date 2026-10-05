import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { formatSummaryDate } from "@/libs/hts-duty-summary";
import * as ui from "@/components/ui/styles";
import { CHANGELOG_PATH } from "../changelog/constants";
import { INCLUDED } from "./content";

// What the calculator is built from, with a link to every change
export const WhatsIncluded = ({ asOf }: { asOf: string }) => (
  <div className="rounded-lg border border-base-300 bg-base-200 p-5 sm:p-6">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className={ui.cardTitle}>What&apos;s included</h3>
      <span className={ui.caption}>Updated {formatSummaryDate(asOf)}</span>
    </div>
    {/* Three short sources in a row, then the Chapter 99 programs across the full width */}
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {INCLUDED.map((item) => (
        <div key={item.title} className={`${ui.card} p-4 ${item.items ? "sm:col-span-3" : ""}`}>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-base-content">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
            {item.title}
          </h4>
          <p className="mt-1.5 text-sm leading-relaxed text-base-content/70">{item.text}</p>
          {item.items && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {item.items.map((program) => (
                <li
                  key={program}
                  className="rounded-md border border-base-300 bg-base-200 px-2 py-1 text-xs text-base-content"
                >
                  {program}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
    <Link href={CHANGELOG_PATH} className={`${ui.button({ size: "sm" })} mt-5`}>
      View the changelog
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </Link>
  </div>
);
