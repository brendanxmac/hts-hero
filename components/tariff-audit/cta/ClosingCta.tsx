import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { REVERSE_TRIAL, TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { ComingChip } from "@/components/ui/marketing/ComingChip";
import { REQUEST_ANCHOR, SELF_AUDIT_LIVE, SIGN_UP_TO_AUDIT, SIGN_UP_TO_TRACK } from "../lib/links";

export const ClosingCta = () => (
  <section className={`${cta.band} ${cta.bandPad}`} aria-labelledby="closing-title">
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="closing-title" className={cta.title}>
        Refund deadlines run <span className={cta.accent}>entry by entry.</span>
      </h2>
      <p className={`${cta.lead} mt-6 max-w-2xl`}>
        Protests are due 180 days after liquidation, and many refunds depend on acting before it. Check your entries now.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {SELF_AUDIT_LIVE ? (
          <>
            <Link href={SIGN_UP_TO_AUDIT} className={cta.button}>
              Get {TRIAL_ALLOWANCE.auditChecks} free audit checks <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <a href={REQUEST_ANCHOR} className={cta.secondary}>
              Request an audit
            </a>
          </>
        ) : (
          // Self-serve audits are coming soon: the request form, and tracking imports meanwhile
          <>
            <a href={REQUEST_ANCHOR} className={cta.button}>
              Request an audit <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
            <Link href={SIGN_UP_TO_TRACK} className={cta.secondary}>
              Try the Tariff Tracker free for {REVERSE_TRIAL.days} days
            </Link>
          </>
        )}
      </div>
      {!SELF_AUDIT_LIVE && (
        <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-base-content/60">
          <ComingChip /> Automatic auditing in the Tariff Tracker, included in the trial and every plan.
        </p>
      )}
    </div>
  </section>
);
