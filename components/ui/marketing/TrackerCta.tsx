import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import * as cta from "./cta";
import * as mk from "./styles";

// The call to action for the Tariff Tracker, as a bold band above the footer: on the /tariffs
// program pages, where the reader is following tariff programs. Only on pages in the Tracker's
// look: a bold band, inverted from the page, like ClassifyCta.
export const TrackerCta = () => (
  <section className={`${cta.band} ${cta.bandPadSm}`} aria-labelledby="tool-tracker-title">
    <div className={`${mk.container} relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center`}>
      <div>
        <p className={cta.eyebrow}>Tariff Tracker</p>
        <h2 id="tool-tracker-title" className={`${cta.titleSm} mt-3`}>
          Eliminate tariff overpayments and surprises
        </h2>
        <p className={`${cta.lead} mt-3 max-w-2xl`}>
          The Tariff Tracker audits your imports for duty you may have overpaid and alerts you the moment a tariff action changes their rate.{" "}
          <strong className="font-semibold text-base-content">
            Free for {REVERSE_TRIAL.days} days on up to {REVERSE_TRIAL.imports} imports, no credit card.
          </strong>
        </p>
      </div>
      <Link href={TRY_FREE_HREF} className={`${cta.buttonSm} shrink-0`}>
        Try it free <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  </section>
);
