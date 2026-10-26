import { Countries, Country } from "../constants/countries";
import { AllRules } from "../tariffs/engine-v2/data";
import { addDays, calculateHistory, HistorySegment, LineChange } from "../tariffs/engine-v2/history";
import { getVerifiedRevisions } from "../tariffs/engine-v2/revisions";
import { CalculationResult, DutyLine, IsoDate, Source } from "../tariffs/engine-v2/types";
import { formatDutyPct, formatSummaryDate } from "./hts-duty-summary";
import { MICRO_CUSTOMS_VALUE, microInput, type MicroInput } from "./hts-micro-estimate";

// The Duty History section of an /hts/[code] page: how the duty on the page's standard shipment
// changed from each of the largest sources of US imports, over the dates our rates are verified
// for. Server only, from the same engine (and the same program names) as Duty by Country.

// An SEO test: only these chapters show the section and the "last changed" line under the
// heading. Chapters 84 and 61 are the controls (similar Search Console impressions). See
// reports/HTS Hero page data for SEO and AI search.md.
export const DUTY_HISTORY_CHAPTERS = [73, 94];

export const showsDutyHistory = (chapter: number, htsno: string) =>
  DUTY_HISTORY_CHAPTERS.includes(chapter) && !htsno.startsWith("99");

// The countries the table covers: the first of Duty by Country's
export const DUTY_HISTORY_COUNTRIES = 10;

export interface HistoryMeasure {
  code: string; // Chapter 99 heading
  program: string; // "Section 301 – Forced Labor", as Duty by Country names it
  ratePct?: number;
  beforeRatePct?: number; // for a measure whose rate changed
  source?: Source;
}

export interface DutyChange {
  date: IsoDate;
  beforePct: number;
  afterPct: number;
  started: HistoryMeasure[]; // now applies
  stopped: HistoryMeasure[]; // no longer applies (ended, or replaced by a measure it doesn't stack with)
  changed: HistoryMeasure[];
}

export interface CountryDutyHistory {
  country: Country;
  startPct: number; // on `since`
  nowPct: number;
  changes: DutyChange[]; // oldest first; includes changes that left the total the same
}

