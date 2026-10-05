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
import { isEffectiveOn } from "../../tariffs/engine-v2/dates";
import { formatDate, formatMoney, formatPct, TRANSPORT_MODES } from "./format";
import { mono } from "../ui/font";
import { sortBySpecificity } from "./questions";
import { ReferencedNotes } from "./ReferencedNotes";

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

// When a heading started applying: the start of the unbroken run of its versions in effect on
// `asOf`, so a later rate or scope change doesn't reset it
export const tariffStartDate = (code: string, asOf: string) => {
  const versions = AllRules.tariffs.filter((t) => t.code === code);
  let current = versions.find((t) => isEffectiveOn(t.effective, asOf));
  while (current?.effective.from) {
    const from = current.effective.from;
    const previous = versions.find((t) => t.effective.to === from);
    if (!previous) break;
    current = previous;
  }
  return current?.effective.from;
};

// The legal text of the heading version in effect on the entry's date
const legalText = (code: string, result: CalculationResult) => {
  const versions = AllRules.tariffs.filter((t) => t.code === code);
  const tariff =
    versions.find((t) => isEffectiveOn(t.effective, result.asOf)) ??
    versions[0];
  return tariff?.description?.trim()
    ? {
        text: tariff.description.trim(),
        asOf: result.asOf,
        htsCode: result.htsCode,
      }
    : undefined;
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
  standalone,
}: {
  result: CalculationResult;
  customsValue: number;
  // In a card of its own, rather than above the statement
  standalone?: boolean;
}) => {
  const effectiveRate =
    customsValue > 0 ? (result.totalDuty / customsValue) * 100 : 0;
  const dutyAndFees = result.totalDuty + result.totalFees;
  return (
    // 1px gaps over the border color draw the dividers at every breakpoint
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.45fr_1fr_1fr_1fr] gap-px bg-base-300 ${standalone ? "" : "border-b border-base-300"}`}
    >
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 p-5 sm:p-6 bg-base-100">
        <div className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
          Total duty
        </div>
        <div className="tabular-nums mt-2 text-4xl leading-none font-semibold tracking-tight text-base-content">
          {formatMoney(result.totalDuty)}
        </div>
        <div className="tabular-nums mt-2 text-sm text-base-content/70">
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
  <div className={`p-5 sm:p-6 bg-base-100 ${className}`}>
    <div className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
      {label}
    </div>
    <div className="tabular-nums mt-2 text-2xl leading-none font-semibold tracking-tight text-base-content">
      {value}
    </div>
    <div className="mt-2 text-sm text-base-content/60">{note}</div>
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
  compact,
}: {
  result: CalculationResult;
  customsValue: number;
  unitLabel: string;
  // Chart colors by slice, to tie each line to "Where the money goes"
  sliceColors?: Record<string, string>;
  // The slice being hovered, here or in the chart
  highlight?: string | null;
  onHighlight?: (slice: string | null) => void;
  // One tight line per row: no program, effective date, reasons or legal text
  compact?: boolean;
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
      effectiveFrom: tariffStartDate(line.code, result.asOf),
      detail: line.reasons.join(" · "),
      legal: legalText(line.code, result),
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
      // Only the hovered line changes; the others stay as they are
      active: Boolean(color && highlight && highlight === row.slice),
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
          <MobileRow
            key={row.code}
            {...row}
            link={linked(row)}
            compact={compact}
          />
        ))}
        <MobileTotal label="Total duty" amount={result.totalDuty} />
        {feeRows.map((row) => (
          <MobileRow
            key={row.code}
            {...row}
            link={linked(row)}
            compact={compact}
          />
        ))}
        <MobileTotal label="Total duty and fees" amount={dutyAndFees} strong />
      </ul>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">Duty statement</caption>
          <thead>
            <tr className="bg-base-200 text-base-content/60">
              <th
                scope="col"
                className="text-xs font-semibold uppercase tracking-wider text-base-content/60 py-3 pl-5 sm:pl-6 pr-3 font-semibold"
              >
                Line
              </th>
              <th
                scope="col"
                className="text-xs font-semibold uppercase tracking-wider text-base-content/60 py-3 px-3 font-semibold"
              >
                Applies to
              </th>
              <th
                scope="col"
                className="text-xs font-semibold uppercase tracking-wider text-base-content/60 py-3 px-3 font-semibold text-right"
              >
                Rate
              </th>
              <th
                scope="col"
                className="text-xs font-semibold uppercase tracking-wider text-base-content/60 py-3 pl-3 pr-5 sm:pr-6 font-semibold text-right"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <StatementRow
                key={row.code}
                {...row}
                link={linked(row)}
                compact={compact}
              />
            ))}
            <TotalRow label="Total duty" amount={result.totalDuty} />
            {feeRows.map((row) => (
              <StatementRow
                key={row.code}
                {...row}
                link={linked(row)}
                compact={compact}
              />
            ))}
            <TotalRow label="Total duty and fees" amount={dutyAndFees} strong />
          </tbody>
        </table>
      </div>
    </>
  );
};

// "Legal text" / "Hide legal text"
const LegalToggle = ({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    className="self-start text-sm font-medium text-base-content/60 hover:text-base-content underline-offset-2 hover:underline"
    onClick={(e) => {
      e.preventDefault();
      onToggle();
    }}
    aria-expanded={open}
  >
    {open ? "Hide legal text" : "Legal text"}
  </button>
);

// The legal text and the notes it cites, shared by line items and questions
const LegalPanel = ({
  text,
  citations,
  notesFor,
}: {
  text: string;
  citations?: string[];
  notesFor?: { asOf: string; htsCode: string };
}) => (
  <div className="flex flex-col gap-4 rounded-md border border-base-300 bg-base-100 p-4 shadow-sm">
    <p className="text-sm leading-relaxed text-base-content">{text}</p>
    {notesFor && (
      <ReferencedNotes
        texts={[text]}
        citations={citations}
        asOf={notesFor.asOf}
        htsCode={notesFor.htsCode}
      />
    )}
  </div>
);

interface RowProps {
  code: string;
  slice?: string;
  name: string;
  program?: string;
  effectiveFrom?: string;
  detail?: string;
  // The heading's legal text, for Chapter 99 lines
  legal?: { text: string; asOf: string; htsCode: string };
  basis: number;
  basisText?: string;
  rate?: number;
  rateText?: string;
  amount: number;
}

interface RowLink {
  color?: string;
  active: boolean;
  onHover?: (on: boolean) => void;
}

const linkClass = (link?: RowLink) => (link?.active ? "bg-primary/10" : "");

// Tiny "Effective Mar 4, 2025" after the program name
const EffectiveDate = ({ from }: { from?: string }) =>
  from ? (
    <span className="text-xs text-base-content/60">
      {" · "}Effective {formatDate(from)}
    </span>
  ) : null;

// The line's chart color; lines without one keep the space, so the codes line up
const Swatch = ({ color }: { color?: string }) => (
  <span
    className="inline-block h-2.5 w-2.5 shrink-0 rounded self-center"
    style={color ? { background: color } : undefined}
    aria-hidden
  />
);

const MobileRow = ({
  code,
  name,
  program,
  effectiveFrom,
  detail,
  legal,
  basis,
  basisText,
  rate,
  rateText,
  amount,
  link,
  compact,
}: RowProps & { link?: RowLink; compact?: boolean }) => {
  const [legalOpen, setLegalOpen] = useState(false);
  const full = !compact;
  return (
    <li
      className={`border-t border-base-300 px-5 ${full ? "py-4" : "py-3"} flex flex-col gap-1.5 transition-colors ${linkClass(link)}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={`${mono.className} flex items-center gap-1.5 text-sm font-semibold text-primary`}
          >
            <Swatch color={link?.color} />
            {code}
          </div>
          <div className="text-base font-medium leading-snug text-base-content">
            {name}
          </div>
        </div>
        <div className="tabular-nums text-base font-semibold whitespace-nowrap">
          {formatMoney(amount)}
        </div>
      </div>
      <div className="tabular-nums text-sm text-base-content/70 flex flex-col">
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
      {full && (program || effectiveFrom) && (
        <div className="text-xs text-base-content/60">
          {program}
          <EffectiveDate from={effectiveFrom} />
        </div>
      )}
      {full && detail && (
        <div className="text-sm leading-snug text-base-content/70">
          {detail}
        </div>
      )}
      {full && legal && (
        <LegalToggle
          open={legalOpen}
          onToggle={() => setLegalOpen((x) => !x)}
        />
      )}
      {full && legal && legalOpen && (
        <LegalPanel text={legal.text} notesFor={legal} />
      )}
    </li>
  );
};

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
    className={`border-t border-base-content/20 px-5 py-3.5 flex items-baseline justify-between gap-4 ${
      strong ? "bg-base-200" : ""
    }`}
  >
    <span className="text-sm font-semibold">{label}</span>
    <span
      className={`tabular-nums ${strong ? "text-base font-semibold" : "text-base font-semibold"}`}
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
      className={`flex flex-col max-w-48 ${align === "right" ? "items-end ml-auto text-right" : ""}`}
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
  effectiveFrom,
  detail,
  legal,
  basis,
  basisText,
  rate,
  rateText,
  amount,
  link,
  compact,
}: RowProps & { link?: RowLink; compact?: boolean }) => {
  const [legalOpen, setLegalOpen] = useState(false);
  const full = !compact;
  const pad = full ? "py-4" : "py-2.5";
  return (
    <>
      <tr
        className={`border-t border-base-300 align-top transition-colors ${linkClass(link)}`}
        onMouseEnter={link?.onHover && (() => link.onHover?.(true))}
        onMouseLeave={link?.onHover && (() => link.onHover?.(false))}
      >
        <td className={`${pad} pl-5 sm:pl-6 pr-3`}>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <span
                className={`${mono.className} inline-flex items-center gap-2 text-sm font-semibold text-primary`}
              >
                <Swatch color={link?.color} />
                {code}
              </span>
              <span className="text-base font-medium text-base-content">
                {name}
              </span>
            </div>
            {full && (program || effectiveFrom) && (
              <span className="text-xs text-base-content/60">
                {program}
                <EffectiveDate from={effectiveFrom} />
              </span>
            )}
            {full && detail && (
              <span className="text-sm leading-snug text-base-content/70">
                {detail}
              </span>
            )}
            {full && legal && (
              <LegalToggle
                open={legalOpen}
                onToggle={() => setLegalOpen((x) => !x)}
              />
            )}
          </div>
        </td>
        <td className={`tabular-nums ${pad} px-3 text-sm text-base-content/70`}>
          <Stacked text={basisText ?? formatMoney(basis)} separator=" · " />
        </td>
        <td
          className={`tabular-nums ${pad} px-3 text-sm text-base-content/70 text-right`}
        >
          <Stacked
            text={rateText ?? (rate === undefined ? "—" : formatPct(rate))}
            separator=" + "
            align="right"
          />
        </td>
        <td
          className={`tabular-nums ${pad} pl-3 pr-5 sm:pr-6 text-base font-semibold text-right whitespace-nowrap`}
        >
          {formatMoney(amount)}
        </td>
      </tr>
      {full && legal && legalOpen && (
        <tr>
          <td colSpan={4} className="px-5 sm:px-6 pb-5 pt-1">
            <LegalPanel text={legal.text} notesFor={legal} />
          </td>
        </tr>
      )}
    </>
  );
};

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
    className={`border-t ${strong ? "border-base-content/20 bg-base-200" : "border-base-content/20"}`}
  >
    <td
      colSpan={3}
      className={`py-3.5 pl-5 sm:pl-6 pr-3 text-sm ${strong ? "font-semibold" : "font-semibold text-base-content/70"}`}
    >
      {label}
    </td>
    <td
      className={`tabular-nums py-3.5 pl-3 pr-5 sm:pr-6 text-right whitespace-nowrap ${strong ? "text-base font-semibold" : "text-base font-semibold"}`}
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
  // Leave out to hide the "questions could change this" button (the page has its own)
  onShowDetails?: () => void;
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
    ["Base duty", result.base.amount],
    ...Array.from(byProgram),
    ["Customs fees (MPF, HMF)", result.totalFees],
  ];

  return (
    <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
          You&apos;ll pay about
        </div>
        <div className="tabular-nums text-5xl sm:text-6xl leading-none font-semibold tracking-tight">
          {formatMoney(dutyAndFees)}
        </div>
        <p className="text-base text-base-content/70 max-w-md">
          in duties and fees on {formatMoney(customsValue)} of goods,{" "}
          <span className="tabular-nums font-semibold text-base-content">
            {formatPct(Math.round(effectiveRate * 100) / 100)}
          </span>{" "}
          of their value. Landed cost{" "}
          <span className="tabular-nums font-semibold text-base-content">
            {formatMoney(customsValue + dutyAndFees)}
          </span>
          .
        </p>
      </div>

      <dl className="w-full max-w-md divide-y divide-base-300 border-y border-base-300 text-left">
        {rows.map(([label, amount]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <dt className="text-base text-base-content/70">{label}</dt>
            <dd className="tabular-nums text-base font-semibold">
              {formatMoney(amount)}
            </dd>
          </div>
        ))}
      </dl>

      {openQuestions > 0 && onShowDetails && (
        <button type="button" className="btn btn-sm" onClick={onShowDetails}>
          <InformationCircleIcon className="w-4 h-4 text-primary" />
          {openQuestions === 1
            ? "1 question could change this amount"
            : `${openQuestions} questions could change this amount`}
        </button>
      )}
    </div>
  );
};

