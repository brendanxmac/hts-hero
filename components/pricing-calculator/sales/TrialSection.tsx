import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { EntryCta } from "@/components/onboarding/EntryCta";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { REVERSE_TRIAL } from "../lib/pricing";
import { MAIN_CTA } from "./copy";

// Try before you buy, as a timeline: add products, a week of everything, then decide

const STEPS = [
  { when: "Today", title: "Add Your Products", body: "Paste a list or upload a spreadsheet. The trial starts here, so every day is spent on your own imports." },
  { when: `Days 1–${REVERSE_TRIAL.days}`, title: "Try Everything, Free", body: `Alerts, impact checks, savings detection and audits.` },
  { when: `Day ${REVERSE_TRIAL.days}`, title: "Keep What You Need", body: "Pick the plan that earned it. Or do nothing: you're never charged, and your catalog stays free." },
];

export const TrialSection = () => (
  <section id="trial" className={`relative isolate overflow-hidden ${mk.bandDark} ${mk.band} scroll-mt-16`} aria-labelledby="trial-title">
    <div className="absolute left-1/2 top-0 -z-10 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" aria-hidden />
    <div className={mk.container}>
      <h2 id="trial-title" className={`${mk.h2Dark} mx-auto max-w-3xl text-center`}>
        Try Before You Buy.
      </h2>

      <ol className="relative mt-16 grid list-none grid-cols-1 gap-10 p-0 lg:grid-cols-3">
        <span className="absolute left-0 right-0 top-[11px] hidden h-px bg-linear-to-r from-primary/70 via-primary/40 to-success/70 lg:block" aria-hidden />
        {STEPS.map(({ when, title, body }) => (
          <li key={title} className="relative">
            <span className="relative block h-6 w-6 rounded-full bg-primary ring-8 ring-primary/15" aria-hidden />
            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-primary">{when}</p>
            <h3 className="mt-2 text-2xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">{title}</h3>
            <p className={`${mk.body} mt-2`}>{body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14 flex justify-center">
        <EntryCta page="pricing" entry="pricing_page" section="trial" label={MAIN_CTA} className={cta.buttonPrimary}>
          {MAIN_CTA} <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </EntryCta>
      </div>
    </div>
  </section>
);
