import Link from "next/link";
import { formatDutyPct, formatSummaryDate } from "@/libs/hts-duty-summary";
import {
  CodeDutyHistory,
  CountryDutyHistory,
  describeMeasure,
  DutyChange,
  dutyHistorySentence,
  HistoryMeasure,
  totalChanges,
} from "@/libs/hts-duty-history";
import { mono } from "@/components/ui/font";
import { CardSection } from "./CardSection";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table/Table";

// How the duty on an HTS code has changed, on the /hts/[code] page: the lead country's changes
// (China first) as a dated list, each naming the tariffs that started or stopped applying with
// their Chapter 99 headings and legal sources, then the largest sources of US imports in a table.
// Server-rendered text, so search engines and AI answers can read and quote it.

const Measures = ({ label, measures }: { label: string; measures: HistoryMeasure[] }) =>
  measures.length ? (
    <p className="m-0">
      <span className="font-medium text-base-content">{label}:</span>{" "}
      {measures.map((m, i) => (
        <span key={m.code}>
          {i > 0 && "; "}
          {m.beforeRatePct !== undefined
            ? `${m.program} (${formatDutyPct(m.beforeRatePct)} → ${formatDutyPct(m.ratePct ?? 0)})`
            : describeMeasure(m)}
          {m.code !== "BASE" && (
            <>
              {", "}
              <Link href={`/hts/${m.code}`} className={`${mono.className} underline-offset-4 hover:text-primary hover:underline`}>
                {m.code}
              </Link>
            </>
          )}
        </span>
      ))}
    </p>
  ) : null;

// The documents behind the tariffs that started or changed, once each
const sourcesOf = (change: DutyChange) => {
  const seen = new Set<string>();
  return [...change.started, ...change.changed].flatMap((m) => {
    const citation = m.source?.citation;
    if (!citation || seen.has(citation)) return [];
    seen.add(citation);
    return [{ citation, url: m.source?.url }];
  });
};

function ChangeItem({ change }: { change: DutyChange }) {
  const sources = sourcesOf(change);
  return (
    <li className="flex flex-col gap-1.5 px-6 py-4 sm:flex-row sm:gap-6">
      <time dateTime={change.date} className="shrink-0 font-semibold text-base-content sm:w-32">
        {formatSummaryDate(change.date)}
      </time>
      <div className={`${ui.bodySm} flex min-w-0 flex-col gap-1`}>
        <p className="m-0 font-semibold text-base-content">
          {change.beforePct === change.afterPct
            ? `Unchanged at ${formatDutyPct(change.afterPct)}`
            : `${formatDutyPct(change.beforePct)} → ${formatDutyPct(change.afterPct)}`}
        </p>
        <Measures label="Now applies" measures={change.started} />
        <Measures label="No longer applies" measures={change.stopped} />
        <Measures label="Rate changed" measures={change.changed} />
        {sources.length > 0 && (
          <p className={`m-0 ${ui.caption}`}>
            Source:{" "}
            {sources.map((s, i) => (
              <span key={s.citation}>
                {i > 0 && "; "}
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener" className="underline-offset-4 hover:text-primary hover:underline">
                    {s.citation}
                  </a>
                ) : (
                  s.citation
                )}
              </span>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

const lastChange = (row: CountryDutyHistory) => {
  const steps = totalChanges(row);
  const last = steps[steps.length - 1];
  return last
    ? `${formatSummaryDate(last.date)}: ${formatDutyPct(last.beforePct)} → ${formatDutyPct(last.afterPct)}`
    : "No change";
};

export function DutyHistory({ htsno, history }: { htsno: string; history: CodeDutyHistory }) {
  const lead = history.rows.find((r) => r.country.code === "CN") ?? history.rows[0];
  const since = formatSummaryDate(history.since);
  const measure = history.basis === "total" ? "Total duty" : "Additional tariffs";

  return (
    <CardSection
      id="duty-history"
      kicker={`Duty history · since ${since}`}
      title={`Duty History for HTS ${htsno}`}
      lead={dutyHistorySentence(htsno, history, lead)}
      footer={
        <p className={`${ui.caption} m-0 leading-relaxed`}>
          {measure} on goods entered on each date at the general rate, before customs fees (MPF, HMF) and
          any antidumping or countervailing duties, from the same tariff data as the duty calculator.
          {history.basis === "additional" && ` The ${history.baseRate} base rate is charged on top.`} History
          starts on {since}, the first date our tariff data is verified for. Changes that only swapped one
          tariff for another at the same rate are listed but don&apos;t count toward the totals&apos; changes.
        </p>
      }
    >
      {lead.changes.length > 0 && (
        <div className="border-b border-base-300">
          <h3 className={`${tt.eyebrow()} m-0 px-6 pt-5`}>Changes from {lead.country.name}</h3>
          <ol className="m-0 list-none divide-y divide-base-300 p-0">
            {[...lead.changes].reverse().map((change) => (
              <ChangeItem key={change.date} change={change} />
            ))}
          </ol>
        </div>
      )}

      <h3 className={`${tt.eyebrow()} m-0 px-6 pt-5 pb-2`}>By Country of Origin</h3>
      <Table framed={false} valign="top">
        <THead>
          <Tr>
            <Th>Country of origin</Th>
            <Th align="right">{since}</Th>
            <Th align="right">{formatSummaryDate(history.asOf)}</Th>
            <Th align="right">Changes</Th>
            <Th>Last change</Th>
          </Tr>
        </THead>
        <TBody>
          {history.rows.map((row) => (
            <Tr key={row.country.code}>
              <RowHeader className="whitespace-nowrap">
                <span aria-hidden="true" className="mr-2">{row.country.flag}</span>
                {row.country.name}
              </RowHeader>
              <Td muted align="right">{formatDutyPct(row.startPct)}</Td>
              <Td align="right" className="font-semibold">{formatDutyPct(row.nowPct)}</Td>
              <Td muted align="right">{totalChanges(row).length}</Td>
              <Td muted className="whitespace-nowrap">{lastChange(row)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </CardSection>
  );
}
