import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "@/components/ui/marketing/styles";
import { DEFINITION } from "../lib/copy";
import { REQUEST_ANCHOR, SELF_AUDIT_LIVE, SIGN_UP_TO_AUDIT, SIGN_UP_TO_TRACK } from "../lib/links";
import { AuditDashboard } from "./AuditDashboard";

// While self-serve audits are coming soon (SELF_AUDIT_LIVE), the first promise is the free request
const PROMISES = [
  SELF_AUDIT_LIVE ? `${TRIAL_ALLOWANCE.auditChecks} free audit checks, no card` : "Request an audit free, no obligation",
  "Every line checked at its entry date",
  "Ready to hand to your broker",
];

// The top of /tariff-audit: the promise and the answer-first definition beside a live audit
// result. Server-rendered copy, so crawlers and AI assistants read it as is.
export const AuditHero = () => (
  <header className={`relative overflow-hidden ${mk.bandTint}`}>
    <div className={`${mk.container} grid grid-cols-1 gap-14 pb-20 pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:pt-24`}>
      <div className="min-w-0">
        <h1>
          <span className={`${mk.eyebrow} block`}>Tariff audit</span>
          <span className={`${mk.display} mt-4 block`}>
            Find the duty you overpaid. <span className={mk.accent}>Get it back.</span>
          </span>
        </h1>
        <p className={`${mk.lead} mt-6`}>{DEFINITION}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          {SELF_AUDIT_LIVE ? (
            <>
              <Link href={SIGN_UP_TO_AUDIT} className={mk.buttonPrimary}>
                Start free <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <a href={REQUEST_ANCHOR} className={mk.buttonSecondary}>
                Request an audit
              </a>
            </>
          ) : (
            <>
              <a href={REQUEST_ANCHOR} className={mk.buttonPrimary}>
                Request an audit <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </a>
              <Link href={SIGN_UP_TO_TRACK} className={mk.buttonSecondary}>
                Track your imports free
              </Link>
            </>
          )}
        </div>
        {!SELF_AUDIT_LIVE && <p className={`${mk.small} mt-4`}>Self-serve audits in the Tariff Tracker are coming soon.</p>}
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {PROMISES.map((p) => (
            <li key={p} className={`${mk.small} flex items-center gap-1.5`}>
              <CheckIcon className="h-4 w-4 text-primary" aria-hidden /> {p}
            </li>
          ))}
        </ul>
        <p className={`${mk.small} mt-8`}>Trusted by hundreds of customs brokers, freight forwarders and manufacturers.</p>
      </div>
      <AuditDashboard />
    </div>
  </header>
);
