import { describeTotal, HtsDutySummary } from "@/libs/hts-duty-summary";
import { heat } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";

// The first few totals from Duty by Country, in the hero's rail, linking down to the full table
export function DutyPreview({ summary }: { summary: HtsDutySummary }) {
  return (
    <a
      href="#duty-by-country"
      className={`${ui.card} group block px-4 py-3 transition-colors hover:border-primary/40`}
    >
      <span className={`${ui.cardTitle} flex items-center justify-between`}>
        Total duty by country
        <span className="text-xs font-medium text-primary group-hover:underline">
          All {summary.rows.length} →
        </span>
      </span>
      <ul className="mt-2 flex flex-col gap-1 text-sm tabular-nums">
        {summary.rows.slice(0, 5).map((row) => (
          <li key={row.country.code} className="flex items-center justify-between gap-3">
            <span className="text-base-content/70">
              <span aria-hidden="true" className="mr-1.5">{row.country.flag}</span>
              {row.country.name}
            </span>
            <span className="rounded px-1.5 py-0.5 font-semibold text-base-content" style={{ background: heat(row.totalPct) }}>
              {describeTotal(row)}
            </span>
          </li>
        ))}
      </ul>
    </a>
  );
}
