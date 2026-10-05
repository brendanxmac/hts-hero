import { ArrowDownRightIcon, ArrowUpRightIcon } from "@heroicons/react/20/solid";
import { HistorySegment } from "@/tariffs/engine-v2/history";
import * as ui from "@/components/ui/styles";
import { shortDate, signedMoney, signedPct } from "./format";
import { TREND_PILL, trendOf } from "./trend";
import { Metric } from "./types";

// Headline: duty on the entry date, how it compares with the start, and the low, high and
// number of changes
export const RateHistoryHeadline = ({
  history,
  current,
  label,
  metric,
  value,
  show,
}: {
  history: HistorySegment[];
  // The segment the headline is about
  current: HistorySegment;
  label: string;
  metric: Metric;
  value: (amount: number) => number;
  show: (amount: number) => string;
}) => {
  const first = history[0];
  const latest = history[history.length - 1];
  // Compared with the start; or, when the entry date is at the start, with the latest revision
  const looksAhead = current === first && history.length > 1;
  const compared = looksAhead ? latest : current;
  const delta = compared.result.totalDuty - first.result.totalDuty;
  const deltaPct =
    first.result.totalDuty > 0 ? (delta / first.result.totalDuty) * 100 : null;
  const deltaWhen = looksAhead
    ? `by ${shortDate(latest.from)}`
    : `since ${shortDate(first.from)}`;
  const totals = history.map((s) => s.result.totalDuty);
  const changes = history.length - 1;

  return (
    <div>
      <div className={ui.label}>{label}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
        <span className={ui.metric.primaryCompact}>{show(current.result.totalDuty)}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${TREND_PILL[trendOf(delta)]}`}
        >
          {Math.abs(delta) < 0.005 ? (
            <>No change since {shortDate(first.from)}</>
          ) : (
            <>
              {delta > 0 ? (
                <ArrowUpRightIcon className="w-3.5 h-3.5" aria-hidden />
              ) : (
                <ArrowDownRightIcon className="w-3.5 h-3.5" aria-hidden />
              )}
              {metric === "usd" ? signedMoney(delta) : signedPct(value(delta))}
              {deltaPct !== null && metric === "usd" && ` (${signedPct(deltaPct)})`}
              <span className="font-medium opacity-80">{deltaWhen}</span>
            </>
          )}
        </span>
      </div>
      {changes > 0 && (
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
          {[
            ["Low", show(Math.min(...totals))],
            ["High", show(Math.max(...totals))],
            ["Changes", String(changes)],
          ].map(([term, detail]) => (
            <div key={term} className="rounded-md bg-base-200 px-2.5 py-1.5">
              <dt className="text-base-content/60">{term}</dt>
              <dd className="font-semibold tabular-nums text-base-content">{detail}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
