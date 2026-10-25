import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { FREE_FOREVER_LINE } from "@/components/ui/marketing/comingSoon";

export const ClosingCta = () => (
  <section className={`${cta.band} ${cta.bandPad}`} aria-labelledby="closing-title">
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="closing-title" className={cta.title}>
        Be the first to know, <span className={cta.accent}>every time.</span>
      </h2>
      <p className={`${cta.lead} mt-6 max-w-2xl`}>
        Try the Tariff Tracker free for {REVERSE_TRIAL.days} days: everything, on up to {REVERSE_TRIAL.imports} imports. No credit card, no sales
        call. {FREE_FOREVER_LINE}
      </p>
      <p className={`${cta.lead} mt-4 max-w-2xl text-base sm:text-lg`}>
        Automatic savings detection and automatic auditing included, at no extra cost.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href={config.auth.loginUrl} className={cta.button}>
          Start your free {REVERSE_TRIAL.days}-day trial <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <a href="#try-it" className={cta.secondary}>
          Try it on your product
        </a>
      </div>
    </div>
  </section>
);
