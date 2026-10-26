import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { REVERSE_TRIAL, TRY_IT_FREE } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "@/components/ui/marketing/styles";
import { DEFINITION } from "../lib/copy";
import { ExposureDashboard } from "./ExposureDashboard";

// The reverse trial first (REVERSE_TRIAL), then what stays free forever (alerts on
// TRIAL_ALLOWANCE.alertImports of the account's imports, Tariff News alerts and the free checks)
const PROMISES = [
  `Free for ${REVERSE_TRIAL.days} days, on up to ${REVERSE_TRIAL.imports} imports`,
  "No credit card",
  "Then Tariff News alerts free, forever",
];

// The top of /tariff-monitor: the promise and the answer-first definition beside a live
// dashboard. The copy is server-rendered, so crawlers and AI assistants read it as is.
export const MonitorHero = () => (
  <header className={`relative overflow-hidden ${mk.bandTint}`}>
    <div className={`${mk.container} grid grid-cols-1 gap-14 pb-20 pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:pt-24`}>
      <div className="min-w-0">
        <h1>
          <span className={`${mk.eyebrow} block`}>Tariff Tracker</span>
          <span className={`${mk.display} mt-4 block`}>
            Your whole catalog&apos;s tariff exposure, <span className={mk.accent}>on one screen.</span>
          </span>
        </h1>
        <p className={`${mk.lead} mt-6`}>{DEFINITION}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href={TRY_FREE_HREF} className={mk.buttonPrimary}>
            {TRY_IT_FREE} <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <a href="#try-it" className={mk.buttonSecondary}>
            Try it on your product
          </a>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {PROMISES.map((p) => (
            <li key={p} className={`${mk.small} flex items-center gap-1.5`}>
              <CheckIcon className="h-4 w-4 text-primary" aria-hidden /> {p}
            </li>
          ))}
        </ul>
        <p className={`${mk.small} mt-4`}>
          Automatic savings detection and automatic auditing, included in the trial and every plan
        </p>
        <p className={`${mk.small} mt-8`}>Trusted by hundreds of customs brokers, freight forwarders and manufacturers.</p>
      </div>
      <ExposureDashboard />
    </div>
  </header>
);
