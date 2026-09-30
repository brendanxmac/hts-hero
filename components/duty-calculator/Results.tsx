"use client";

import { ReactNode, useState } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { AllRules } from "../../tariffs/engine-v2/data";
import {
  CalculationResult,
  DutyLine,
  Question,
  TransportMode,
} from "../../tariffs/engine-v2/types";
import { HtsRevision } from "../../tariffs/engine-v2/revisions";
import {
  formatDate,
  formatMoney,
  formatPct,
  mono,
  TRANSPORT_MODES,
} from "./format";
import styles from "./theme.module.css";

export const programName = (id?: string) =>
  AllRules.programs.find((p) => p.id === id)?.name ?? "Other";

// Which "Where the money goes" slice a line belongs to: base duty, its program, or fees
export const BASE_SLICE = "Base duty";
export const FEES_SLICE = "Customs fees";
export const sliceForProgram = (program?: string) => programName(program);

// Supabase revision names look like "2026-21" (year-revision); USITC's like "2026HTSRev21"
export const describeHtsRevision = (name: string | null) => {
  const match = name?.match(/^(\d{4})(?:-|HTSRev)(\d+)$/);
  if (match) return `${match[1]} Rev ${match[2]}`;
  return name ?? "latest revision";
};

export const COLUMN_LABEL = {
  general: "Column 1 General",
  special: "Column 1 Special",
  column2: "Column 2",
};

// ── Summary figures ──

export const SummaryStats = ({
  result,
  customsValue,
}: {
  result: CalculationResult;
  customsValue: number;
}) => {
  const effectiveRate =
    customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
  const dutyAndFees = result.totalDuty + result.totalFees;
  return (
    // 1px gaps over the border color draw the dividers at every breakpoint
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.45fr_1fr_1fr_1fr] gap-px bg-[var(--dc-border)] border-b border-[var(--dc-border)]">
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 p-5 sm:p-6 bg-[var(--dc-surface)]">
        <div className={styles.eyebrow}>Total duty</div>
        <div
          className={`${styles.num} mt-2 text-[34px] leading-none font-semibold tracking-tight text-[var(--dc-text)]`}
        >
          {formatMoney(result.totalDuty)}
        </div>
        <div className={`${styles.num} mt-2 text-sm text-[var(--dc-text-2)]`}>
          {formatPct(Math.round(effectiveRate * 100) / 100)} effective rate
        </div>
      </div>
      <Stat
        label="Fees"
        value={formatMoney(result.totalFees)}
        note={result.fees.map((f) => f.id.toUpperCase()).join(" + ") || "None"}
      />
      <Stat
        label="Duty + fees"
        value={formatMoney(dutyAndFees)}
        note="Payable to CBP"
      />
      <Stat
        label="Landed cost"
        value={formatMoney(customsValue + dutyAndFees)}
        note={`On ${formatMoney(customsValue)} customs value`}
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
};

const Stat = ({
  label,
  value,
  note,
  className = "",
}: {
  label: string;
  value: string;
  note: string;
  className?: string;
}) => (
  <div className={`p-5 sm:p-6 bg-[var(--dc-surface)] ${className}`}>
    <div className={styles.eyebrow}>{label}</div>
    <div
      className={`${styles.num} mt-2 text-[22px] leading-none font-semibold tracking-tight text-[var(--dc-text)]`}
    >
      {value}
    </div>
    <div className="mt-2 text-[13px] text-[var(--dc-text-3)]">{note}</div>
  </div>
);

// ── Detailed statement ──

