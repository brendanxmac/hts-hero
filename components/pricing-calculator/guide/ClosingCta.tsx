import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as mk from "@/components/ui/marketing/styles";
import { contactLink } from "../lib/links";

// The page-level call to action: for catalogs and teams that want a plan built with us. A band
// that stays dark in both modes (the Tracker's dark palette), like the homepage's
export const ClosingCta = () => (
  <section className={`${mk.band} hts-tracker-on-dark relative overflow-hidden bg-base-200 text-base-content`} aria-labelledby="pricing-cta-title">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,oklch(var(--p)/0.3),transparent)]"
    />
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <p className={mk.eyebrowDark}>Large catalog or team?</p>
      <h2 id="pricing-cta-title" className={`${mk.h2Dark} mt-4 max-w-3xl`}>
        Let&apos;s build a plan <span className={mk.accentDark}>around your imports.</span>
      </h2>
      <p className={`${mk.leadDark} mt-5 max-w-2xl`}>
        Tracking thousands of products or rolling out classification across a compliance team? We&apos;ll price it to fit and
        help you get set up.
      </p>
      <a href={contactLink("A plan for my team")} className={`${mk.buttonOnDark} mt-10 h-14 px-8 text-lg`}>
        Talk to us
        <ArrowRightIcon className="h-5 w-5" aria-hidden />
      </a>
    </div>
  </section>
);
