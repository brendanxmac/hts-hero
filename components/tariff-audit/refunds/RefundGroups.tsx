import Link from "next/link";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Reveal, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { REFUND_GROUPS, RefundStatusTone } from "../lib/refundGroups";
import { RefundTimeline, TIMELINE_EVENTS } from "./RefundTimeline";

const STATUS: Record<RefundStatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
};

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

// Each group of duty that can come back: the timeline of the big two, then a card per group with
// where it stands and what the audit checks
export const RefundGroups = ({ verifiedFrom }: { verifiedFrom: string }) => (
  <section id="refunds" className={`${mk.band} scroll-mt-6`} aria-labelledby="refunds-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Refunds" title="Duty you may be able to get back" id="refunds-title">
        Two tariffs have been struck down since 2025, and others change after the fact. Where each one stands today, and
        what HTS Hero checks for it. Status as of October 2026.
      </SectionIntro>
      <Reveal className="mt-12">
        <div className={`${mk.card} p-6 sm:p-8`}>
          <RefundTimeline verifiedFrom={verifiedFrom} />
          <ol className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE_EVENTS.map((e, i) => (
              <li key={e.at} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white" aria-hidden>
                  {i + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{e.date}</span>
                  <span className="text-sm text-slate-600">{e.label}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {REFUND_GROUPS.map((g) => (
          <article key={g.id} id={`refund-${g.id}`} className={`${mk.card} flex flex-col`} aria-labelledby={`refund-${g.id}-title`}>
            <div className="flex flex-1 flex-col gap-3 p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 id={`refund-${g.id}-title`} className={mk.h3}>
                    {g.name}
                  </h3>
                  <p className={mk.small}>{g.period}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS[g.tone]}`}>{g.status}</span>
              </div>
              <p className={mk.body}>{g.summary}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-7 py-4">
              <p className="flex gap-2 text-sm text-slate-700">
                <MagnifyingGlassIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                <span>{g.check.replace("{verifiedFrom}", longDate(verifiedFrom))}</span>
              </p>
              {g.href ? (
                <Link href={g.href} className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800">
                  {g.name} refund guide <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <p className="text-xs text-slate-400">Full refund guide coming soon.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
