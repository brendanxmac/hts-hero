import { describeTotal, HtsDutySummary } from "@/libs/hts-duty-summary";
import { heat } from "@/components/ui/theme";
import * as tt from "@/components/ui/styles/tracker";

// The first few totals from Duty by Country, in the hero's rail, linking down to the full table
export function DutyPreview({ summary }: { summary: HtsDutySummary }) {
  return (
    <a
      href="#duty-by-country"
      className={`${tt.panel} overflow-hidden group block px-6 py-5 transition-colors hover:border-primary/40`}
    >
      <span className={`${tt.title} flex items-center justify-between`}>
        Total duty by country
        <span className="text-xs font-medium text-primary group-hover:underline">
          All {summary.rows.length} →
        </span>
      </span>
      <ul className="mt-3 flex flex-col gap-1.5 text-sm tabular-nums">
        {summary.rows.slice(0, 5).map((row) => (
          <li key={row.country.code} className="flex items-center justify-between gap-3">
            <span className="text-base-content/70">
              <span aria-hidden="true" className="mr-1.5">{row.country.flag}</span>
              {row.country.name}
            </span>
            <span className="rounded-full px-2.5 py-0.5 font-semibold text-base-content" style={{ background: heat(row.totalPct) }}>
              {describeTotal(row)}
            </span>
          </li>
        ))}
      </ul>
    </a>
  );
}
