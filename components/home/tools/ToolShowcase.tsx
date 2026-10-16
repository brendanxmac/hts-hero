import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { CalculationTerminal, CatalogFrame } from "@/components/tariff-monitor";
import { RecalcTerminal } from "@/components/tariff-audit";
import { Reveal } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import {
  TRACKER_TIERS,
  TRIAL_ALLOWANCE,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { AUDITS_ENABLED, SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";
import type { WorkedExample } from "@/libs/duty-calculator-content";
import type { AuditExample } from "@/libs/tariff-audit-example";
import type { SavingsExample } from "@/libs/tariff-savings-example";
import type { MonitorFacts } from "@/components/tariff-monitor/lib/facts";
import { OFFER } from "../lib/offer";
import { SavingsFinder } from "../savings/SavingsFinder";
import { darkBand, followPage, glow, moneyButtonMd } from "../lib/theme";

// The four capabilities, one block each, every one with a real visual and its own call to action:
// calculate (with the lookup), alert, discover savings, audit; then classification. The order
// follows the hero's scan: changes, savings, audits. Tracker MVP (MVP_TRIM.md): the savings and
// audit blocks only render with SAVINGS_ENABLED / AUDITS_ENABLED, so it's calculate, then alert.

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

const Step = ({ n, verb }: { n: string; verb: string }) => (
  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-primary">
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-base-content text-xs text-base-100">
      {n}
    </span>
    {verb}
  </p>
);

export const ToolShowcase = ({
  example,
  audit,
  savings,
  facts,
}: {
  example: WorkedExample | null;
  audit: AuditExample | null;
  savings: SavingsExample[];
  facts: MonitorFacts;
}) => (
  <>
    {/* Calculate */}
    <section className={mk.band} aria-labelledby="tool-calc-title">
      <div
        className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
      >
        <div>
          <Step n="1" verb="Calculate" />
          <h2 id="tool-calc-title" className={`${mk.h2} mt-4`}>
            The exact duty on any import,{" "}
            <span className={mk.accent}>line by line.</span>
          </h2>
          <p className={`${mk.lead} mt-4`}>
            Base rate, every Chapter 99 tariff with its legal source,
            exemptions, trade preferences and fees, for any HTS code and country
            of origin. Free and unlimited.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/duty-calculator" className={`${mk.buttonPrimary} h-14 px-8 text-lg shadow-lg shadow-base-content/10`}>
              Calculate duty
              <ArrowRightIcon className="h-5 w-5" aria-hidden />
            </Link>
            <span className="text-sm text-slate-500 skin:text-base-content/60">Free and unlimited · No sign-up</span>
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

    {/* Alert */}
    <section
      className={`${mk.band} ${mk.bandMuted}`}
      aria-labelledby="tool-alert-title"
    >
      <div
        className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
      >
        <Reveal className="pb-10 lg:order-1">
          <CatalogFrame />
        </Reveal>
        <div className="lg:order-2">
          <Step n="2" verb="Alert" />
          <h2 id="tool-alert-title" className={`${mk.h2} mt-4`}>
            Hear about every change{" "}
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
              "Impact checks: see exactly how any tariff action hits each import",
              "Tariff News, rate history and exports to CSV or Excel",
              `Track ${TRIAL_ALLOWANCE.alertImports} imports free, then from ${formatPrice(TRACKER_TIERS[0].price)}/mo`,
            ]}
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={OFFER.href} className={mk.buttonPrimary}>
              Track {TRIAL_ALLOWANCE.alertImports} imports free <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/tariff-monitor" className={mk.link}>
              How the Tariff Tracker works
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Discover savings */}
    {SAVINGS_ENABLED && savings.length > 0 && (
      <section
        className={`relative overflow-hidden ${mk.band} ${darkBand}`}
        aria-labelledby="tool-savings-title"
      >
        <div aria-hidden className={glow} />
        <div
          className={`${mk.container} relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
        >
          <div>
            <Step n="3" verb="Discover savings" />
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
                "Exemptions you qualify for but aren't claiming",
                "Trade programs like USMCA, checked on every product",
                "Your duty from every other country of origin",
              ]}
            />
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={OFFER.href} className={moneyButtonMd}>
                Find your savings{" "}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/tariff-monitor"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                How the Tariff Tracker works
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

    {/* Audit */}
    {AUDITS_ENABLED && (
      <section className={mk.band} aria-labelledby="tool-audit-title">
        <div
          className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
        >
          <div>
            <Step n="4" verb="Audit" />
            <h2 id="tool-audit-title" className={`${mk.h2} mt-4`}>
              Find the duty you overpaid.{" "}
              <span className={mk.accent}>Get it back.</span>
            </h2>
            <p className={`${mk.lead} mt-4`}>
              Every past entry recalculated with the rules in force on its entry
              date: wrong stacking, missed exemptions, and refundable tariffs like
              IEEPA, flagged for your broker to file.
            </p>
            <Points
              items={[
                "Paid vs. owed, line by line",
                "Where IEEPA and Section 122 refunds stand",
                `${TRIAL_ALLOWANCE.auditChecks} free audit checks, or we'll do it for you`,
              ]}
            />
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/tariff-audit" className={mk.buttonPrimary}>
                Run a free audit{" "}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/tariff-audit#request" className={mk.link}>
                Request an audit
              </Link>
            </div>
          </div>
          {audit && (
            <Reveal>
              <RecalcTerminal example={audit} />
            </Reveal>
          )}
        </div>
      </section>
    )}
  </>
);
