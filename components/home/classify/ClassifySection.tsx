import Link from "next/link";
import { ArrowRightIcon, CheckIcon, CheckCircleIcon, DocumentTextIcon, ScaleIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { CLASSIFY_PLANS, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import { PRODUCTS } from "@/components/classify-landing/lib/howItWorks";
import { display } from "../lib/theme";

// The classification assistant on the homepage: a section of its own that sells it. The promise
// (audit-ready codes in minutes, backed by the law), what it does, the price, and a real worked
// example from the /classify demo: the product, the candidate headings, the one chosen and the legal
// notes and CROSS rulings behind it.

const POINTS = [
  "Every candidate heading, with the reason each fits or doesn't",
  "The section and chapter notes and CROSS rulings behind the choice",
  "You make the call; your reasoning is documented as you go",
  "A one-click report to file with the entry, or hand your broker",
];

const EXAMPLE = PRODUCTS[1];

export const ClassifySection = () => (
  <section id="classify" className={`${mk.band} scroll-mt-20`} aria-labelledby="classify-title">
    <div className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}>
      <div>
        <p className={mk.eyebrow}>Classification assistant</p>
        <h2 id="classify-title" className={`${mk.h2} mt-4`}>
          The right HTS code, <span className={mk.accent}>and the proof.</span>
        </h2>
        <p className={`${mk.lead} mt-5`}>
          Describe the product. Get every candidate, the legal notes and CROSS rulings that decide between them, and an audit-ready classification in
          minutes, not days.
        </p>
        <ul className="mt-7 flex flex-col gap-3">
          {POINTS.map((point) => (
            <li key={point} className="flex gap-3 text-base text-base-content/80">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <CheckIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
              </span>
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href="/classify#try-classify" className={`${mk.buttonPrimary} h-14 px-8 text-lg`}>
            Classify a product free
            <ArrowRightIcon className="h-5 w-5" aria-hidden />
          </Link>
          <span className="text-base text-base-content/70">
            Then from <strong className={`${display} text-xl font-semibold text-base-content`}>{formatPrice(CLASSIFY_PLANS.starter.price)}</strong>/mo ·{" "}
            <Link href="/classify#pricing" className="font-semibold text-primary underline-offset-4 hover:underline">
              See plans
            </Link>
          </span>
        </div>
      </div>

      {/* A worked example from the classification demo */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-xl sm:p-7" aria-label="An example classification">
        <p className="m-0 text-xs font-bold uppercase tracking-wider text-base-content/50">Product</p>
        <p className="m-0 mt-1.5 text-base font-semibold text-base-content">{EXAMPLE.description}</p>

        <p className="m-0 mt-6 text-xs font-bold uppercase tracking-wider text-base-content/50">Candidate headings</p>
        <ul className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
          {EXAMPLE.candidates.map((c, i) => {
            const chosen = i === EXAMPLE.selectedIndex;
            return (
              <li
                key={c.code}
                className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 ${chosen ? "border-primary bg-primary/[0.06]" : "border-base-300 opacity-70"}`}
              >
                <span className={`font-mono text-sm font-semibold ${chosen ? "text-primary" : "text-base-content/70"}`}>{c.code}</span>
                <span className="line-clamp-1 flex-1 text-sm text-base-content/80">{c.title}</span>
                {chosen && <CheckCircleIcon className="h-5 w-5 shrink-0 text-primary" aria-label="Chosen" />}
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {EXAMPLE.legalNotes.map((n) => (
            <span key={n.source} className="inline-flex items-center gap-1.5 rounded-full bg-tt-soft px-3 py-1 text-xs font-semibold text-base-content/80">
              <DocumentTextIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
              {n.source}
            </span>
          ))}
          {EXAMPLE.crossRulings.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-tt-soft px-3 py-1 text-xs font-semibold text-base-content/80">
              <ScaleIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
              {r.id}
            </span>
          ))}
        </div>

        <p className="m-0 mt-5 border-t border-base-300 pt-4 text-sm leading-relaxed text-base-content/70">{EXAMPLE.summary}</p>
      </div>
    </div>
  </section>
);
