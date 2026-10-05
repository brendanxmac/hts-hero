import * as ui from "@/components/ui/styles";
import { formatRate } from "./formatRate";
import { WatchRow } from "./report";

// The list at a glance: how many products, the average and highest rates, and how many
// could be lower
export const ReportSummary = ({ rows }: { rows: WatchRow[] }) => {
  const average = rows.reduce((sum, r) => sum + r.totalPct, 0) / rows.length;
  const highest = rows.reduce((top, r) => (r.totalPct > top.totalPct ? r : top), rows[0]);
  const countries = new Set(rows.map((r) => r.entry.country.code)).size;
  const couldBeLower = rows.filter((r) => r.bestSavingPct > 0.005).length;
  const tiles: { label: string; value: string; note: string; accent?: boolean }[] = [
    {
      label: "Products",
      value: String(rows.length),
      note: `From ${countries} ${countries === 1 ? "country" : "countries"}`,
    },
    { label: "Average duty rate", value: formatRate(average), note: "Across the list", accent: true },
    {
      label: "Highest rate",
      value: formatRate(highest.totalPct),
      note: `${highest.entry.element.htsno} · ${highest.entry.country.flag} ${highest.entry.country.name}`,
    },
    {
      label: "Could be lower",
      value: String(couldBeLower),
      note: couldBeLower ? "Have an exemption worth checking" : "No exemptions to check",
    },
  ];
  return (
    // 1px gaps over the border color draw the dividers, like the calculator's summary
    <div className={`${ui.card}`}>
      <dl className="grid grid-cols-2 gap-px bg-base-300 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-base-100 p-5">
            <dt className={ui.label}>{t.label}</dt>
            <dd
              className={`mt-2 text-2xl font-semibold leading-none tracking-tight tabular-nums ${
                t.accent ? "text-primary" : "text-base-content"
              }`}
            >
              {t.value}
            </dd>
            <dd className="mt-2 truncate text-xs text-base-content/60" title={t.note}>
              {t.note}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
