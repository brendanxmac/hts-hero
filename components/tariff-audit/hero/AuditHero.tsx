import { EntryCta } from "@/components/onboarding/EntryCta";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import { HISTORICAL_AUDIT_HREF } from "../lib/links";
import type { AuditScan } from "@/libs/tariff-audit-example";
import { EntryScanCard } from "./EntryScanCard";

// The top of /duty-audits: the promise and the two ways to buy (ongoing audits, or a historical
// audit on a call) beside one new entry at a time, scanned and judged. On desktop it fills the screen under the header.
// Server-rendered copy, so crawlers and AI assistants read it as is.
export const AuditHero = ({ scans }: { scans: AuditScan[] }) => (
  <header className={`relative overflow-hidden ${mk.bandTint} lg:flex lg:min-h-[calc(100svh-65px)] lg:items-center`}>
    <div className={`${mk.container} grid grid-cols-1 gap-14 pb-20 pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)] lg:items-center lg:py-20`}>
      <div className="min-w-0">
        <h1 className={mk.display}>Find Overpaid Duty, <span className="text-primary">in Seconds</span></h1>
        <p className={`${mk.lead} mt-6`}>Instantly see what you should have paid for every entry, and keep every dollar that gets refunded.</p>
        <div className="mt-10 flex flex-col gap-3">
          <EntryCta page="duty-audits" entry="audits_page" section="hero" label="Check your Imports" className={`${cta.buttonPrimary} w-full`}>
            Check your Imports <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </EntryCta>
          {/* <a href={HISTORICAL_AUDIT_HREF} target="_blank" rel="noopener noreferrer" className={`${mk.buttonSecondary} h-14! w-full`}>
            Book a Historical Audit
          </a> */}
        </div>
        {/* The week-long free trial, under the button */}
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {[`Free for ${REVERSE_TRIAL.days} days`, "No credit card", "Set up in 30 seconds"].map((p) => (
            <li key={p} className={`${mk.small} flex items-center gap-1.5`}>
              <CheckIcon className="h-4 w-4 text-success" aria-hidden /> {p}
            </li>
          ))}
        </ul>
      </div>
      {scans.length > 0 && <EntryScanCard scans={scans} />}
    </div>
  </header>
);
