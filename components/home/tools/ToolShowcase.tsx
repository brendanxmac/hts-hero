import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { CalculationTerminal } from "@/components/tariff-monitor";
import { EntryScanCard } from "@/components/tariff-audit";
import { AlertCard } from "@/components/tariff-alerts";
import { Reveal } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { ALERT_TIERS, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import type { WorkedExample } from "@/libs/duty-calculator-content";
import type { AuditScan } from "@/libs/tariff-audit-example";
import type { AlertExample } from "@/libs/tariff-alerts-example";
import type { SavingsExample } from "@/libs/tariff-savings-example";
import type { MonitorFacts } from "@/components/tariff-monitor/lib/facts";
import { SavingsFinder } from "../savings/SavingsFinder";
import { darkBand, followPage, glow, moneyButtonMd } from "../lib/theme";

// The four capabilities, one block each, every one with a real visual and its own call to action:
// calculate (with the lookup, free), alert, discover savings, audit (each "Get Started", to
// /tariff-alerts and /tariff-audit, savings with the audits), each with its sales page's hero graphic;
// then classification. The order
// follows the hero's scan: changes, savings, audits.

// Theme classes only, so the same markup reads right in the dark band
const Points = ({ items }: { items: string[] }) => (
  <ul className="mt-6 flex flex-col gap-3">
    {items.map((p) => (
      <li
        key={p}
        className="flex gap-2.5 text-base-content/70"
      >
        <CheckIcon
          className="mt-1 h-4 w-4 shrink-0 text-success"
          aria-hidden
        />
        {p}
      </li>
    ))}
  </ul>
);

// Each block's small label over its title
const Step = ({ verb }: { verb: string }) => <p className="text-xs font-bold uppercase tracking-wider text-primary">{verb}</p>;

export const ToolShowcase = ({
  example,
  alert,
  scans,
  savings,
  facts,
}: {
  example: WorkedExample | null;
  // The /tariff-alerts and /tariff-audit heroes' examples, so each block shows its page's graphic
  alert: AlertExample | null;
  scans: AuditScan[];
  savings: SavingsExample[];
  facts: MonitorFacts;
}) => (
  <>
    {/* Audit */}
    <section className={mk.band} aria-labelledby="tool-audit-title">
      <div
        className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
      >
        <div>
          <Step verb="Audit" />
          <h2 id="tool-audit-title" className={`${mk.h2} mt-4`}>
            Find Overpaid Duty <span className={mk.accent}>In Seconds</span>
          </h2>
          <p className={`${mk.lead} mt-4`}>
            Every past entry recalculated with the rules in force on its entry
            date: wrong stacking, missed exemptions, and refundable tariffs like
            IEEPA, flagged for your broker to file.
          </p>
          {/* <Points
            items={[
              "Paid vs. owed, line by line",
              "Where IEEPA and Section 122 refunds stand",
              `Free for ${REVERSE_TRIAL.days} days, or we'll do it for you`,
            ]}
          /> */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/tariff-audit" className={mk.buttonPrimary}>
              Find Overpaid Duty <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        {scans.length > 0 && (
          <Reveal>
            <EntryScanCard scans={scans} />
          </Reveal>
        )}
      </div>
    </section>

    {/* Alert */}
    <section
      className={`${mk.band} ${mk.bandMuted}`}
      aria-labelledby="tool-alert-title"
    >
      <div
        className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
      >
        {alert && (
          <Reveal className="lg:order-2">
            <AlertCard example={alert} />
          </Reveal>
        )}
        <div className="lg:order-1">
          <Step verb="Alert" />
          <h2 id="tool-alert-title" className={`${mk.h2} mt-4`}>
            Get Tariff Alerts{" "}
            <span className={mk.accent}>before it costs you.</span>
          </h2>
          <p className={`${mk.lead} mt-4`}>
            Get notified when new tariffs affect your imports by email, in-app,
            Slack or Teams.
          </p>
          <Points
            items={[
              "Filtered to your HTS codes and countries",
              "The rate before and after, and the change in %",
              "AD/CVD alerts when an import may fall under a case",
              "Impact checks: see exactly how any tariff action hits each import",
              "Insights, Tariff News, rate history and exports to CSV or Excel",
              `From ${formatPrice(ALERT_TIERS[0].price)}/mo, less than $1 per product`,
            ]}
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/tariff-alerts" className={mk.buttonPrimary}>
              Get Tariff Alerts <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Calculate */}
    <section className={mk.band} aria-labelledby="tool-calc-title">
      <div
        className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
      >
        <div>
          <Step verb="Calculate" />
          <h2 id="tool-calc-title" className={`${mk.h2} mt-4`}>
            See the duty for any import,{" "}
            <span className={mk.accent}>line by line.</span>
          </h2>
          <p className={`${mk.lead} mt-4`}>
            We show you the base rate, Chapter 99 tariffs,
            exemptions, trade preferences and fees, for any HTS code and country
            of origin. Free and unlimited. Free accounts can also see the antidumping and countervailing duty cases that may cover
            it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/duty-calculator" className={`${mk.buttonPrimary} h-14 px-8 text-lg shadow-lg shadow-base-content/10`}>
              Try Tariff Calculator
              <ArrowRightIcon className="h-5 w-5" aria-hidden />
            </Link>
            {/* <span className="text-sm text-slate-500 skin:text-base-content/60">Free and unlimited · No sign-up</span> */}
          </div>
        </div>
        {example && (
          <Reveal>
            <CalculationTerminal
              example={example}
              revision={facts.latestRevisionTitle}
            />
          </Reveal>
        )}
      </div>
    </section>

    {/* Discover savings */}
    {savings.length > 0 && (
      <section
        className={`relative overflow-hidden ${mk.band} ${darkBand}`}
        aria-labelledby="tool-savings-title"
      >
        <div aria-hidden className={glow} />
        <div
          className={`${mk.container} relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
        >
          <div>
            <Step verb="Discover savings" />
            <h2 id="tool-savings-title" className={`${mk.h2} mt-4`}>
              Pay less duty{" "}
              <span className={mk.accent}>on the same products.</span>
            </h2>
            <p className={`${mk.lead} mt-4`}>
              Most savings hide in the products you already import: an exemption
              nobody claimed, or a trade program left off the entry. HTS Hero
              checks every product for both, then prices every other country of
              origin.
            </p>
            <Points
              items={[
                "Exemptions you may qualify for but aren't claiming",
                "Trade programs like USMCA, checked on every product",
                "Your duty from every other country of origin",
              ]}
            />
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/tariff-audit" className={moneyButtonMd}>
                Find Savings <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <Reveal>
            <div className={followPage}>
              <SavingsFinder examples={savings} />
            </div>
          </Reveal>
        </div>
      </section>
    )}
  </>
);
