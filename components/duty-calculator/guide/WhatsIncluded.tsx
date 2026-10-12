import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { formatSummaryDate } from "@/libs/hts-duty-summary";
import * as mk from "@/components/ui/marketing/styles";
import { CHANGELOG_PATH } from "../changelog/constants";
import { INCLUDED } from "./content";

// What the calculator is built from, with a link to every change
export const WhatsIncluded = ({ asOf }: { asOf: string }) => (
  <div className="min-w-0 rounded-3xl border border-slate-200 skin:border-base-300 bg-slate-50 skin:bg-tt-soft p-6 sm:p-8">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className={mk.h3}>What&apos;s included</h3>
      <span className={mk.small}>Updated {formatSummaryDate(asOf)}</span>
    </div>
    {/* Three short sources in a row, then the Chapter 99 programs across the full width */}
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      {INCLUDED.map((item) => (
        <div key={item.title} className={`${mk.card} p-5 ${item.items ? "sm:col-span-3" : ""}`}>
          <h4 className="flex items-center gap-2 text-base font-semibold text-slate-900 skin:text-base-content">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 skin:bg-success/10 text-emerald-700 skin:text-success skin:text-success" aria-hidden>
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            {item.title}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 skin:text-base-content/70">{item.text}</p>
          {item.items && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.items.map((program) => (
                <li
                  key={program}
                  className="rounded-full border border-slate-200 skin:border-base-300 bg-slate-50 skin:bg-tt-soft px-3 py-1 text-xs font-medium text-slate-700 skin:text-base-content/80"
                >
                  {program}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
    <Link href={CHANGELOG_PATH} className={`${mk.buttonSecondary} mt-6 h-10 px-4 text-sm`}>
      View the changelog
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </Link>
  </div>
);