export const Statement = ({
  result,
  customsValue,
  unitLabel,
  sliceColors,
  highlight,
  onHighlight,
}: {
  result: CalculationResult;
  customsValue: number;
  unitLabel: string;
  // Chart colors by slice, to tie each line to "Where the money goes"
  sliceColors?: Record<string, string>;
  // The slice being hovered, here or in the chart
  highlight?: string | null;
  onHighlight?: (slice: string | null) => void;
}) => {
  // Per-unit and compound base rates are shown as written in the HTS
  // Rates with several parts, per-unit amounts, or parts that apply to a component
  // (the case, lead content) are shown one part per line, each against its own basis
  const itemized =
    result.baseParts.length > 1 ||
    result.baseParts.some((p) => p.kind === "amount" || p.component);
  const partBasis = (p: CalculationResult["baseParts"][number]) =>
    (p.kind === "percent"
      ? formatMoney(p.basis)
      : `${p.basis.toLocaleString("en-US")} ${p.unit === "each" ? unitLabel : p.unit}`) +
    (p.assumed ? " (assumed)" : "");
  const applied = result.lines.filter((l) => l.status === "applies");
  const dutyAndFees = result.totalDuty + result.totalFees;
  const rows: RowProps[] = [
    {
      code: "Base",
      slice: BASE_SLICE,
      name: `Base duty · ${COLUMN_LABEL[result.column]}`,
      // Notes about parts that use the whole value until a component's value is entered
      detail: result.base.reasons.slice(1).join(" · ") || undefined,
      basis: result.base.basisValue,
      basisText: itemized
        ? result.baseParts.map(partBasis).join(" · ")
        : undefined,
      rate: result.base.ratePct,
      rateText: itemized
        ? result.baseParts.map((p) => p.raw).join(" + ")
        : undefined,
      amount: result.base.amount,
    },
    ...applied.map((line) => ({
      code: line.code,
      slice: sliceForProgram(line.program),
      name: line.name,
      program: programName(line.program),
      detail: line.reasons.join(" · "),
      basis: line.basisValue,
      rate: line.ratePct,
      amount: line.amount,
    })),
  ];
  const feeRows: RowProps[] = result.fees.map((fee) => ({
    code: fee.id.toUpperCase(),
    slice: FEES_SLICE,
    name: fee.name,
    detail: fee.note,
    basis: customsValue,
    rate: fee.ratePct,
    amount: fee.amount,
  }));

  // Only lines with a slice in the chart get a color and respond to hover
  const linked = (row: RowProps): RowLink => {
    const color = row.slice ? sliceColors?.[row.slice] : undefined;
    return {
      color,
      // Lines without a slice (e.g. a $0 exemption) fade with the rest
      state: !highlight
        ? "idle"
        : color && highlight === row.slice
          ? "active"
          : "faded",
      onHover:
        color && onHighlight
          ? (on: boolean) => onHighlight(on ? (row.slice ?? null) : null)
          : undefined,
    };
  };

  return (
    <>
      {/* Phones: stacked lines */}
      <ul className="sm:hidden">
        {rows.map((row) => (
          <MobileRow key={row.code} {...row} link={linked(row)} />
        ))}
        <MobileTotal label="Total duty" amount={result.totalDuty} />
        {feeRows.map((row) => (
          <MobileRow key={row.code} {...row} link={linked(row)} />
        ))}
        <MobileTotal label="Total duty and fees" amount={dutyAndFees} strong />
      </ul>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Duty statement</caption>
          <thead>
            <tr className="text-[var(--dc-text-3)]">
              <th
                scope="col"
                className={`${styles.eyebrow} py-3 pl-5 sm:pl-6 pr-3 font-semibold`}
              >
                Line
              </th>
              <th
                scope="col"
                className={`${styles.eyebrow} py-3 px-3 font-semibold`}
              >
                Applies to
              </th>
              <th
                scope="col"
                className={`${styles.eyebrow} py-3 px-3 font-semibold text-right`}
              >
                Rate
              </th>
              <th
                scope="col"
                className={`${styles.eyebrow} py-3 pl-3 pr-5 sm:pr-6 font-semibold text-right`}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <StatementRow key={row.code} {...row} link={linked(row)} />
            ))}
            <TotalRow label="Total duty" amount={result.totalDuty} />
            {feeRows.map((row) => (
              <StatementRow key={row.code} {...row} link={linked(row)} />
            ))}
            <TotalRow label="Total duty and fees" amount={dutyAndFees} strong />
          </tbody>
        </table>
      </div>
    </>
  );
};

interface RowProps {
  code: string;
  slice?: string;
  name: string;
  program?: string;
  detail?: string;
  basis: number;
  basisText?: string;
  rate?: number;
  rateText?: string;
  amount: number;
}

interface RowLink {
  color?: string;
  state: "idle" | "active" | "faded";
  onHover?: (on: boolean) => void;
}

const linkClass = (link?: RowLink) =>
  link?.state === "active"
    ? "bg-[var(--dc-accent-soft)]"
    : link?.state === "faded"
      ? "opacity-45"
      : "";

// The line's chart color
const Swatch = ({ color }: { color?: string }) =>
  color ? (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] self-center"
      style={{ background: color }}
      aria-hidden
    />
  ) : null;

