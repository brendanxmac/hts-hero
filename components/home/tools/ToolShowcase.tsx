import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { CalculationTerminal, CatalogFrame } from "@/components/tariff-monitor";
import { RecalcTerminal } from "@/components/tariff-audit";
import { Reveal } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { ComingChip } from "@/components/ui/marketing/ComingChip";
import { AUTO_AUDITING, SAVINGS_DETECTION } from "@/components/ui/marketing/comingSoon";
import {
  LOWEST_PER_IMPORT,
  REVERSE_TRIAL,
  TRACKER_TIERS,
  TRIAL_ALLOWANCE,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { AUDITS_ENABLED, MARKET_AUDITS, MARKET_SAVINGS, SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";
import type { WorkedExample } from "@/libs/duty-calculator-content";
import type { AuditExample } from "@/libs/tariff-audit-example";
import type { SavingsExample } from "@/libs/tariff-savings-example";
import type { MonitorFacts } from "@/components/tariff-monitor/lib/facts";
import { OFFER } from "../lib/offer";
import { SavingsFinder } from "../savings/SavingsFinder";
import { darkBand, followPage, glow, moneyButtonMd } from "../lib/theme";

// The four capabilities, one block each, every one with a real visual and its own call to action:
// calculate (with the lookup), alert, discover savings, audit; then classification. The order
// follows the hero's scan: changes, savings, audits. The savings and audit blocks show ahead of the
// Tracker (MARKET_SAVINGS / MARKET_AUDITS): while a feature is off it carries the "Coming Oct 2026"
// chip and its self-serve button reads "Coming soon" (the audit request form works either way).

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

const Step = ({ n, verb, coming = false }: { n: string; verb: string; coming?: boolean }) => (
  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-primary">
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-base-content text-xs text-base-100">
      {n}
    </span>
    {verb}
    {coming && <ComingChip className="normal-case tracking-normal" />}
  </p>
);

// A self-serve button for a feature that isn't live in the Tracker yet
const SoonButton = ({ className }: { className: string }) => (
  <span className={`${className} cursor-default opacity-60`} aria-disabled="true">
    Coming soon
  </span>
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
            of origin. Free and unlimited. A free account adds the AD/CVD
            check: the antidumping and countervailing duty cases that may cover
            it.
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
              "AD/CVD alerts when an import may fall under a case",
              "Impact checks: see exactly how any tariff action hits each import",
              "Insights, Tariff News, rate history and exports to CSV or Excel",
              `Free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, then from ${formatPrice(TRACKER_TIERS[0].price)}/mo, as low as ${formatPrice(LOWEST_PER_IMPORT)} per import`,
            ]}
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={OFFER.href} className={mk.buttonPrimary}>
              Try it free for {REVERSE_TRIAL.days} days <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/tariff-monitor" className={mk.link}>
              How the Tariff Tracker works
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Discover savings */}
    {MARKET_SAVINGS && savings.length > 0 && (
      <section
        className={`relative overflow-hidden ${mk.band} ${darkBand}`}
        aria-labelledby="tool-savings-title"
      >
        <div aria-hidden className={glow} />
        <div
          className={`${mk.container} relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
        >
          <div>
            <Step n="3" verb="Discover savings" coming={!SAVINGS_ENABLED} />
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
              {SAVINGS_ENABLED ? (
                <Link href={OFFER.href} className={moneyButtonMd}>
                  Find your savings{" "}
                  <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <SoonButton className={moneyButtonMd} />
              )}
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
    {MARKET_AUDITS && (
      <section className={mk.band} aria-labelledby="tool-audit-title">
        <div
          className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-2`}
        >
          <div>
            <Step n="4" verb="Audit" coming={!AUDITS_ENABLED} />
            <h2 id="tool-audit-title" className={`${mk.h2} mt-4`}>
              Find duty you may have overpaid.{" "}
              <span className={mk.accent}>See what you could get back.</span>
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
                AUDITS_ENABLED
                  ? `${TRIAL_ALLOWANCE.auditChecks} free audit checks, or we'll do it for you`
                  : "Or request an audit now and we'll do it for you",
              ]}
            />
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {AUDITS_ENABLED ? (
                <Link href="/tariff-audit" className={mk.buttonPrimary}>
                  Run a free audit{" "}
                  <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <SoonButton className={mk.buttonPrimary} />
              )}
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

    {/* Savings and audits while they're off: what's coming, labeled (never shown as live) */}
    {!MARKET_SAVINGS && !MARKET_AUDITS && (
      <section
        className={`${mk.bandMuted} py-16 sm:py-20`}
        aria-labelledby="tool-coming-title"
      >
        <div className={mk.container}>
          <Step n="3" verb="Coming next" />
          <h2 id="tool-coming-title" className={`${mk.h2} mt-4 max-w-3xl`}>
            Savings and audits,{" "}
            <span className={mk.accent}>on every import.</span>
          </h2>
          <p className={`${mk.lead} mt-4 max-w-3xl`}>
            Included in the trial and every Tariff Tracker plan at no extra
            cost when they launch.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {[SAVINGS_DETECTION, AUTO_AUDITING].map(({ title, text }) => (
              <li key={title} className={`${mk.card} flex flex-col gap-3 p-7`}>
                <span className="flex flex-wrap items-center gap-2">
                  <span className={mk.h3}>{title}</span>
                  <ComingChip />
                </span>
                <span className={mk.body}>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )}
  </>
);
