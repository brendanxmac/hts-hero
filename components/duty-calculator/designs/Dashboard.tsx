"use client";

import { ReactNode } from "react";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TrophyIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { CalculationResult, Question } from "../../../tariffs/engine-v2/types";
import { CompareEntry } from "../Compare";
import { CountryField } from "../CountryField";
import { NumberField } from "../controls";
import { formatDate, formatMoney, formatPct, mono, TRANSPORT_MODES } from "../format";
import { HtsCodeField } from "../HtsCodeField";
import { BasisPanel, COLUMN_LABEL, Impact, NotAppliedPanel, programName } from "../Results";
import { emptyTitle, ExampleButtons, PreferenceSelect, ShareButtons, VerifiedNotice, ViewSwitch } from "../shared";
import { MAX_COMPARE, TariffFinder } from "../useTariffFinder";
import styles from "../theme.module.css";

// Dashboard: inputs in a bar that stays put, results as cards you can scan. Visual first:
// where the money goes, then one card per charge, then what could lower it.

const CHART = ["var(--dc-chart-1)", "var(--dc-chart-2)", "var(--dc-chart-3)", "var(--dc-chart-4)", "var(--dc-chart-5)"];
const FEES_COLOR = "var(--dc-chart-6)";

interface Slice {
  label: string;
  amount: number;
  color: string;
}

// Base duty, then one slice per program, then fees
const slices = (result: CalculationResult): Slice[] => {
  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) => byProgram.set(programName(l.program), (byProgram.get(programName(l.program)) ?? 0) + l.amount));
  return [
    { label: "Base duty", amount: result.base.amount, color: CHART[0] },
    ...Array.from(byProgram).map(([label, amount], i) => ({
      label,
      amount,
      color: CHART[(i + 1) % CHART.length],
    })),
    { label: "Customs fees", amount: result.totalFees, color: FEES_COLOR },
  ];
};