const MobileRow = ({
  code,
  name,
  program,
  detail,
  basis,
  basisText,
  rate,
  rateText,
  amount,
  link,
}: RowProps & { link?: RowLink }) => (
  <li
    className={`border-t border-[var(--dc-border)] px-5 py-4 flex flex-col gap-1.5 transition-[opacity,background-color] ${linkClass(link)}`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div
          className={`${mono.className} flex items-center gap-1.5 text-[13px] font-semibold text-[var(--dc-accent)]`}
        >
          <Swatch color={link?.color} />
          {code}
        </div>
        <div className="text-[14.5px] font-medium leading-snug text-[var(--dc-text)]">
          {name}
        </div>
      </div>
      <div
        className={`${styles.num} text-[15px] font-semibold whitespace-nowrap`}
      >
        {formatMoney(amount)}
      </div>
    </div>
    <div
      className={`${styles.num} text-[13px] text-[var(--dc-text-2)] flex flex-col`}
    >
      {rateText &&
      basisText &&
      rateText.split(" + ").length === basisText.split(" · ").length ? (
        // One line per part, e.g. "4.5% on the case of $2,000.00"
        rateText.split(" + ").map((part, i) => (
          <span key={i}>
            {part} of {basisText.split(" · ")[i]}
          </span>
        ))
      ) : (
        <span>
          {rateText ?? (rate === undefined ? "—" : formatPct(rate))} of{" "}
          {basisText ?? formatMoney(basis)}
        </span>
      )}
    </div>
    {program && (
      <div className="text-[12.5px] text-[var(--dc-text-3)]">{program}</div>
    )}
    {detail && (
      <div className="text-[13px] leading-snug text-[var(--dc-text-2)]">
        {detail}
      </div>
    )}
  </li>
);

const MobileTotal = ({
  label,
  amount,
  strong,
}: {
  label: string;
  amount: number;
  strong?: boolean;
}) => (
  <li
    className={`border-t border-[var(--dc-border-strong)] px-5 py-3.5 flex items-baseline justify-between gap-4 ${
      strong ? "bg-[var(--dc-surface-2)]" : ""
    }`}
  >
    <span className="text-[14px] font-semibold">{label}</span>
    <span
      className={`${styles.num} ${strong ? "text-[16px] font-bold" : "text-[15px] font-semibold"}`}
    >
      {formatMoney(amount)}
    </span>
  </li>
);

// Compound values ("24¢ each + 4.5% on the case + 3.5% on the battery") go one part per line,
// so a long HTS rate can't stretch its column
const Stacked = ({
  text,
  separator,
  align = "left",
}: {
  text: string;
  separator: string;
  align?: "left" | "right";
}) => {
  const parts = text.split(separator);
  return (
    <span
      className={`flex flex-col max-w-[190px] ${align === "right" ? "items-end ml-auto text-right" : ""}`}
    >
      {parts.map((part, i) => (
        <span key={i} className={part.length > 22 ? "" : "whitespace-nowrap"}>
          {i > 0 && separator.trim() === "+" ? "+ " : ""}
          {part}
        </span>
      ))}
    </span>
  );
};

const StatementRow = ({
  code,
  name,
  program,
  detail,
  basis,
  basisText,
  rate,
  rateText,
  amount,
  link,
}: RowProps & { link?: RowLink }) => (
  <tr
    className={`border-t border-[var(--dc-border)] align-top transition-[opacity,background-color] ${linkClass(link)}`}
    onMouseEnter={link?.onHover && (() => link.onHover?.(true))}
    onMouseLeave={link?.onHover && (() => link.onHover?.(false))}
  >
    <td className="py-4 pl-5 sm:pl-6 pr-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span
            className={`${mono.className} inline-flex items-center gap-2 text-[13.5px] font-semibold text-[var(--dc-accent)]`}
          >
            <Swatch color={link?.color} />
            {code}
          </span>
          <span className="text-[14.5px] font-medium text-[var(--dc-text)]">
            {name}
          </span>
        </div>
        {program && (
          <span className="text-[12.5px] text-[var(--dc-text-3)]">
            {program}
          </span>
        )}
        {detail && (
          <span className="text-[13px] leading-snug text-[var(--dc-text-2)]">
            {detail}
          </span>
        )}
      </div>
    </td>
    <td
      className={`${styles.num} py-4 px-3 text-[14px] text-[var(--dc-text-2)]`}
    >
      <Stacked text={basisText ?? formatMoney(basis)} separator=" · " />
    </td>
    <td
      className={`${styles.num} py-4 px-3 text-[14px] text-[var(--dc-text-2)] text-right`}
    >
      <Stacked
        text={rateText ?? (rate === undefined ? "—" : formatPct(rate))}
        separator=" + "
        align="right"
      />
    </td>
    <td
      className={`${styles.num} py-4 pl-3 pr-5 sm:pr-6 text-[14.5px] font-semibold text-right whitespace-nowrap`}
    >
      {formatMoney(amount)}
    </td>
  </tr>
);

const TotalRow = ({
  label,
  amount,
  strong,
}: {
  label: string;
  amount: number;
  strong?: boolean;
}) => (
  <tr
    className={`border-t ${strong ? "border-[var(--dc-border-strong)] bg-[var(--dc-surface-2)]" : "border-[var(--dc-border-strong)]"}`}
  >
    <td
      colSpan={3}
      className={`py-3.5 pl-5 sm:pl-6 pr-3 text-[14px] ${strong ? "font-semibold" : "font-semibold text-[var(--dc-text-2)]"}`}
    >
      {label}
    </td>
    <td
      className={`${styles.num} py-3.5 pl-3 pr-5 sm:pr-6 text-right whitespace-nowrap ${strong ? "text-[16px] font-bold" : "text-[15px] font-semibold"}`}
    >
      {formatMoney(amount)}
    </td>
  </tr>
);

// ── Simple view ──

export const SimpleSummary = ({
  result,
  customsValue,
  openQuestions,
  onShowDetails,
}: {
  result: CalculationResult;
  customsValue: number;
  openQuestions: number;
  onShowDetails: () => void;
}) => {
  const dutyAndFees = result.totalDuty + result.totalFees;
  const effectiveRate =
    customsValue > 0 ? (dutyAndFees / customsValue) * 100 : 0;

  // One line per program, in plain language
  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) =>
      byProgram.set(
        programName(l.program),
        (byProgram.get(programName(l.program)) ?? 0) + l.amount,
      ),
    );
  const rows: [string, number][] = [
    ["Standard duty", result.base.amount],
    ...Array.from(byProgram),
    ["Customs fees (MPF, HMF)", result.totalFees],
  ];

  return (
    <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className={styles.eyebrow}>You&apos;ll pay about</div>
        <div
          className={`${styles.num} text-[52px] sm:text-[64px] leading-none font-semibold tracking-tight`}
        >
          {formatMoney(dutyAndFees)}
        </div>
        <p className="text-[15px] text-[var(--dc-text-2)] max-w-md">
          in duties and fees on {formatMoney(customsValue)} of goods,{" "}
          <span className={`${styles.num} font-semibold text-[var(--dc-text)]`}>
            {formatPct(Math.round(effectiveRate * 100) / 100)}
          </span>{" "}
          of their value. Landed cost{" "}
          <span className={`${styles.num} font-semibold text-[var(--dc-text)]`}>
            {formatMoney(customsValue + dutyAndFees)}
          </span>
          .
        </p>
      </div>

      <dl className="w-full max-w-md divide-y divide-[var(--dc-border)] border-y border-[var(--dc-border)] text-left">
        {rows.map(([label, amount]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <dt className="text-[15px] text-[var(--dc-text-2)]">{label}</dt>
            <dd className={`${styles.num} text-[15px] font-semibold`}>
              {formatMoney(amount)}
            </dd>
          </div>
        ))}
      </dl>

      {openQuestions > 0 && (
        <button type="button" className={styles.button} onClick={onShowDetails}>
          <InformationCircleIcon className="w-4 h-4 text-[var(--dc-accent)]" />
          {openQuestions === 1
            ? "1 question could change this amount"
            : `${openQuestions} questions could change this amount`}
        </button>
      )}
    </div>
  );
};

