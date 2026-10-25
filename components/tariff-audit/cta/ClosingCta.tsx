import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { REQUEST_ANCHOR, SIGN_UP_TO_AUDIT } from "../lib/links";

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
        <Link href={SIGN_UP_TO_AUDIT} className={cta.button}>
          Audit free for {REVERSE_TRIAL.days} days <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <a href={REQUEST_ANCHOR} className={cta.secondary}>
          Request an audit
        </a>
      </div>
    </div>
  </section>
);
