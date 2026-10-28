import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { PRICING_HREF } from "../lib/nav";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { MAIN_CTA } from "../hero/AlertsHero";

export const ClosingCta = () => (
  <section className={`${cta.band} ${cta.bandPad}`} aria-labelledby="closing-title">
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="closing-title" className={cta.title}>
        Tariff changes are coming. <br /> <span className={cta.accent}>Will you be prepared?</span>
      </h2>
      <p className={`${cta.lead} mt-6 max-w-2xl`}>
        Add your imports in 30 seconds to activate your tariff alerts.
      </p>
      <div className="mt-10">
        <Link href={PRICING_HREF} className={cta.buttonPrimary}>
          {MAIN_CTA} <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </div>
  </section>
);