// ── Questions ──

// The trade preferences (FTAs and preference programs) the entry could claim, as checkboxes of
// which at most one is checked, each with what claiming it would change
export const PreferenceClaim = ({
  options,
  value,
  onChange,
  impacts = {},
}: {
  options: { symbol: string; name: string }[];
  value: string;
  onChange: (symbol: string) => void;
  impacts?: Record<string, number>;
}) => (
  <ul className="flex flex-col divide-y divide-base-300">
    {options.map((p) => (
      <li key={p.symbol} className="py-3.5 first:pt-0 last:pb-0">
        <CheckRow
          checked={value === p.symbol}
          onChange={(checked) => onChange(checked ? p.symbol : "")}
          code={p.symbol}
          label={p.name}
          impact={impacts[p.symbol]}
          showNoChange
        />
      </li>
    ))}
  </ul>
);

// A titled group inside the adjustments panel
const AdjustmentSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <div>
      <h4 className="text-sm font-semibold text-base-content">{title}</h4>
      <p className="text-xs leading-snug text-base-content/60">{description}</p>
    </div>
    {children}
  </section>
);

export const QuestionsPanel = ({
  questions,
  answers,
  impacts,
  onAnswer,
  lines,
  asOf,
  htsCode,
  preference,
}: {
  questions: Question[];
  answers: Record<string, unknown>;
  impacts: Record<string, number>;
  onAnswer: (id: string, value: unknown) => void;
  lines: DutyLine[];
  asOf: string;
  // The entered code, to highlight it in referenced code lists
  htsCode?: string;
  // The trade preference control, when the entry has preferences to claim
  preference?: ReactNode;
}) => {
  const [showAll, setShowAll] = useState(false);
  // Questions that change the amount (or are already answered) come first; the rest
  // wouldn't change this entry's total, so they're tucked away. Within each group, questions
  // about specific products come before ones that apply to a country's goods or to everything
  // (the order depends only on the headings, so answering one doesn't reshuffle the list).
  const matters = (q: Question) =>
    q.answered ||
    answers[q.input.id] !== undefined ||
    q.input.type !== "boolean" ||
    Math.abs(impacts[q.input.id] ?? 0) >= 0.005;
  const sorted = sortBySpecificity(questions, asOf);
  const primary = sorted.filter(matters);
  const secondary = sorted.filter((q) => !matters(q));
  const visible = showAll ? [...primary, ...secondary] : primary;
  const open = primary.filter((q) => !q.answered).length;

  return (
    <Panel
      title="Possible Adjustments"
      badge={open > 0 ? `${open} could change the total` : undefined}
      description="Review the conditions below to get a more accurate duty calculation for your import"
    >
      <div className="flex flex-col gap-6">
        {preference && (
          <AdjustmentSection
            title="Special Tariff Programs"
            description="Free trade agreement or preference programs your goods may qualify for."
          >
            {preference}
          </AdjustmentSection>
        )}
        {questions.length > 0 && (
          <AdjustmentSection
            title="Special Tariff Provisions"
            description="Tariffs and conditions that may apply to your goods."
          >
            <div>
              {visible.length > 0 ? (
                <ul className="flex flex-col divide-y divide-base-300">
                  {visible.map((q) => (
                    <li
                      key={q.input.id}
                      className="py-3.5 first:pt-0 last:pb-0"
                    >
                      <QuestionControl
                        question={q}
                        value={answers[q.input.id]}
                        impact={impacts[q.input.id]}
                        heading={lines.find(
                          (l) => `confirm:${l.code}` === q.input.id,
                        )}
                        onChange={(v) => onAnswer(q.input.id, v)}
                        notesFor={htsCode ? { asOf, htsCode } : undefined}
                      />
                    </li>
                  ))}
                </ul>
              ) : preference ? null : (
                <p className="text-sm text-base-content/70">
                  No answer would change the total for this entry.
                </p>
              )}
              {secondary.length > 0 && (
                <button
                  type="button"
                  className="link link-primary link-hover font-semibold mt-4 text-sm"
                  onClick={() => setShowAll((x) => !x)}
                  aria-expanded={showAll}
                >
                  {showAll
                    ? "Hide questions that don't change the total"
                    : `Show ${secondary.length} more ${secondary.length === 1 ? "question" : "questions"} that don't change the total`}
                </button>
              )}
            </div>
          </AdjustmentSection>
        )}
      </div>
    </Panel>
  );
};

