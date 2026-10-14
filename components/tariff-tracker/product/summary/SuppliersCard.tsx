import { barWidth } from "@/components/ui/charts/kit";
import { Countries } from "../../../../constants/countries";
import { CENSUS_NOTICE } from "../../../duty-calculator/lib/census";
import { formatImportValue } from "../../../duty-calculator/lib/usImportsData";
import { formatRate } from "../../formatRate";
import { useInsights } from "../../insights/InsightsContext";
import { TrackedProduct } from "../../report";
import { SummaryCard } from "./SummaryCard";

// Where the US buys this product: its largest suppliers last year (Census), each with its share
// and the duty it pays, with the product's own origin picked out
const TOP = 6;

export const SuppliersCard = ({ product, onSourcing }: { product: TrackedProduct; onSourcing: () => void }) => {
  const insights = useInsights();
  const imports = insights.importsFor(product.entry.element.htsno);
  const costs = insights.origins.get(product.key);
  const own = product.entry.country.code;

  if (imports === undefined) {
    return (
      <SummaryCard title="Who supplies the US">
        <div className="h-40 animate-pulse rounded-2xl bg-tt-soft" aria-busy="true" />
      </SummaryCard>
    );
  }
  if (!imports) {
    return (
      <SummaryCard title="Who supplies the US">
        <p className="m-0 text-sm text-base-content/70">Census has no US import figures for this code.</p>
      </SummaryCard>
    );
  }

  const ranked = Array.from(imports.byCountry.entries())
    .filter(([, v]) => v.value > 0)
    .sort((a, b) => b[1].value - a[1].value);
  const total = ranked.reduce((sum, [, v]) => sum + v.value, 0);
  const top = ranked.slice(0, TOP);
  if (!top.some(([code]) => code === own)) {
    const mine = ranked.find(([code]) => code === own);
    if (mine) top.push(mine);
  }
  const max = top[0]?.[1].value ?? 1;
  const rateOf = (code: string) => (code === own ? product.totalPct : costs?.find((c) => c.country.code === code)?.pct);

  return (
    <SummaryCard title="Who supplies the US" link={{ label: "Cheaper sources", onClick: onSourcing }}>
      <p className="m-0 text-sm text-base-content/70">
        The US imported <span className="font-semibold text-base-content">{formatImportValue(total)}</span> of{" "}
        {imports.level === 10 ? "this product" : "products like this"} in {imports.year}.
      </p>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {top.map(([code, v]) => {
          const country = Countries.find((c) => c.code === code);
          const rate = rateOf(code);
          const mine = code === own;
          return (
            <li key={code} className="grid grid-cols-[8rem_minmax(0,1fr)_4.5rem_4rem] items-center gap-3 text-sm">
              <span className={`truncate ${mine ? "font-semibold text-primary" : "text-base-content"}`}>
                {country?.flag} {country?.name ?? code}
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-base-300" aria-hidden>
                {/* Runtime width (DESIGN_SYSTEM §10) */}
                <div className={`h-full rounded-full ${mine ? "bg-primary" : "bg-base-content/40"}`} style={{ width: barWidth(v.value, max) }} />
              </div>
              <span className="text-right tabular-nums text-base-content/70">{Math.round((v.value / total) * 100)}%</span>
              <span className={`text-right tabular-nums ${rate !== undefined && rate < product.totalPct - 0.005 ? "font-semibold text-success" : "text-base-content/70"}`}>
                {rate === undefined ? "—" : formatRate(rate)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="m-0 text-xs text-base-content/60">
        Share of US imports, and the duty rate each pays on this product. Source: U.S. Census Bureau. {CENSUS_NOTICE}
      </p>
    </SummaryCard>
  );
};