// ── Questions ──

export const QuestionsPanel = ({
  questions,
  answers,
  impacts,
  onAnswer,
  lines,
}: {
  questions: Question[];
  answers: Record<string, unknown>;
  impacts: Record<string, number>;
  onAnswer: (id: string, value: unknown) => void;
  lines: DutyLine[];
}) => {
  const [showAll, setShowAll] = useState(false);
  // Questions that change the amount (or are already answered) come first; the rest
  // wouldn't change this entry's total, so they're tucked away. Original order is kept
  // within each group so answering one doesn't reshuffle the list.
  const matters = (q: Question) =>
    q.answered ||
    answers[q.input.id] !== undefined ||
    q.input.type !== "boolean" ||
    Math.abs(impacts[q.input.id] ?? 0) >= 0.005;
  const primary = questions.filter(matters);
  const secondary = questions.filter((q) => !matters(q));
  const visible = showAll ? [...primary, ...secondary] : primary;
  const open = primary.filter((q) => !q.answered).length;

  return (
    <Panel
      title="Additional Options"
      badge={open > 0 ? `${open} could change the total` : undefined}
      description="Unanswered questions count as “no”, so an exemption isn’t applied until you confirm it."
    >
      {visible.length > 0 ? (
        <ul className="flex flex-col divide-y divide-[var(--dc-border)]">
          {visible.map((q) => (
            <li key={q.input.id} className="py-3.5 first:pt-0 last:pb-0">
              <QuestionControl
                question={q}
                value={answers[q.input.id]}
                impact={impacts[q.input.id]}
                heading={lines.find((l) => `confirm:${l.code}` === q.input.id)}
                onChange={(v) => onAnswer(q.input.id, v)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13.5px] text-[var(--dc-text-2)]">
          No answer would change the total for this entry.
        </p>
      )}
      {secondary.length > 0 && (
        <button
          type="button"
          className={`${styles.link} mt-4 text-[13px]`}
          onClick={() => setShowAll((x) => !x)}
          aria-expanded={showAll}
        >
          {showAll
            ? "Hide questions that don't change the total"
            : `Show ${secondary.length} more ${secondary.length === 1 ? "question" : "questions"} that don't change the total`}
        </button>
      )}
    </Panel>
  );
};

const Impact = ({ amount }: { amount?: number }) => {
  if (amount === undefined || Math.abs(amount) < 0.005) return null;
  const lower = amount < 0;
  return (
    <span
      className={`${styles.num} inline-flex items-center rounded-md px-1.5 py-0.5 text-[12px] font-semibold ${
        lower
          ? "bg-[var(--dc-positive-soft)] text-[var(--dc-positive)]"
          : "bg-[var(--dc-surface-3)] text-[var(--dc-text-2)]"
      }`}
    >
      {lower ? "−" : "+"}
      {formatMoney(Math.abs(amount))}
    </span>
  );
};

const QuestionControl = ({
  question,
  value,
  impact,
  heading,
  onChange,
}: {
  question: Question;
  value: unknown;
  impact?: number;
  heading?: DutyLine;
  onChange: (value: unknown) => void;
}) => {
  const { input } = question;
  const [expanded, setExpanded] = useState(false);
  const code = heading?.code;
  const label = code ? heading.name : input.label;

  if (input.type === "boolean") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={value === true}
            onChange={(e) => onChange(e.target.checked || undefined)}
          />
          <span className="flex flex-col gap-1 min-w-0">
            <span className="text-[14px] leading-snug text-[var(--dc-text)]">
              {code && (
                <span
                  className={`${mono.className} mr-1.5 text-[12.5px] font-semibold text-[var(--dc-accent)]`}
                >
                  {code}
                </span>
              )}
              {label}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              {value !== true && <Impact amount={impact} />}
              {input.help && (
                <button
                  type="button"
                  className="text-[12.5px] font-medium text-[var(--dc-text-3)] hover:text-[var(--dc-text)] underline-offset-2 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    setExpanded((x) => !x);
                  }}
                  aria-expanded={expanded}
                >
                  {expanded ? "Hide legal text" : "Legal text"}
                </button>
              )}
            </span>
          </span>
        </label>
        {expanded && input.help && (
          <p className="ml-[30px] text-[12.5px] leading-relaxed text-[var(--dc-text-2)] bg-[var(--dc-surface-2)] rounded-lg p-3">
            {input.help}
          </p>
        )}
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] leading-snug text-[var(--dc-text)]">
        {input.label}
      </span>
      <input
        type={input.type === "date" ? "date" : "number"}
        className={`${styles.input} h-[40px] text-[14px]`}
        value={(value as string | number) ?? ""}
        onChange={(e) =>
          onChange(
            input.type === "date" || e.target.value === ""
              ? e.target.value || undefined
              : Number(e.target.value),
          )
        }
      />
      {input.help && (
        <span className="text-[12.5px] text-[var(--dc-text-3)]">
          {input.help}
        </span>
      )}
    </label>
  );
};

