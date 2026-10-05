"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Countries, Country } from "../../constants/countries";
// Types only: the engine and its tariff data load on demand, below
import type { MicroEstimate } from "../../libs/hts-micro-estimate";
import { CountryField } from "../duty-calculator/CountryField";
import { formatDate, formatMoney, formatPct } from "../duty-calculator/format";
import styles from "../duty-calculator/theme.module.css";

// A quick duty estimate on the /hts/[code] page: pick a country, see the calculator's
// headline figures, then open the calculator for the rest. The first estimate is
// server-rendered; the tariff engine downloads only once the visitor reaches for another
// country, so the page stays light for everyone who doesn't.

const CUSTOMS_VALUE = 10000;

const COLORS = ["var(--dc-chart-1)", "var(--dc-chart-2)", "var(--dc-chart-3)", "var(--dc-chart-4)", "var(--dc-chart-5)"];
const FEES_COLOR = "var(--dc-chart-6)";

let engine: Promise<typeof import("../../libs/hts-micro-estimate")> | null = null;
const loadEngine = () => (engine ??= import("../../libs/hts-micro-estimate"));

export const MicroCalculator = ({
  htsno,
  baseRates,
  initial,
}: {
  htsno: string;
  baseRates: { general: string | null; special: string | null; other: string | null };
  initial: MicroEstimate;
}) => {
  const [country, setCountry] = useState<Country | null>(
    Countries.find((c) => c.code === initial.country) ?? null,
  );
  const [estimate, setEstimate] = useState<MicroEstimate | null>(initial);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const latest = useRef(0);

  const pick = async (next: Country | null) => {
    setCountry(next);
    setFailed(false);
    if (!next) return;
    const request = ++latest.current;
    setLoading(true);
    try {
      const { microEstimate } = await loadEngine();
      const result = microEstimate({ htsCode: htsno, baseRates, country: next.code, asOf: initial.asOf });
      if (request === latest.current) setEstimate(result);
    } catch (error) {
      console.error("Duty estimate failed:", error);
      if (request === latest.current) setFailed(true);
    } finally {
      if (request === latest.current) setLoading(false);
    }
  };

  const shown = country && estimate?.country === country.code ? estimate : null;
  const calculatorHref =
    `/duty-calculator?code=${htsno}` +
    (country ? `&country=${country.code}&value=${CUSTOMS_VALUE}&date=${initial.asOf}&mode=ocean` : "");

  // The hook to open the calculator: what this quick estimate leaves out
  const exemptions = shown?.openQuestions ?? 0;
  const preference = shown?.preferences[0];
  const hook =
    exemptions > 0 && preference
      ? `${exemptions} exemption${exemptions === 1 ? "" : "s"} and ${preference} could lower it. Check them against your real shipment details.`
      : exemptions > 0
        ? `${exemptions} exemption${exemptions === 1 ? "" : "s"} could lower it. Check them against your real shipment details.`
        : preference
          ? `${preference} could lower it. Check whether your shipment qualifies.`
          : "Tariffs stack and change often. Check your exact shipment, line by line.";

  return (
    <section
      id="estimate"
      aria-labelledby="estimate-title"
      className="scroll-mt-6 overflow-hidden rounded-[8px] border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow-pop)]"
    >
      <div className="flex flex-col gap-3 border-b border-[var(--dc-border)] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id="estimate-title" className="text-[16px] font-semibold tracking-tight text-[var(--dc-text)]">
            Estimated Duty on {htsno}
          </h2>
          <p className="text-[12.5px] text-[var(--dc-text-3)]">
            {formatMoney(CUSTOMS_VALUE)} by ocean, entered {formatDate(initial.asOf)}
            {shown?.requiresQuantity && " · 1,000 units"}
          </p>
        </div>
        {/* Start fetching the engine as soon as the visitor reaches for the field */}
        <div className="flex w-full items-center gap-3 sm:w-auto shrink-0" onPointerEnter={loadEngine} onFocusCapture={loadEngine}>
          <label htmlFor="estimate-country" className="text-[13px] font-semibold text-[var(--dc-text-2)] whitespace-nowrap">
            Country of origin
          </label>
          <div className="w-full sm:w-[280px]">
            <CountryField
              id="estimate-country"
              selected={country ? [country] : []}
              onChange={(next) => pick(next[0] ?? null)}
              max={1}
            />
          </div>
        </div>
      </div>

      {shown ? (
        <div className={`transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading} aria-live="polite">
          <Stats estimate={shown} />
          <CostBar slices={shown.slices} />
        </div>
      ) : (
        <div className="flex min-h-[150px] items-center justify-center px-6 py-8 text-center text-[14.5px] text-[var(--dc-text-2)]" aria-live="polite">
          {failed
            ? "Couldn't calculate this estimate. Try again, or open the full calculator."
            : loading
              ? "Calculating…"
              : "Choose a country of origin to see the duty."}
        </div>
      )}

      {/* The way on: what this quick estimate leaves out, and the calculator that doesn't */}
      <div className="flex flex-col gap-3 border-t border-[var(--dc-accent-border)] bg-[var(--dc-accent-soft)] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-[15.5px] font-semibold leading-snug text-[var(--dc-text)]">
            {shown && shown.totalDuty > 0
              ? `Is ${formatMoney(shown.totalDuty)} really what you'll owe?`
              : "Make sure this shipment really enters duty-free."}
          </p>
          <p className="mt-0.5 text-[13.5px] text-[var(--dc-text-2)]">{hook}</p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch sm:items-center gap-1">
          {/* nofollow: calculator links with parameters all canonicalize to /duty-calculator */}
          <Link
            href={calculatorHref}
            rel="nofollow"
            className={`${styles.buttonPrimary} !h-11 !px-5 !text-[15px] justify-center shadow-[var(--dc-shadow-pop)]`}
          >
            Find my exact duty
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <span className="text-center text-[11.5px] text-[var(--dc-text-3)]">Free · No sign-up</span>
        </div>
      </div>
    </section>
  );
};

// The calculator's headline figures
const Stats = ({ estimate }: { estimate: MicroEstimate }) => {
  const dutyAndFees = estimate.totalDuty + estimate.totalFees;
  const effectiveRate = (estimate.totalDuty / CUSTOMS_VALUE) * 100;
  return (
    // 1px gaps over the border color draw the dividers at every breakpoint
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.45fr_1fr_1fr_1fr] gap-px bg-[var(--dc-border)] border-b border-[var(--dc-border)]">
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 px-5 py-3 bg-[var(--dc-surface)]">
        <div className={styles.eyebrow}>Total duty</div>
        <div className={`${styles.num} mt-1 text-[28px] leading-none font-semibold tracking-tight text-[var(--dc-text)]`}>
          {formatMoney(estimate.totalDuty)}
        </div>
        <div className={`${styles.num} mt-1 text-[13px] text-[var(--dc-text-2)]`}>
          {formatPct(Math.round(effectiveRate * 100) / 100)} effective rate
        </div>
      </div>
      <Stat label="Fees" value={formatMoney(estimate.totalFees)} note={estimate.fees} />
      <Stat label="Duty + fees" value={formatMoney(dutyAndFees)} note="Payable to CBP" />
      <Stat
        label="Landed cost"
        value={formatMoney(CUSTOMS_VALUE + dutyAndFees)}
        note={`On ${formatMoney(CUSTOMS_VALUE)} customs value`}
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
};

const Stat = ({ label, value, note, className = "" }: { label: string; value: string; note: string; className?: string }) => (
  <div className={`px-5 py-3 bg-[var(--dc-surface)] ${className}`}>
    <div className={styles.eyebrow}>{label}</div>
    <div className={`${styles.num} mt-1 text-[19px] leading-none font-semibold tracking-tight text-[var(--dc-text)]`}>
      {value}
    </div>
    <div className="mt-1 text-[12.5px] text-[var(--dc-text-3)]">{note}</div>
  </div>
);

// Where the money goes, as one stacked bar
const CostBar = ({ slices }: { slices: MicroEstimate["slices"] }) => {
  const colored = slices.map((s, i) => ({
    ...s,
    color: s.label === "Customs fees" ? FEES_COLOR : COLORS[i % COLORS.length],
  }));
  const shown = colored.filter((s) => s.amount > 0);
  const total = shown.reduce((sum, s) => sum + s.amount, 0);
  if (total <= 0) return null;
  return (
    <div className="flex flex-col gap-2 px-5 py-3">
      <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-[5px] bg-[var(--dc-surface-3)]" aria-hidden>
        {shown.map((s) => (
          <div key={s.label} className="h-full min-w-[3px]" style={{ width: `${(s.amount / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px]">
        {shown.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden />
            <span className="text-[var(--dc-text-2)]">{s.label}</span>
            <span className={`${styles.num} font-semibold`}>{formatMoney(s.amount)}</span>
            <span className={`${styles.num} text-[var(--dc-text-3)]`}>{Math.round((s.amount / total) * 1000) / 10}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
