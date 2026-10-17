import { shortDate } from "../rate-history/format";
import type { AccountPitch } from "../calculator/ConversionDialog";
import { pct } from "./parts";
import { Overview } from "./useOverview";

// "Get Insights" in the calculator: the free account's pitch, led by what the import's Overview
// (on its page in the Tracker) would show, in this import's own numbers. Savings are always
// "could", the rest is plain fact; with nothing worked out yet, the same points without numbers.
export const insightsPitch = (o: Overview | null): AccountPitch => {
  const best = o ? Math.max(o.savings[0]?.pct ?? 0, o.cheaper?.[0] ? o.ratePct - o.cheaper[0].pct : 0) : 0;
  const ways = o ? o.savings.length + (o.cheaper?.length ?? 0) : 0;
  const top = o?.charges.filter((c) => c.usd > 0.005).sort((a, b) => b.pct - a.pct)[0];
  return {
    title: best > 0.005 ? `This duty could be up to ${pct(best)} lower. See how, free` : "See the full picture of this import, free",
    thisImport: [
      best > 0.005
        ? `${ways} ${ways === 1 ? "way" : "ways"} this duty could be lower: exemptions to check, and cheaper countries among its biggest US suppliers`
        : "Every exemption to check, and cheaper countries among its biggest US suppliers",
      o && top ? `Where the ${pct(o.ratePct)} rate comes from, and why each tariff applies (${top.name} is the biggest)` : "Where the rate comes from, and why each tariff applies",
      o?.history
        ? `Its duty history: ${o.changes} rate ${o.changes === 1 ? "change" : "changes"} since ${shortDate(o.history.fromDate, true)}`
        : "Its duty history, every change and why",
      "Tariff news that touches it, the moment it lands",
    ],
    cta: "Create my free account",
  };
};
