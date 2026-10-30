import { EntryCta } from "@/components/onboarding/EntryCta";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { HISTORICAL_AUDIT_HREF } from "../lib/links";

export const ClosingCta = () => (
  <section className={`${cta.band} ${cta.bandPad}`} aria-labelledby="closing-title">
    <div className={`${mk.container} relative flex flex-col items-center text-center`}>
      <h2 id="closing-title" className={cta.title}>
        Was Your Last Entry Overpaid? <br /><span className={cta.accent}>Find Out in Seconds.</span>
      </h2>
      <p className={`${cta.lead} mt-6 max-w-2xl`}>
        Check your entries now, and protect them going forward.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <EntryCta page="duty-audits" entry="audits_page" section="closing" label="Start Auditing Your Entries" className={cta.buttonPrimary}>
          Start Auditing Your Entries <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </EntryCta>
        {/* <a href={HISTORICAL_AUDIT_HREF} target="_blank" rel="noopener noreferrer" className={cta.secondary}>
          Book a Historical Audit
        </a> */}
      </div>
    </div>
  </section>
);
