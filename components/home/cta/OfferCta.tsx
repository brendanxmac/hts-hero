import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { OFFER } from "../lib/offer";
import { HomeCta } from "./HomeCta";
import { glow } from "../lib/theme";

// The closing offer: the same single button as the hero, on a band inverted from the page
export const OfferCta = () => (
  <section className={`${cta.band} ${cta.bandPad}`} aria-labelledby="offer-title">
    <div aria-hidden className={glow} />
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="offer-title" className={cta.title}>
        No more tariff overpayments <span className={cta.accent}>or surprises.</span>
      </h2>
      <p className={`${cta.lead} mt-6 max-w-2xl`}>{OFFER.note}</p>
      <HomeCta section="closing" label={OFFER.cta} className={`${cta.buttonPrimary} mt-10`}>
        {OFFER.cta}
        <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </HomeCta>
    </div>
  </section>
);
