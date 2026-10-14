import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";

// The close of /classify: once a product has its HTS code, the Tariff Tracker watches its duty.
// A bold band, inverted from the page.
export const ClosingCta = () => (
  <section className={`${cta.band} ${cta.bandPad}`} aria-labelledby="classify-closing-title">
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <p className={cta.eyebrow}>Tariff Tracker</p>
      <h2 id="classify-closing-title" className={`${cta.title} mt-4`}>
        Classified it? <span className={cta.accent}>Now track its tariffs.</span>
      </h2>
      <p className={`${cta.lead} mt-6 max-w-2xl`}>
        The Tariff Tracker watches every HTS code you import and alerts you when a tariff change hits it, with the new duty
        already worked out. Free alerts on {TRIAL_ALLOWANCE.alertImports} imports, no credit card.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href={config.auth.loginUrl} className={cta.button}>
          Start tracking free <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <Link href="/tariff-monitor" className={cta.secondary}>
          How the Tariff Tracker works
        </Link>
      </div>
    </div>
  </section>
);
