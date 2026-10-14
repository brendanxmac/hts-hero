import { StatStrip, StatItem } from "@/components/ui/StatStrip";
import { formatRate } from "./formatRate";
import { TrackedProduct } from "./report";

// The imports showing at a glance: how many, the average and highest rates, and how many could be
// lower. In the Tracker's look (DESIGN_SYSTEM §15): cobalt for the user's figure, green for money.
export const ReportSummary = ({ rows }: { rows: TrackedProduct[] }) => {
  const average = rows.reduce((sum, r) => sum + r.totalPct, 0) / rows.length;
  const highest = rows.reduce((top, r) => (r.totalPct > top.totalPct ? r : top), rows[0]);
  const countries = new Set(rows.map((r) => r.entry.country.code)).size;
  const couldBeLower = rows.filter((r) => r.bestSavingPct > 0.005).length;
  const tiles: StatItem[] = [
    {
      label: "Imports",
      value: rows.length.toLocaleString("en-US"),
      note: `From ${countries} ${countries === 1 ? "country" : "countries"}`,
    },
    { label: "Average duty rate", value: formatRate(average), note: "Across these imports", tone: "primary" },
    {
      label: "Highest rate",
      value: formatRate(highest.totalPct),
      note: `${highest.entry.element.htsno} · ${highest.entry.country.flag} ${highest.entry.country.name}`,
    },
    {
      label: "Could be lower",
      value: couldBeLower.toLocaleString("en-US"),
      note: couldBeLower ? "May qualify for an exemption" : "No exemptions to check",
      tone: couldBeLower ? "success" : undefined,
    },
  ];
  return <StatStrip label="Your imports at a glance" stats={tiles} />;
};