export const DashboardDesign = ({ f }: { f: TariffFinder }) => {
  const { result, selectedElement, country } = f;
  const ready = !f.loading && result && selectedElement && country;

  return (
    <div className="flex flex-col gap-5">
      <InputBar f={f} />

      {!f.loading && !ready && (
        <div className={`${styles.card} p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center`}>
          <div>
            <div className="text-[18px] font-semibold tracking-tight">{emptyTitle(f)}</div>
            <p className="mt-1 text-[14px] text-[var(--dc-text-2)]">
              You&apos;ll see where every dollar goes, one card per charge, and what could lower it.
            </p>
          </div>
          <ExampleButtons onExample={f.selectExample} compact />
        </div>
      )}

      {ready && (
        <section className="flex flex-col gap-5" aria-label="Duty estimate" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold tracking-tight">
                {f.comparing ? "Comparing origins" : "Your duty at a glance"}
              </h2>
              <p className="text-[13px] text-[var(--dc-text-3)]">
                <span className={`${mono.className} font-semibold text-[var(--dc-text-2)]`}>{result.htsCode}</span> ·{" "}
                {formatDate(result.asOf)} · {f.transportLabel} · {formatMoney(f.customsValue)} customs value
              </p>
              <p className="text-[12.5px] text-[var(--dc-text-3)] truncate max-w-[720px]" title={f.codeDescription}>
                {f.codeDescription}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ViewSwitch f={f} className="flex-1 sm:flex-none" />
              <ShareButtons f={f} />
            </div>
          </div>

          <VerifiedNotice f={f} />

          {f.comparing ? (
            <CompareDashboard f={f} />
          ) : f.view === "simple" ? (
            <div className="mx-auto w-full max-w-[560px]">
              <BreakdownCard f={f} result={result} large />
              {f.openQuestions > 0 && (
                <button
                  type="button"
                  className={`${styles.button} mt-4 mx-auto flex`}
                  onClick={() => f.changeView("detailed")}
                >
                  <SparklesIcon className="w-4 h-4 text-[var(--dc-accent)]" />
                  {f.openQuestions === 1 ? "1 question" : `${f.openQuestions} questions`} could lower this
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-5">
                  <BreakdownCard f={f} result={result} />
                </div>
                <div className="lg:col-span-7 flex flex-col gap-5">
                  <Kpis f={f} result={result} />
                  <LandedBar f={f} result={result} />
                </div>
              </div>

              <ChargeCards f={f} result={result} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7">
                  <Savings f={f} result={result} />
                </div>
                <div className="lg:col-span-5 flex flex-col gap-5">
                  <BasisPanel
                    result={result}
                    revision={f.revisionForDate}
                    verified={f.verified}
                    htsRevisionName={f.htsRevisionName}
                    transportMode={f.transportMode}
                  />
                  <NotAppliedPanel lines={result.lines} />
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};

// ── Inputs ──

const BarField = ({ label, htmlFor, children, className = "" }: { label: string; htmlFor?: string; children: ReactNode; className?: string }) => (
  <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
    <label htmlFor={htmlFor} className="text-[11.5px] font-semibold text-[var(--dc-text-3)]">
      {label}
    </label>
    {children}
  </div>
);

const InputBar = ({ f }: { f: TariffFinder }) => {
  const { result } = f;
  const extra = Boolean(result?.requiresQuantity) || Boolean(result?.availablePreferences.length && !f.comparing);
  return (
    <div
      className={`${styles.card} sticky top-2 z-20 p-3 sm:p-4`}
      style={{ boxShadow: "var(--dc-shadow-pop)", backdropFilter: "blur(8px)" }}
      role="group"
      aria-label="Entry details"
    >
      {f.loading ? (
        <div className={`${styles.skeleton} h-[66px] w-full`} aria-busy="true" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-[1.5fr_1.6fr_1fr_1fr_0.9fr] gap-3 items-end">
          <BarField label="HTS code" htmlFor="db-hts" className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 min-w-0">
                <HtsCodeField
                  id="db-hts"
                  selectedElement={f.selectedElement}
                  onSelect={(el) => f.selectElement(el, "hts_selector")}
                  autoFocus={!f.codeParam}
                  hidePath
                />
              </div>
              <button
                type="button"
                className={`${styles.button} shrink-0`}
                style={{ height: 46, width: 46, padding: 0, justifyContent: "center" }}
                onClick={() => f.openExplore()}
                aria-label="Search by description"
                title="Search by description"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
            </div>
          </BarField>
          <BarField
            label={f.countries.length > 1 ? `Origins (${f.countries.length}/${MAX_COMPARE})` : "Origin"}
            htmlFor="db-country"
            className="col-span-2 md:col-span-3 lg:col-span-1"
          >
            <CountryField id="db-country" selected={f.countries} onChange={f.changeCountries} max={MAX_COMPARE} />
          </BarField>
          <BarField label="Customs value" htmlFor="db-value" className="md:col-span-2 lg:col-span-1">
            <NumberField id="db-value" prefix="$" value={f.customsValue} onChange={f.setCustomsValue} />
          </BarField>
          <BarField label="Entry date" htmlFor="db-date" className="md:col-span-2 lg:col-span-1">
            <input
              id="db-date"
              type="date"
              className={`${styles.input} ${styles.num} px-3`}
              value={f.entryDate}
              onChange={(e) => f.setEntryDate(e.target.value)}
            />
          </BarField>
          <BarField label="Transport" htmlFor="db-mode" className="col-span-2 md:col-span-2 lg:col-span-1">
            <select
              id="db-mode"
              className={`${styles.input} appearance-none`}
              value={f.transportMode}
              onChange={(e) => f.setTransportMode(e.target.value as typeof f.transportMode)}
            >
              {TRANSPORT_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </BarField>
          {extra && (
            <div className="col-span-2 md:col-span-6 lg:col-span-5 flex flex-wrap gap-3">
              {result?.requiresQuantity && (
                <BarField label="Quantity" htmlFor="db-qty" className="w-[200px]">
                  <NumberField id="db-qty" suffix={f.unitLabel} value={f.quantity} onChange={f.setQuantity} />
                </BarField>
              )}
              {result && result.availablePreferences.length > 0 && !f.comparing && (
                <BarField label="Trade preference" htmlFor="db-pref" className="w-full sm:w-[320px]">
                  <PreferenceSelect f={f} id="db-pref" />
                </BarField>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Charts ──

const Donut = ({ data, size, children }: { data: Slice[]; size: number; children: ReactNode }) => {
  const stroke = size * 0.13;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((sum, s) => sum + s.amount, 0);
  const gap = data.filter((s) => s.amount > 0).length > 1 ? 2 : 0;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--dc-surface-3)" strokeWidth={stroke} />
        {total > 0 &&
          data
            .filter((s) => s.amount > 0)
            .map((s) => {
              const length = (s.amount / total) * circumference;
              const dash = Math.max(length - gap, 0.5);
              const el = (
                <circle
                  key={s.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return el;
            })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
};

const BreakdownCard = ({ f, result, large }: { f: TariffFinder; result: CalculationResult; large?: boolean }) => {
  const data = slices(result);
  const total = result.totalDuty + result.totalFees;
  return (
    <div className={`${styles.card} h-full p-5 sm:p-6 flex flex-col gap-5`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Where the money goes</h3>
        <span className="text-[12.5px] text-[var(--dc-text-3)]">
          {f.country?.flag} {f.country?.name}
        </span>
      </div>
      <div className={`flex ${large ? "flex-col" : "flex-col sm:flex-row"} items-center gap-6`}>
        <Donut data={data} size={large ? 240 : 188}>
          <span className={styles.eyebrow}>Duty + fees</span>
          <span className={`${styles.num} ${large ? "text-[30px]" : "text-[22px]"} mt-1 font-semibold tracking-tight leading-none`}>
            {formatMoney(total)}
          </span>
          <span className={`${styles.num} mt-1 text-[12px] text-[var(--dc-text-3)]`}>
            {formatPct(Math.round((f.customsValue > 0 ? (total / f.customsValue) * 100 : 0) * 100) / 100)} of value
          </span>
        </Donut>
        <ul className="w-full min-w-0 flex-1 flex flex-col gap-3">
          {data.map((s) => (
            <li key={s.label} className="flex items-start gap-2.5 text-[13.5px]">
              <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
              <span className="flex-1 min-w-0 leading-snug text-[var(--dc-text-2)]">{s.label}</span>
              <span className="flex flex-col items-end">
                <span className={`${styles.num} font-semibold`}>{formatMoney(s.amount)}</span>
                <span className={`${styles.num} text-[12px] text-[var(--dc-text-3)]`}>
                  {total > 0 ? `${Math.round((s.amount / total) * 100)}%` : "—"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Kpis = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const effective = f.customsValue > 0 ? (result.totalDuty / f.customsValue) * 100 : 0;
  const tiles: { label: string; value: string; note: string; accent?: boolean }[] = [
    { label: "Total duty", value: formatMoney(result.totalDuty), note: `${result.lines.filter((l) => l.status === "applies").length + 1} charges`, accent: true },
    { label: "Effective rate", value: formatPct(Math.round(effective * 100) / 100), note: `Base rate ${formatPct(Math.round(result.baseRateEquivalentPct * 100) / 100)}` },
    { label: "Customs fees", value: formatMoney(result.totalFees), note: result.fees.map((x) => x.id.toUpperCase()).join(" + ") || "None" },
    { label: "Landed cost", value: formatMoney(f.customsValue + result.totalDuty + result.totalFees), note: "Goods, duty and fees" },
  ];
  return (
    <div className="grid grid-cols-2 gap-5">
      {tiles.map((t) => (
        <div key={t.label} className={`${styles.card} p-4 sm:p-5`}>
          <div className={styles.eyebrow}>{t.label}</div>
          <div
            className={`${styles.num} mt-2 text-[22px] sm:text-[26px] leading-none font-semibold tracking-tight ${
              t.accent ? "text-[var(--dc-accent)]" : ""
            }`}
          >
            {t.value}
          </div>
          <div className="mt-2 text-[12.5px] text-[var(--dc-text-3)] truncate">{t.note}</div>
        </div>
      ))}
    </div>
  );
};

// Goods, duty and fees as one bar, so the duty's share of the landed cost is obvious
const LandedBar = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const landed = f.customsValue + result.totalDuty + result.totalFees;
  const parts = [
    { label: "Goods", amount: f.customsValue, color: "var(--dc-surface-3)" },
    { label: "Duty", amount: result.totalDuty, color: "var(--dc-chart-1)" },
    { label: "Fees", amount: result.totalFees, color: FEES_COLOR },
  ];
  return (
    <div className={`${styles.card} p-4 sm:p-5 flex-1 flex flex-col justify-center gap-3`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[14px] font-semibold">Landed cost</h3>
        <span className={`${styles.num} text-[14px] font-semibold`}>{formatMoney(landed)}</span>
      </div>
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-[var(--dc-surface-2)]" role="img" aria-label="Landed cost split into goods, duty and fees">
        {landed > 0 &&
          parts.map((p) => (
            <span key={p.label} style={{ width: `${(p.amount / landed) * 100}%`, background: p.color }} className="h-full" />
          ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-[var(--dc-text-2)]">
        {parts.map((p) => (
          <span key={p.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-[var(--dc-border-strong)]" style={{ background: p.color }} aria-hidden />
            {p.label}
            <span className={`${styles.num} font-semibold text-[var(--dc-text)]`}>
              {landed > 0 ? `${Math.round((p.amount / landed) * 1000) / 10}%` : "—"}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── One card per charge ──

const ChargeCards = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const applied = result.lines.filter((l) => l.status === "applies");
  const programColor = (program?: string) => {
    const index = slices(result).findIndex((s) => s.label === programName(program));
    return index >= 0 ? slices(result)[index].color : CHART[1];
  };
  const itemized = result.baseParts.length > 1 || result.baseParts.some((p) => p.kind === "amount" || p.component);
  return (
    <div>
      <h3 className="mb-3 text-[15px] font-semibold">What you&apos;re paying</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Charge
          color={CHART[0]}
          code="Base"
          title={`Base duty · ${COLUMN_LABEL[result.column]}${result.claimedPreference ? ` (${result.claimedPreference})` : ""}`}
          amount={result.base.amount}
          rate={itemized ? undefined : result.base.reasons[0] ?? "Free"}
        >
          {itemized ? (
            <ul className="flex flex-col gap-1">
              {result.baseParts.map((p, i) => (
                <li key={i} className={`${styles.num} flex justify-between gap-3`}>
                  <span>
                    {p.raw}
                    {p.assumed && <span className="text-[var(--dc-warning)]"> · assumed</span>}
                  </span>
                  <span className="font-medium text-[var(--dc-text)]">{formatMoney(p.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            `The normal HTS rate for ${f.country?.name}, on ${formatMoney(result.base.basisValue)}.`
          )}
        </Charge>
        {applied.map((line) => (
          <Charge
            key={line.code}
            color={programColor(line.program)}
            code={line.code}
            title={programName(line.program)}
            amount={line.amount}
            rate={line.ratePct !== undefined ? formatPct(line.ratePct) : undefined}
          >
            {line.name}
            {line.reasons.length > 0 && <span className="block mt-1 text-[var(--dc-text-3)]">{line.reasons.join(" · ")}</span>}
          </Charge>
        ))}
        {result.fees.length > 0 && (
          <Charge color={FEES_COLOR} code="Fees" title="Customs fees" amount={result.totalFees}>
            <ul className="flex flex-col gap-1">
              {result.fees.map((fee) => (
                <li key={fee.id} className={`${styles.num} flex justify-between gap-3`}>
                  <span>
                    {fee.name} ({formatPct(fee.ratePct)})
                  </span>
                  <span className="font-medium text-[var(--dc-text)]">{formatMoney(fee.amount)}</span>
                </li>
              ))}
            </ul>
          </Charge>
        )}
      </div>
    </div>
  );
};

const Charge = ({
  color,
  code,
  title,
  amount,
  rate,
  children,
}: {
  color: string;
  code: string;
  title: string;
  amount: number;
  rate?: string;
  children: ReactNode;
}) => (
  <article className={`${styles.card} relative overflow-hidden p-4 sm:p-5 flex flex-col gap-3`}>
    <span className="absolute inset-y-0 left-0 w-1" style={{ background: color }} aria-hidden />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className={`${mono.className} text-[12.5px] font-semibold text-[var(--dc-text-3)]`}>{code}</div>
        <div className="text-[14.5px] font-semibold leading-snug">{title}</div>
      </div>
      {rate && (
        <span className={`${styles.num} shrink-0 rounded-full bg-[var(--dc-surface-2)] border border-[var(--dc-border)] px-2 py-0.5 text-[12px] font-semibold`}>
          {rate}
        </span>
      )}
    </div>
    <div className={`${styles.num} text-[24px] leading-none font-semibold tracking-tight`}>{formatMoney(amount)}</div>
    <div className="text-[13px] leading-snug text-[var(--dc-text-2)]">{children}</div>
  </article>
);

// ── What could lower it ──

const Savings = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const matters = (q: Question) =>
    q.answered || f.answers[q.input.id] !== undefined || q.input.type !== "boolean" || Math.abs(f.impacts[q.input.id] ?? 0) >= 0.005;
  // Values first (they're part of the base rate), then savings, then charges that only apply
  // once confirmed. Engine order within each group, so answering one never reshuffles the list.
  const relevant = result.questions.filter(matters);
  const values = relevant.filter((q) => q.input.type !== "boolean");
  const savings = relevant.filter((q) => q.input.type === "boolean" && (f.impacts[q.input.id] ?? 0) <= 0);
  const extras = relevant.filter((q) => q.input.type === "boolean" && (f.impacts[q.input.id] ?? 0) > 0);
  // The biggest single saving; savings don't always add up, since exemptions can overlap
  const potential = Math.min(0, ...savings.filter((q) => f.answers[q.input.id] !== true).map((q) => f.impacts[q.input.id] ?? 0));

  const row = (q: Question) => {
    const id = q.input.id;
    const value = f.answers[id];
    const heading = result.lines.find((l) => `confirm:${l.code}` === id);
    if (q.input.type !== "boolean") {
      return (
        <li key={id} className="py-3 first:pt-0 flex flex-wrap items-center justify-between gap-3">
          <label htmlFor={`db-q-${id}`} className="text-[13.5px] leading-snug">
            {q.input.label}
            <span className="block text-[12px] text-[var(--dc-text-3)]">Leave empty to use the whole value (the most it can be)</span>
          </label>
          <input
            id={`db-q-${id}`}
            type={q.input.type === "date" ? "date" : "number"}
            className={`${styles.input} ${styles.num}`}
            style={{ height: 38, fontSize: 14, width: 160 }}
            value={(value as string | number) ?? ""}
            onChange={(e) =>
              f.answer(id, q.input.type === "date" || e.target.value === "" ? e.target.value || undefined : Number(e.target.value))
            }
          />
        </li>
      );
    }
    return (
      <li key={id} className="py-3 first:pt-0 flex items-start justify-between gap-4">
        <div className="min-w-0 text-[13.5px] leading-snug" title={q.input.help}>
          {heading && <span className={`${mono.className} mr-1.5 text-[12px] font-semibold text-[var(--dc-accent)]`}>{heading.code}</span>}
          {heading ? heading.name : q.input.label}
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {value !== true && <Impact amount={f.impacts[id]} />}
          <Switch checked={value === true} onChange={(on) => f.answer(id, on || undefined)} label={heading ? heading.name : q.input.label} />
        </div>
      </li>
    );
  };

  return (
    <div className={`${styles.card} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold">Could this be lower?</h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--dc-text-3)]">Turn on anything that&apos;s true for this shipment.</p>
        </div>
        {potential < -0.005 && (
          <span className={`${styles.num} rounded-full bg-[var(--dc-positive-soft)] px-2.5 py-1 text-[12.5px] font-semibold text-[var(--dc-positive)]`}>
            Save up to {formatMoney(-potential)}
          </span>
        )}
      </div>
      {relevant.length === 0 ? (
        <p className="mt-4 text-[13.5px] text-[var(--dc-text-2)]">No answer would change the total for this entry.</p>
      ) : (
        <>
          {values.length + savings.length > 0 && (
            <ul className="mt-4 flex flex-col divide-y divide-[var(--dc-border)]">{[...values, ...savings].map(row)}</ul>
          )}
          {extras.length > 0 && (
            <div className="mt-5 pt-4 border-t border-dashed border-[var(--dc-border-strong)]">
              <div className="text-[13.5px] font-semibold">Might also apply</div>
              <p className="mt-0.5 mb-3 text-[12.5px] text-[var(--dc-text-3)]">
                Only if they describe your goods. They aren&apos;t included until you turn them on.
              </p>
              <ul className="flex flex-col divide-y divide-[var(--dc-border)]">{extras.map(row)}</ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (on: boolean) => void; label: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-10 shrink-0 rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dc-accent)] ${
      checked ? "bg-[var(--dc-accent)] border-[var(--dc-accent)]" : "bg-[var(--dc-surface-3)] border-[var(--dc-border-strong)]"
    }`}
  >
    <span
      className={`absolute top-1/2 -translate-y-1/2 h-[18px] w-[18px] rounded-full bg-white shadow transition-[left] ${
        checked ? "left-[19px]" : "left-[2px]"
      }`}
    />
  </button>
);

// ── Comparing ──

const CompareDashboard = ({ f }: { f: TariffFinder }) => {
  const entries = f.compareEntries;
  const landed = (e: CompareEntry) => f.customsValue + e.result.totalDuty + e.result.totalFees;
  const lowest = Math.min(...entries.map(landed));
  const allTied = entries.every((e) => Math.abs(landed(e) - lowest) < 0.005);
  const isLowest = (e: CompareEntry) => !allTied && Math.abs(landed(e) - lowest) < 0.005;
  const max = Math.max(...entries.map((e) => e.result.totalDuty + e.result.totalFees), 0.01);

  // One legend across countries, so a program has the same color everywhere
  const legend: string[] = [];
  entries.forEach((e) => slices(e.result).forEach((s) => !legend.includes(s.label) && legend.push(s.label)));
  const colorOf = (label: string) =>
    label === "Customs fees" ? FEES_COLOR : label === "Base duty" ? CHART[0] : CHART[(legend.filter((l) => l !== "Customs fees").indexOf(label)) % CHART.length];

  return (
    <div className="flex flex-col gap-5">
      <div className={`${styles.card} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-[15px] font-semibold">Duty and fees by origin</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[var(--dc-text-2)]">
            {legend.map((label) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorOf(label) }} aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>
        <ul className="mt-5 flex flex-col gap-4">
          {entries.map((e) => {
            const total = e.result.totalDuty + e.result.totalFees;
            return (
              <li key={e.country.code} className="grid grid-cols-[minmax(0,140px)_1fr_auto] items-center gap-3">
                <span className="truncate text-[14px] font-medium">
                  {e.country.flag} {e.country.name}
                </span>
                <div className="h-7 rounded-md bg-[var(--dc-surface-2)] overflow-hidden" role="img" aria-label={`${e.country.name}: ${formatMoney(total)}`}>
                  <div className="flex h-full" style={{ width: `${(total / max) * 100}%` }}>
                    {slices(e.result)
                      .filter((s) => s.amount > 0)
                      .map((s) => (
                        <span key={s.label} title={`${s.label}: ${formatMoney(s.amount)}`} className="h-full" style={{ width: `${(s.amount / total) * 100}%`, background: colorOf(s.label) }} />
                      ))}
                  </div>
                </div>
                <span className={`${styles.num} w-[110px] text-right text-[14px] font-semibold ${isLowest(e) ? "text-[var(--dc-positive)]" : ""}`}>
                  {formatMoney(total)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={`grid grid-cols-1 gap-5 ${entries.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
        {entries.map((e) => (
          <article
            key={e.country.code}
            className={`${styles.card} p-5 flex flex-col gap-4`}
            style={isLowest(e) ? { outline: "2px solid var(--dc-positive)", outlineOffset: -1 } : undefined}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl leading-none" aria-hidden>
                  {e.country.flag}
                </span>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold truncate">{e.country.name}</div>
                  <div className="text-[12px] text-[var(--dc-text-3)]">{COLUMN_LABEL[e.result.column]}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isLowest(e) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--dc-positive-soft)] px-2 py-0.5 text-[11.5px] font-semibold text-[var(--dc-positive)]">
                    <TrophyIcon className="w-3.5 h-3.5" aria-hidden /> Lowest
                  </span>
                )}
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-[var(--dc-text-3)] hover:bg-[var(--dc-surface-2)] hover:text-[var(--dc-text)]"
                  onClick={() => f.removeCountry(e.country.code)}
                  aria-label={`Remove ${e.country.name} from the comparison`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3">
              {[
                ["Duty", formatMoney(e.result.totalDuty)],
                ["Fees", formatMoney(e.result.totalFees)],
                ["Landed", formatMoney(landed(e))],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11.5px] text-[var(--dc-text-3)]">{label}</dt>
                  <dd className={`${styles.num} text-[14px] font-semibold`}>{value}</dd>
                </div>
              ))}
            </dl>
            <PreferenceSelect f={f} countryCode={e.country.code} style={{ height: 36, fontSize: 13.5 }} />
            <div className="mt-auto flex items-center justify-between gap-3 text-[12.5px] text-[var(--dc-text-3)]">
              <span>
                {isLowest(e) || allTied
                  ? e.openQuestions > 0
                    ? `${e.openQuestions} open questions`
                    : "No open questions"
                  : `+${formatMoney(landed(e) - lowest)} more`}
              </span>
              <button type="button" className={`${styles.link} inline-flex items-center gap-1 text-[13px]`} onClick={() => f.viewCountryDetails(e.country)}>
                Dashboard <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