// ── Not applied ──

const STATUS = {
  excluded: "Excluded",
  notApplicable: "Doesn't apply",
  needsAnswer: "Needs an answer",
  applies: "Applies",
};

export const NotAppliedPanel = ({ lines }: { lines: DutyLine[] }) => {
  const [open, setOpen] = useState(false);
  const notApplied = lines.filter((l) => l.status !== "applies");
  if (notApplied.length === 0) return null;
  return (
    <div className={styles.card}>
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
      >
        <span>
          <span className="block text-[15px] font-semibold">
            Checked but not applied
          </span>
          <span className="block mt-0.5 text-[13px] text-[var(--dc-text-3)]">
            {notApplied.length} other headings match this code and country
          </span>
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 shrink-0 text-[var(--dc-text-3)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="border-t border-[var(--dc-border)] divide-y divide-[var(--dc-border)]">
          {notApplied.map((line) => (
            <li key={line.code} className="px-5 py-3.5 flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span
                  className={`${mono.className} text-[12.5px] font-semibold text-[var(--dc-text-2)]`}
                >
                  {line.code}
                </span>
                <span className="text-[13.5px] text-[var(--dc-text)]">
                  {line.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold ${
                    line.status === "needsAnswer"
                      ? "bg-[var(--dc-warning-soft)] text-[var(--dc-warning)] border border-[var(--dc-warning-border)]"
                      : "bg-[var(--dc-surface-3)] text-[var(--dc-text-2)]"
                  }`}
                >
                  {STATUS[line.status]}
                </span>
                {line.reasons[0] && (
                  <span className="text-[12.5px] text-[var(--dc-text-3)]">
                    {line.reasons.join(" · ")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ── How this was calculated ──

export const BasisPanel = ({
  result,
  revision,
  verified,
  htsRevisionName,
  transportMode,
}: {
  result: CalculationResult;
  revision?: HtsRevision;
  verified: boolean;
  htsRevisionName: string | null;
  transportMode: TransportMode;
}) => {
  const rows: [string, ReactNode][] = [
    ["Entry date", formatDate(result.asOf)],
    [
      "Tariff rules",
      <span key="rules" className="inline-flex items-center gap-1.5">
        {verified ? (
          <CheckCircleIcon
            className="w-4 h-4 text-[var(--dc-positive)]"
            aria-hidden
          />
        ) : (
          <ExclamationTriangleIcon
            className="w-4 h-4 text-[var(--dc-warning)]"
            aria-hidden
          />
        )}
        {revision ? `HTS ${revision.title}` : "—"}
        {verified ? "" : " · unverified"}
      </span>,
    ],
    ["Base rates", `HTS ${describeHtsRevision(htsRevisionName)} (current)`],
    [
      "Rate column",
      COLUMN_LABEL[result.column] +
        (result.claimedPreference ? ` (${result.claimedPreference})` : ""),
    ],
    ["Transport", TRANSPORT_MODES.find((m) => m.id === transportMode)?.label],
  ];
  return (
    <Panel title="How this was calculated">
      <dl className="flex flex-col gap-2.5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 text-[13.5px]"
          >
            <dt className="text-[var(--dc-text-3)] shrink-0">{label}</dt>
            <dd className="text-right text-[var(--dc-text)] font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {result.warnings.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {result.warnings.map((w) => (
            <li
              key={w}
              className="flex gap-2 text-[12.5px] leading-snug text-[var(--dc-warning)]"
            >
              <ExclamationTriangleIcon
                className="w-4 h-4 shrink-0 mt-px"
                aria-hidden
              />
              {w}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

// ── Shared ──

export const Panel = ({
  title,
  badge,
  description,
  children,
}: {
  title: string;
  badge?: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className={`${styles.card} p-5`}>
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {badge && (
        <span className="rounded-full bg-[var(--dc-accent-soft)] border border-[var(--dc-accent-border)] px-2 py-0.5 text-[12px] font-semibold text-[var(--dc-accent)]">
          {badge}
        </span>
      )}
    </div>
    {description && (
      <p className="mt-1 text-[12.5px] leading-snug text-[var(--dc-text-3)]">
        {description}
      </p>
    )}
    <div className="mt-4">{children}</div>
  </section>
);
