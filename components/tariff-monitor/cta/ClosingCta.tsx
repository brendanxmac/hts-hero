import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { TRIAL_DAYS, TRIAL_PAIRS } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "@/components/ui/marketing/styles";

export const ClosingCta = () => (
  <section className="relative overflow-hidden bg-slate-950 py-24 text-white" aria-labelledby="closing-title">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,rgba(45,212,191,0.25),transparent)]" />
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="closing-title" className={`${mk.h2Dark} max-w-3xl`}>
        Be the first to know, <span className={mk.accentDark}>every time.</span>
      </h2>
      <p className={`${mk.leadDark} mt-5 max-w-2xl`}>
        Track up to {TRIAL_PAIRS} products free for {TRIAL_DAYS} days. No credit card, no sales call.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href={config.auth.loginUrl} className={mk.buttonOnDark}>
          Start tracking free <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
        <a href="#try-it" className={mk.buttonGhostDark}>
          Try it on your product
        </a>
      </div>
    </div>
  </section>
);