const Impact = ({ amount }: { amount?: number }) => {
  if (amount === undefined || Math.abs(amount) < 0.005) return null;
  const lower = amount < 0;
  return (
    <span
      className={`tabular-nums inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${
        lower ? "bg-success/10 text-success" : "bg-error/10 text-error"
      }`}
    >
      {lower ? "−" : "+"}
      {formatMoney(Math.abs(amount))}
    </span>
  );
};

// One checkbox row, shared by the questions and the trade preferences: label, the amount checking
// it would change the total by, and optional legal text
const CheckRow = ({
  checked,
  onChange,
  code,
  label,
  impact,
  help,
  showNoChange = false,
  citations,
  notesFor,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  code?: string;
  label: ReactNode;
  impact?: number;
  help?: string;
  // Extra note citations to show with the legal text, beyond those the text itself cites
  citations?: string[];
  // The entry the referenced notes are shown for (date and code); without it, no notes
  notesFor?: { asOf: string; htsCode: string };
  // Say "No change" when checking it wouldn't change the total (otherwise nothing is shown)
  showNoChange?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const noChange =
    showNoChange &&
    !checked &&
    impact !== undefined &&
    Math.abs(impact) < 0.005;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="checkbox checkbox-primary checkbox-sm"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="flex flex-col gap-1 min-w-0">
          <span className="text-sm leading-snug text-base-content">
            {code && (
              <span
                className={`${mono.className} mr-1.5 text-sm font-semibold text-primary`}
              >
                {code}
              </span>
            )}
            {label}
          </span>
          {(!checked && impact !== undefined && Math.abs(impact) >= 0.005) ||
          noChange ||
          help ? (
            <span className="flex flex-wrap items-center gap-2">
              {!checked && <Impact amount={impact} />}
              {noChange && (
                <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-base-300 text-base-content/60">
                  No change to the total
                </span>
              )}
              {help && (
                <LegalToggle
                  open={expanded}
                  onToggle={() => setExpanded((x) => !x)}
                />
              )}
            </span>
          ) : null}
        </span>
      </label>
      {expanded && help && (
        <div className="ml-8">
          <LegalPanel text={help} citations={citations} notesFor={notesFor} />
        </div>
      )}
    </div>
  );
};

