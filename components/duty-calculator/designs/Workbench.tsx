"use client";

import { Fragment, useState } from "react";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { CalculationResult, DutyLine, Question } from "../../../tariffs/engine-v2/types";
import { Segmented } from "../controls";
import { formatDate, formatMoney, formatPct, mono } from "../format";
import { EntryRail } from "../EntryRail";
import { COLUMN_LABEL, Impact, programName } from "../Results";
import { emptyTitle, ExampleButtons, PreferenceSelect, ShareButtons, VerifiedNotice, ViewSwitch } from "../shared";
import { TariffFinder } from "../useTariffFinder";
import styles from "../theme.module.css";

// Workbench: for people who do this all day. Inputs stay in a rail on the left; the right is
// a dense ledger of every heading that was checked, with questions inline under their heading.

const STATUS_LABEL: Record<DutyLine["status"], string> = {
  applies: "Applies",
  excluded: "Excluded",
  notApplicable: "No",
  needsAnswer: "Needs answer",
};

export const WorkbenchDesign = ({ f }: { f: TariffFinder }) => {
  const { result, selectedElement, country } = f;
  const ready = result && selectedElement && country;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[292px_minmax(0,1fr)] gap-5 items-start">
      <EntryRail f={f} />

      <section className="min-w-0 flex flex-col gap-3" aria-label="Duty estimate" aria-live="polite">
        {f.loading ? (
          <div className={`${styles.card} p-5 flex flex-col gap-2`} aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`${styles.skeleton} h-7 w-full`} />
            ))}
          </div>
        ) : !ready ? (
          <div className={`${styles.card} p-6 flex flex-col gap-4`}>
            <div>
              <div className="text-[15px] font-semibold">{emptyTitle(f)}</div>
              <p className="mt-1 text-[13.5px] text-[var(--dc-text-2)]">
                The ledger lists every Chapter 99 heading checked for the code and country, whether it applies, and why.
              </p>
            </div>
            <ExampleButtons onExample={f.selectExample} compact />
          </div>
        ) : (
          <>
            <Toolbar f={f} result={result} />
            <VerifiedNotice f={f} compact />
            {f.comparing ? (
              <Matrix f={f} />
            ) : (
              <>
                <KpiStrip f={f} result={result} />
                <Ledger f={f} result={result} summary={f.view === "simple"} />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
};

// ── Above the table ──

const Toolbar = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="flex items-baseline gap-2">
        <span className={`${mono.className} text-[16px] font-semibold`}>{result.htsCode}</span>
        <span className="text-[13px] text-[var(--dc-text-3)]">
          {f.comparing
            ? f.compareEntries.map((e) => e.country.code).join(" · ")
            : `${f.country?.flag} ${f.country?.name}`}{" "}
          · {formatDate(result.asOf)} · {f.transportLabel}
        </span>
      </div>
      {f.codeDescription && (
        <div className="text-[12.5px] text-[var(--dc-text-3)] truncate max-w-[680px]" title={f.codeDescription}>
          {f.codeDescription}
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <ViewSwitch f={f} className="flex-1 sm:flex-none" />
      <ShareButtons f={f} compact />
    </div>
  </div>
);

const KpiStrip = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const effective = f.customsValue > 0 ? (result.totalDuty / f.customsValue) * 100 : 0;
  const items: [string, string][] = [
    ["Duty", formatMoney(result.totalDuty)],
    ["Effective", formatPct(Math.round(effective * 100) / 100)],
    ["Base AVE", formatPct(Math.round(result.baseRateEquivalentPct * 100) / 100)],
    ["Fees", formatMoney(result.totalFees)],
    ["Duty + fees", formatMoney(result.totalDuty + result.totalFees)],
    ["Landed", formatMoney(f.customsValue + result.totalDuty + result.totalFees)],
  ];
  return (
    <dl
      className={`${styles.card} grid grid-cols-3 md:grid-cols-6 gap-px overflow-hidden bg-[var(--dc-border)]`}
      style={{ borderRadius: 12 }}
    >
      {items.map(([label, value], i) => (
        <div key={label} className="bg-[var(--dc-surface)] px-3.5 py-2.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--dc-text-3)]">{label}</dt>
          <dd className={`${styles.num} ${i === 0 ? "text-[18px]" : "text-[15px]"} font-semibold leading-tight mt-0.5`}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

// ── The ledger ──

type Filter = "all" | "applied";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All checked" },
  { id: "applied", label: "Applied" },
];

const th = "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--dc-text-3)] whitespace-nowrap";
const td = "px-3 py-2 align-top";

const Ledger = ({ f, result, summary }: { f: TariffFinder; result: CalculationResult; summary: boolean }) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const toggle = (code: string) => setOpenRows((prev) => ({ ...prev, [code]: !prev[code] }));

  const matters = (q: Question) =>
    q.answered || q.input.type !== "boolean" || Math.abs(f.impacts[q.input.id] ?? 0) >= 0.005;
  const questionsFor = (code: string) => result.questions.filter((q) => matters(q) && q.headings.includes(code));
  const hasOpenQuestion = (code: string) => questionsFor(code).some((q) => !q.answered);

  // Summary: one row per program. Otherwise every heading, or only applied ones and those waiting on an answer.
  const lines = result.lines.filter(
    (l) => filter === "all" || l.status === "applies" || hasOpenQuestion(l.code)
  );
  const hidden = result.lines.length - lines.length;

  if (summary) {
    const byProgram = new Map<string, { amount: number; codes: string[] }>();
    result.lines
      .filter((l) => l.status === "applies")
      .forEach((l) => {
        const key = programName(l.program);
        const row = byProgram.get(key) ?? { amount: 0, codes: [] };
        row.amount += l.amount;
        row.codes.push(l.code);
        byProgram.set(key, row);
      });
    return (
      <div className={`${styles.card} overflow-hidden`} style={{ borderRadius: 12 }}>
        <table className="w-full text-left border-collapse text-[13.5px]">
          <thead className="bg-[var(--dc-surface-2)]">
            <tr>
              <th className={th}>Program</th>
              <th className={th}>Headings</th>
              <th className={`${th} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody className={styles.num}>
            <tr className="border-t border-[var(--dc-border)]">
              <td className={td}>Base duty</td>
              <td className={`${td} ${mono.className} text-[12.5px] text-[var(--dc-text-3)]`}>{COLUMN_LABEL[result.column]}</td>
              <td className={`${td} text-right font-semibold`}>{formatMoney(result.base.amount)}</td>
            </tr>
            {Array.from(byProgram).map(([name, row]) => (
              <tr key={name} className="border-t border-[var(--dc-border)]">
                <td className={td}>{name}</td>
                <td className={`${td} ${mono.className} text-[12.5px] text-[var(--dc-text-3)]`}>{row.codes.join(", ")}</td>
                <td className={`${td} text-right font-semibold`}>{formatMoney(row.amount)}</td>
              </tr>
            ))}
            <tr className="border-t border-[var(--dc-border)]">
              <td className={td}>Customs fees</td>
              <td className={`${td} ${mono.className} text-[12.5px] text-[var(--dc-text-3)]`}>
                {result.fees.map((x) => x.id.toUpperCase()).join(", ") || "—"}
              </td>
              <td className={`${td} text-right font-semibold`}>{formatMoney(result.totalFees)}</td>
            </tr>
            <tr className="border-t-2 border-[var(--dc-border-strong)] bg-[var(--dc-surface-2)]">
              <td className={`${td} font-semibold`} colSpan={2}>
                Duty and fees
              </td>
              <td className={`${td} text-right font-bold`}>{formatMoney(result.totalDuty + result.totalFees)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const itemized = result.baseParts.length > 1 || result.baseParts.some((p) => p.kind === "amount" || p.component);
  const baseQuestions = questionsFor("BASE");

  return (
    <div className={`${styles.card} overflow-hidden`} style={{ borderRadius: 12 }}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[var(--dc-border)]">
        <div className="text-[12.5px] text-[var(--dc-text-3)]">
          {result.lines.filter((l) => l.status === "applies").length} of {result.lines.length} headings apply
          {f.openQuestions > 0 && (
            <span className="ml-2 rounded-full bg-[var(--dc-accent-soft)] border border-[var(--dc-accent-border)] px-2 py-0.5 text-[11.5px] font-semibold text-[var(--dc-accent)]">
              {f.openQuestions} open {f.openQuestions === 1 ? "question" : "questions"}
            </span>
          )}
        </div>
        <div className="w-[220px] whitespace-nowrap">
          <Segmented<Filter>
            label="Show headings"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            compact
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left border-collapse text-[13px]">
          <caption className="sr-only">Every heading checked for this entry</caption>
          <thead className="bg-[var(--dc-surface-2)]">
            <tr>
              <th className={`${th} w-[132px]`}>Code</th>
              <th className={th}>Heading</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Basis</th>
              <th className={`${th} text-right`}>Rate</th>
              <th className={`${th} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody className={styles.num}>
            {/* Base */}
            <tr className="border-t border-[var(--dc-border)]">
              <td className={`${td} ${mono.className} font-semibold text-[var(--dc-accent)]`}>BASE</td>
              <td className={td}>
                <div className="font-medium">Base duty</div>
                <div className="text-[12px] text-[var(--dc-text-3)]">
                  {COLUMN_LABEL[result.column]}
                  {result.claimedPreference ? ` (${result.claimedPreference})` : ""}
                </div>
              </td>
              <td className={td}>
                <StatusPill status="applies" />
              </td>
              <td className={`${td} text-right`}>{itemized ? "" : formatMoney(result.base.basisValue)}</td>
              <td className={`${td} text-right whitespace-nowrap`}>
                {itemized ? "" : result.base.reasons[0] ?? formatPct(result.base.ratePct ?? 0)}
              </td>
              <td className={`${td} text-right font-semibold`}>{formatMoney(result.base.amount)}</td>
            </tr>
            {itemized &&
              result.baseParts.map((p, i) => (
                <tr key={i} className="text-[12.5px] text-[var(--dc-text-2)]">
                  <td className={`${td} py-1 pl-6 ${mono.className} text-[var(--dc-text-3)]`}>
                    {i === result.baseParts.length - 1 ? "└" : "├"}
                  </td>
                  <td className={`${td} py-1`} colSpan={2}>
                    {p.component ? `On ${p.component}` : p.kind === "amount" ? "Per unit" : "On the whole value"}
                    {p.assumed && <span className="ml-1.5 text-[var(--dc-warning)]">assumed</span>}
                  </td>
                  <td className={`${td} py-1 text-right`}>
                    {p.kind === "percent"
                      ? formatMoney(p.basis)
                      : `${p.basis.toLocaleString("en-US")} ${p.unit === "each" ? f.unitLabel : p.unit}`}
                  </td>
                  <td className={`${td} py-1 text-right whitespace-nowrap`}>{p.raw.replace(/ on .*$/, "")}</td>
                  <td className={`${td} py-1 text-right`}>{formatMoney(p.amount)}</td>
                </tr>
              ))}
            {baseQuestions.length > 0 && <QuestionRows f={f} result={result} questions={baseQuestions} />}

            {/* Chapter 99 */}
            {lines.map((line) => {
              const questions = questionsFor(line.code);
              const open = openRows[line.code];
              const dim = line.status !== "applies";
              return (
                <Fragment key={line.code}>
                  <tr
                    className={`border-t border-[var(--dc-border)] ${dim ? "text-[var(--dc-text-3)]" : ""} hover:bg-[var(--dc-surface-2)]`}
                  >
                    <td className={`${td} ${mono.className} font-semibold ${dim ? "" : "text-[var(--dc-accent)]"}`}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-0.5 -ml-1 rounded hover:text-[var(--dc-text)]"
                        onClick={() => toggle(line.code)}
                        aria-expanded={Boolean(open)}
                        aria-label={`${line.code}: ${open ? "hide" : "show"} reasons`}
                      >
                        <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
                        {line.code}
                      </button>
                    </td>
                    <td className={td}>
                      <div className={dim ? "" : "font-medium text-[var(--dc-text)]"}>{line.name}</div>
                      <div className="text-[12px] text-[var(--dc-text-3)]">{programName(line.program)}</div>
                    </td>
                    <td className={td}>
                      <StatusPill status={line.status} />
                    </td>
                    <td className={`${td} text-right`}>{dim ? "" : formatMoney(line.basisValue)}</td>
                    <td className={`${td} text-right`}>{line.ratePct !== undefined ? formatPct(line.ratePct) : "—"}</td>
                    <td className={`${td} text-right ${dim ? "" : "font-semibold text-[var(--dc-text)]"}`}>
                      {dim ? "—" : formatMoney(line.amount)}
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td />
                      <td colSpan={5} className="px-3 pb-2.5 text-[12.5px] leading-relaxed text-[var(--dc-text-2)]">
                        {line.reasons.length ? line.reasons.join(" · ") : "No further detail"}
                      </td>
                    </tr>
                  )}
                  {questions.length > 0 && <QuestionRows f={f} result={result} questions={questions} />}
                </Fragment>
              );
            })}
            {hidden > 0 && (
              <tr className="border-t border-[var(--dc-border)]">
                <td colSpan={6} className="px-3 py-2 text-[12.5px] text-[var(--dc-text-3)]">
                  {hidden} headings that don&apos;t apply are hidden.{" "}
                  <button type="button" className={styles.link} onClick={() => setFilter("all")}>
                    Show all
                  </button>
                </td>
              </tr>
            )}

            <tr className="border-t-2 border-[var(--dc-border-strong)] bg-[var(--dc-surface-2)]">
              <td colSpan={5} className={`${td} font-semibold`}>
                Total duty
              </td>
              <td className={`${td} text-right font-bold`}>{formatMoney(result.totalDuty)}</td>
            </tr>

            {/* Fees */}
            {result.fees.map((fee) => (
              <tr key={fee.id} className="border-t border-[var(--dc-border)]">
                <td className={`${td} ${mono.className} font-semibold text-[var(--dc-accent)]`}>{fee.id.toUpperCase()}</td>
                <td className={td} colSpan={2}>
                  <div className="font-medium">{fee.name}</div>
                  {fee.note && <div className="text-[12px] text-[var(--dc-text-3)]">{fee.note}</div>}
                </td>
                <td className={`${td} text-right`}>{formatMoney(f.customsValue)}</td>
                <td className={`${td} text-right`}>{formatPct(fee.ratePct)}</td>
                <td className={`${td} text-right font-semibold`}>{formatMoney(fee.amount)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-[var(--dc-border-strong)] bg-[var(--dc-surface-2)]">
              <td colSpan={5} className={`${td} font-semibold`}>
                Duty and fees
              </td>
              <td className={`${td} text-right font-bold text-[14px]`}>
                {formatMoney(result.totalDuty + result.totalFees)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {result.warnings.length > 0 && (
        <ul className="border-t border-[var(--dc-border)] px-3 py-2 flex flex-col gap-1">
          {result.warnings.map((w) => (
            <li key={w} className="text-[12.5px] text-[var(--dc-warning)]">
              ⚠ {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const StatusPill = ({ status }: { status: DutyLine["status"] }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded px-1.5 py-px text-[11px] font-semibold ${
      status === "applies"
        ? "bg-[var(--dc-accent-soft)] text-[var(--dc-accent)]"
        : status === "needsAnswer"
          ? "bg-[var(--dc-warning-soft)] text-[var(--dc-warning)]"
          : "bg-[var(--dc-surface-3)] text-[var(--dc-text-3)]"
    }`}
  >
    {STATUS_LABEL[status]}
  </span>
);

// Questions as compact rows right under their heading
const QuestionRows = ({ f, result, questions }: { f: TariffFinder; result: CalculationResult; questions: Question[] }) => (
  <>
    {questions.map((q) => {
      const id = q.input.id;
      const value = f.answers[id];
      const heading = result.lines.find((l) => `confirm:${l.code}` === id);
      return (
        <tr key={id} className="bg-[var(--dc-accent-soft)]">
          <td className="px-3 py-1.5 pl-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--dc-accent)]">
            {q.answered ? "Answered" : "Ask"}
          </td>
          <td colSpan={4} className="px-3 py-1.5">
            {q.input.type === "boolean" ? (
              <label className="flex items-start gap-2 cursor-pointer text-[12.5px] leading-snug text-[var(--dc-text)]">
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  style={{ width: 16, height: 16, marginTop: 1 }}
                  checked={value === true}
                  onChange={(e) => f.answer(id, e.target.checked || undefined)}
                />
                <span title={q.input.help}>{heading ? heading.name : q.input.label}</span>
              </label>
            ) : (
              <label className="flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--dc-text)]">
                <span>{q.input.label}</span>
                <input
                  type={q.input.type === "date" ? "date" : "number"}
                  className={`${styles.input} ${styles.num}`}
                  style={{ height: 30, fontSize: 13, padding: "0 8px", width: 140 }}
                  value={(value as string | number) ?? ""}
                  placeholder={q.input.unit === "USD" ? "Whole value" : undefined}
                  onChange={(e) =>
                    f.answer(
                      id,
                      q.input.type === "date" || e.target.value === "" ? e.target.value || undefined : Number(e.target.value)
                    )
                  }
                />
              </label>
            )}
          </td>
          <td className="px-3 py-1.5 text-right">{value !== true && <Impact amount={f.impacts[id]} />}</td>
        </tr>
      );
    })}
  </>
);

// ── Comparing: headings down, countries across ──

const Matrix = ({ f }: { f: TariffFinder }) => {
  const entries = f.compareEntries;
  const landed = (r: CalculationResult) => f.customsValue + r.totalDuty + r.totalFees;
  const lowest = Math.min(...entries.map((e) => landed(e.result)));
  const allTied = entries.every((e) => Math.abs(landed(e.result) - lowest) < 0.005);
  const isLowest = (r: CalculationResult) => !allTied && Math.abs(landed(r) - lowest) < 0.005;

  // Every heading that applies for at least one country, in first-seen order
  const codes: { code: string; name: string }[] = [];
  entries.forEach((e) =>
    e.result.lines
      .filter((l) => l.status === "applies")
      .forEach((l) => {
        if (!codes.some((c) => c.code === l.code)) codes.push({ code: l.code, name: l.name });
      })
  );
  const cell = (r: CalculationResult, code: string) => {
    const line = r.lines.find((l) => l.code === code);
    return line?.status === "applies" ? line : null;
  };
  const highlight = (r: CalculationResult) => (isLowest(r) ? "bg-[var(--dc-positive-soft)]" : "");

  return (
    <div className={`${styles.card} overflow-hidden`} style={{ borderRadius: 12 }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left border-collapse text-[13px]">
          <caption className="sr-only">Duty by heading for each country</caption>
          <thead>
            <tr className="bg-[var(--dc-surface-2)] align-top">
              <th className={`${th} pt-3`}>Line</th>
              {entries.map((e) => (
                <th key={e.country.code} className={`px-3 pt-3 pb-2 text-right font-normal ${highlight(e.result)}`}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[14px] font-semibold text-[var(--dc-text)]">
                      {e.country.flag} {e.country.name}
                    </span>
                    <button
                      type="button"
                      className="rounded p-0.5 text-[var(--dc-text-3)] hover:bg-[var(--dc-surface-3)] hover:text-[var(--dc-text)]"
                      onClick={() => f.removeCountry(e.country.code)}
                      aria-label={`Remove ${e.country.name} from the comparison`}
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 text-[11.5px] text-[var(--dc-text-3)]">
                    {COLUMN_LABEL[e.result.column]}
                    {isLowest(e.result) && <span className="ml-1.5 font-semibold text-[var(--dc-positive)]">Lowest</span>}
                  </div>
                  {e.result.availablePreferences.length > 0 && (
                    <PreferenceSelect
                      f={f}
                      countryCode={e.country.code}
                      className="mt-1.5 ml-auto"
                      style={{ height: 28, fontSize: 12, padding: "0 8px", maxWidth: 180 }}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.num}>
            <tr className="border-t border-[var(--dc-border)]">
              <td className={`${td} ${mono.className} font-semibold text-[var(--dc-accent)]`}>BASE</td>
              {entries.map((e) => (
                <td key={e.country.code} className={`${td} text-right ${highlight(e.result)}`}>
                  <div className="font-semibold">{formatMoney(e.result.base.amount)}</div>
                  <div className="text-[11.5px] text-[var(--dc-text-3)]">{e.result.base.reasons[0] ?? "Free"}</div>
                </td>
              ))}
            </tr>
            {codes.map(({ code, name }) => (
              <tr key={code} className="border-t border-[var(--dc-border)]">
                <td className={td}>
                  <div className={`${mono.className} font-semibold text-[var(--dc-accent)]`}>{code}</div>
                  <div className="text-[12px] text-[var(--dc-text-3)] max-w-[320px]">{name}</div>
                </td>
                {entries.map((e) => {
                  const line = cell(e.result, code);
                  return (
                    <td key={e.country.code} className={`${td} text-right ${highlight(e.result)}`}>
                      {line ? (
                        <>
                          <div className="font-semibold">{formatMoney(line.amount)}</div>
                          <div className="text-[11.5px] text-[var(--dc-text-3)]">
                            {line.ratePct !== undefined ? formatPct(line.ratePct) : ""}
                          </div>
                        </>
                      ) : (
                        <span className="text-[var(--dc-text-3)]">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {[
              ["Total duty", (r: CalculationResult) => r.totalDuty],
              ["Fees", (r: CalculationResult) => r.totalFees],
              ["Landed cost", landed],
            ].map(([label, value], i) => (
              <tr
                key={label as string}
                className={`${i === 0 ? "border-t-2 border-[var(--dc-border-strong)]" : "border-t border-[var(--dc-border)]"} bg-[var(--dc-surface-2)]`}
              >
                <td className={`${td} font-semibold`}>{label as string}</td>
                {entries.map((e) => (
                  <td key={e.country.code} className={`${td} text-right font-semibold ${i === 2 ? "text-[14px]" : ""}`}>
                    {formatMoney((value as (r: CalculationResult) => number)(e.result))}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-[var(--dc-border)]">
              <td className={`${td} text-[12px] text-[var(--dc-text-3)]`}>Open questions</td>
              {entries.map((e) => (
                <td key={e.country.code} className={`${td} text-right`}>
                  <button type="button" className={`${styles.link} text-[12.5px]`} onClick={() => f.viewCountryDetails(e.country)}>
                    {e.openQuestions > 0 ? `${e.openQuestions} · open ledger` : "Open ledger"}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