export interface CodeDutyHistory {
  since: IsoDate; // the first date our rates are verified for
  asOf: IsoDate;
  // "total": base plus tariffs, as a percent of value. "additional": the base rate is per unit
  // ("6.3¢/liter"), so only the additional tariffs are a percent of value
  basis: "total" | "additional";
  baseRate: string;
  rows: CountryDutyHistory[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const programName = (id?: string) => AllRules.programs.find((p) => p.id === id)?.name ?? "Additional duty";

const percentOf = (result: CalculationResult, basis: CodeDutyHistory["basis"]) => {
  const amount =
    basis === "total"
      ? result.totalDuty
      : result.lines.filter((l) => l.status === "applies").reduce((sum, l) => sum + l.amount, 0);
  return round2((amount / MICRO_CUSTOMS_VALUE) * 100);
};

const measure = (line: DutyLine, before?: DutyLine): HistoryMeasure => ({
  code: line.code,
  program: line.code === "BASE" ? "Base duty" : programName(line.program),
  ratePct: line.ratePct,
  beforeRatePct: before?.ratePct,
  source: line.source,
});

const toChange = (previous: HistorySegment, segment: HistorySegment, basis: CodeDutyHistory["basis"]): DutyChange => {
  const of = (kind: LineChange["kind"]) => segment.changes.filter((c) => c.kind === kind);
  return {
    date: segment.from,
    beforePct: percentOf(previous.result, basis),
    afterPct: percentOf(segment.result, basis),
    started: of("added").map((c) => measure(c.after!)),
    stopped: of("removed").map((c) => measure(c.before!)),
    changed: of("changed").map((c) => measure(c.after!, c.before)),
  };
};

// null when there's no verified history, or the base rate can't be calculated (every total
// would be partial)
export const codeDutyHistory = (
  input: Omit<MicroInput, "country">,
  countryCodes: string[],
): CodeDutyHistory | null => {
  const verified = getVerifiedRevisions();
  if (!verified.length) return null;
  const since = verified[0].from;
  const to = addDays(input.asOf, 1);

  const runs = countryCodes.flatMap((code) => {
    const country = Countries.find((c) => c.code === code);
    if (!country) return [];
    const segments = calculateHistory(AllRules, microInput({ ...input, country: code }), since, to);
    return segments.length ? [{ country, segments }] : [];
  });
  if (!runs.length || runs.some((r) => r.segments.some((s) => s.result.baseNotCalculated))) return null;
  const basis: CodeDutyHistory["basis"] = runs.some((r) => r.segments.some((s) => s.result.requiresQuantity))
    ? "additional"
    : "total";
  const baseRate = runs[0].segments[runs[0].segments.length - 1].result.base.reasons[0] ?? "";

  const rows = runs.map(({ country, segments }) => ({
    country,
    startPct: percentOf(segments[0].result, basis),
    nowPct: percentOf(segments[segments.length - 1].result, basis),
    changes: segments.slice(1).map((s, i) => toChange(segments[i], s, basis)),
  }));
  return { since, asOf: input.asOf, basis, baseRate, rows };
};

// The changes that moved the total (others only swapped the tariffs behind it)
export const totalChanges = (row: CountryDutyHistory) => row.changes.filter((c) => c.beforePct !== c.afterPct);

const joinList = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const step = (c: DutyChange) =>
  `${c.afterPct > c.beforePct ? "rose" : "fell"} to ${formatDutyPct(c.afterPct)} on ${formatSummaryDate(c.date)}`;

// The section's lead, and the FAQ's answer: one paragraph an AI answer can lift whole.
// "From China, the total duty on HTS 3926.90.99 is 25.3% as of Oct 26, 2026, down from 32.8% on
// Nov 17, 2025. It fell to 22.8% on Feb 24, 2026 and rose to 25.3% on Jul 24, 2026."
export const dutyHistorySentence = (htsno: string, history: CodeDutyHistory, row: CountryDutyHistory) => {
  const subject =
    history.basis === "total"
      ? `From ${row.country.name}, the total duty on HTS ${htsno}`
      : `From ${row.country.name}, the additional tariffs on HTS ${htsno} (on top of the ${history.baseRate} base rate)`;
  const asOf = formatSummaryDate(history.asOf);
  const since = formatSummaryDate(history.since);
  const steps = totalChanges(row);

  if (!steps.length) {
    const swapped = row.changes[row.changes.length - 1];
    return (
      `${subject} has been ${formatDutyPct(row.nowPct)} since ${since}, as of ${asOf}.` +
      (swapped ? ` The tariffs behind it last changed on ${formatSummaryDate(swapped.date)}.` : "")
    );
  }

  const direction =
    row.nowPct === row.startPct ? "the same as" : row.nowPct > row.startPct ? "up from" : "down from";
  const story =
    steps.length <= 4
      ? `It ${joinList(steps.map(step))}.`
      : `It changed ${steps.length} times; most recently it ${step(steps[steps.length - 1])}.`;
  return `${subject} is ${formatDutyPct(row.nowPct)} as of ${asOf}, ${direction} ${formatDutyPct(row.startPct)} on ${since}. ${story}`;
};

// "Section 301 – Forced Labor (12.5%)"
export const describeMeasure = (m: HistoryMeasure) =>
  m.ratePct !== undefined && m.ratePct > 0 ? `${m.program} (${formatDutyPct(m.ratePct)})` : m.program;

// The latest change in words, for the FAQ: "On Jul 24, 2026, Section 301 – Forced Labor (12.5%)
// started to apply and Section 122 – Balance of Payments Surcharge (10%) stopped applying."
export const latestChangeSentence = (row: CountryDutyHistory) => {
  const latest = row.changes[row.changes.length - 1];
  if (!latest) return "";
  const parts = [
    ...(latest.started.length ? [`${joinList(latest.started.map(describeMeasure))} started to apply`] : []),
    ...(latest.stopped.length ? [`${joinList(latest.stopped.map(describeMeasure))} stopped applying`] : []),
    ...latest.changed.map(
      (m) => `${m.program} went from ${formatDutyPct(m.beforeRatePct ?? 0)} to ${formatDutyPct(m.ratePct ?? 0)}`
    ),
  ];
  return parts.length ? `On ${formatSummaryDate(latest.date)}, ${joinList(parts)}.` : "";
};