const QuestionControl = ({
  question,
  value,
  impact,
  heading,
  onChange,
  notesFor,
}: {
  question: Question;
  value: unknown;
  impact?: number;
  heading?: DutyLine;
  onChange: (value: unknown) => void;
  notesFor?: { asOf: string; htsCode: string };
}) => {
  const { input } = question;
  const code = heading?.code;
  const label = code ? heading.name : input.label;

  if (input.type === "boolean") {
    return (
      <CheckRow
        checked={value === true}
        onChange={(checked) => onChange(checked || undefined)}
        code={code}
        label={label}
        impact={impact}
        help={input.help}
        citations={input.citations}
        notesFor={notesFor}
      />
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm leading-snug text-base-content">
        {input.label}
      </span>
      <input
        type={input.type === "date" ? "date" : "number"}
        className="input input-bordered input-sm w-full"
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
        <span className="text-xs text-base-content/60">{input.help}</span>
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
    <div className="rounded-lg border border-base-300 bg-base-100 shadow-sm">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 p-5 sm:px-6 text-left"
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
      >
        <span>
          <span className="block text-base font-semibold">
            Checked but not applied
          </span>
          <span className="block mt-0.5 text-xs text-base-content/60">
            {notApplied.length} other headings match this code and country
          </span>
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 shrink-0 text-base-content/60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="border-t border-base-300 divide-y divide-base-300">
          {notApplied.map((line) => (
            <li
              key={line.code}
              className="px-5 sm:px-6 py-3.5 flex flex-col gap-1"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span
                  className={`${mono.className} text-sm font-semibold text-base-content/70`}
                >
                  {line.code}
                </span>
                <span className="text-sm text-base-content">{line.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                    line.status === "needsAnswer"
                      ? "bg-warning/10 text-warning border border-warning/40"
                      : "bg-base-300 text-base-content/70"
                  }`}
                >
                  {STATUS[line.status]}
                </span>
                {line.reasons[0] && (
                  <span className="text-xs text-base-content/60">
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
          <CheckCircleIcon className="w-4 h-4 text-success" aria-hidden />
        ) : (
          <ExclamationTriangleIcon
            className="w-4 h-4 text-warning"
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
            className="flex items-baseline justify-between gap-4 text-sm"
          >
            <dt className="text-base-content/60 shrink-0">{label}</dt>
            <dd className="text-right text-base-content font-medium">
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
              className="flex gap-2 text-sm leading-snug text-warning"
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
  <section className="rounded-lg border border-base-300 bg-base-100 shadow-sm p-5 sm:p-6">
    {/* The badge drops under the title when they don't fit side by side */}
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
      <h3 className="text-base font-semibold">{title}</h3>
      {badge && (
        <span className="whitespace-nowrap rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-xs font-semibold text-primary">
          {badge}
        </span>
      )}
    </div>
    {description && (
      <p className="mt-0.5 text-xs leading-snug text-base-content/60">
        {description}
      </p>
    )}
    <div className="mt-4">{children}</div>
  </section>
);
