import { EntryCta } from "@/components/onboarding/EntryCta";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
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
        Add your products in 30 seconds to activate your tariff alerts.
      </p>
      <div className="mt-10">
        <EntryCta page="tariff-alerts" entry="alerts_page" section="closing" label={MAIN_CTA} className={cta.buttonPrimary}>
          {MAIN_CTA} <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </EntryCta>
      </div>
    </div>
  </section>
);
