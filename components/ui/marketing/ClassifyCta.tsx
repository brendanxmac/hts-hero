import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { CLASSIFY_PLANS, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import * as cta from "./cta";
import * as mk from "./styles";

// The call to action for the classification assistant, as a bold band: on the homepage, after
// the tariff tools, and on the HTS reference pages above the footer. Only on pages in the
// Tracker's look: a bold band, inverted from the page.
export const ClassifyCta = () => (
  <section className={`${cta.band} ${cta.bandPadSm}`} aria-labelledby="tool-classify-title">
    <div className={`${mk.container} relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center`}>
      <div>
        <p className={cta.eyebrow}>Need the HTS code first?</p>
        <h2 id="tool-classify-title" className={`${cta.titleSm} mt-3`}>
          Produce audit-ready classifications in minutes
        </h2>
        <p className={`${cta.lead} mt-3 max-w-2xl`}>
          Find candidates, eliminate blind spots, and back every code with legal notes and CROSS rulings.{" "}
          <strong className="font-semibold text-base-content">Free to try, no credit card required.</strong> Plans from{" "}
          {formatPrice(CLASSIFY_PLANS.starter.price)}/mo.
        </p>
      </div>
      <Link href="/classify" className={`${cta.buttonSm} shrink-0`}>
        Try it free <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  </section>
);
