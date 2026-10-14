import * as tt from "@/components/ui/styles/tracker";
import { formatRate } from "../../formatRate";
import { wholeDollars } from "../../insights/teasers";
import { rateParts, TrackedProduct } from "../../report";
import { Measure, MEASURES } from "../../opportunities/measure";
import { REVIEW_LABELS, ReviewState } from "../../opportunities/review";
import { Tally } from "../../opportunities/tallies";
import { SavingOption } from "../../opportunities/options";
import { RateBars } from "./RateBars";
import { ShipmentsPerYearField } from "./ShipmentsPerYearField";

// The top of a product's Savings: the rate today against the lowest it could be, in a sentence and
// as two bars on one scale (what each tariff adds, and what the best option drops), what's been
// secured and is in progress on it, and the switch between percentages and dollars

export const MeasureToggle = ({ value, onChange }: { value: Measure; onChange: (m: Measure) => void }) => (
  <div className={tt.toggleTrack} role="radiogroup" aria-label="Show amounts as">
    {MEASURES.map((m) => (
      <button key={m.id} type="button" role="radio" aria-checked={value === m.id} className={tt.toggleOption(value === m.id)} onClick={() => onChange(m.id)}>
        {m.label}
      </button>
    ))}
  </div>
);

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// "3 other origins and 1 exemption could also lower it."
const alsoLine = (options: SavingOption[], best?: SavingOption) => {
  const rest = options.filter((o) => o !== best);
  const counts = [
    [rest.filter((o) => o.kind === "program").length, "other trade program", "other trade programs"],
    [rest.filter((o) => o.kind === "origin").length, best?.kind === "origin" ? "other origin" : "country of origin", best?.kind === "origin" ? "other origins" : "countries of origin"],
    [rest.filter((o) => o.kind === "exemption").length, "exemption", "exemptions"],
  ] as const;
  const parts = counts.filter(([n]) => n > 0).map(([n, one, many]) => plural(n, one, many));
  if (!parts.length) return "";
  return `${parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0]} could also lower it.`;
};

export const SavingsSummary = ({
  product,
  best,
  options,
  shipmentsPerYear,
  tally,
  measure,
  onMeasure,
  review,
}: {
  // Where this import's savings review stands
  review: ReviewState;
  product: TrackedProduct;
  // The best counted option (programs and proven origins), if any
  best?: SavingOption;
  options: SavingOption[];
  shipmentsPerYear: number;
  tally: Tally;
  measure: Measure;
  onMeasure: (m: Measure) => void;
}) => {
  const pct = measure === "pct";
  const tracked = tally.pipeline.count + tally.secured.count;
  return (
    <section
      className={`${tt.panel} ${tt.panelPad} grid items-center gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]`}
      aria-label="Savings on this import"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className={tt.eyebrow("success")}>Savings review</span>
            <span className={tt.chip(REVIEW_LABELS[review].tone)}>{REVIEW_LABELS[review].label}</span>
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {!pct && <ShipmentsPerYearField productKey={product.key} />}
            <MeasureToggle value={measure} onChange={onMeasure} />
          </div>
        </div>
        <h2 className={`${tt.display} m-0 text-3xl font-semibold leading-tight text-base-content`}>
          {best ? (
            <>
              From {formatRate(product.totalPct)} to as low as <span className="text-success">{formatRate(best.ratePct)}</span>
            </>
          ) : (
            "No trade program or cheaper proven origin spotted"
          )}
        </h2>
        <p className={`${tt.subtitle} m-0`}>
          {best ? `${best.title}${best.agreement ? ` under ${best.agreement}` : ""} could ${pct ? `take ${formatRate(best.pts)} off the rate` : `save up to ${wholeDollars(best.usd)} a shipment, ${wholeDollars(best.usd * shipmentsPerYear)} a year`}, if you qualify. ` : ""}
          {alsoLine(options, best)}
        </p>
        {review === "reviewed" && (
          <p className="m-0 text-sm text-base-content/70">
            Quick wins explored. Sourcing it somewhere else stays open as a longer-term option, so there may still be more to save.
          </p>
        )}
        {tracked > 0 && (
          <p className="m-0 text-sm text-base-content/70">
            <span className="font-semibold text-base-content">In progress</span>{" "}
            {pct ? formatRate(tally.pipeline.pts) : `${wholeDollars(tally.pipeline.perYear)} a year`} ·{" "}
            <span className="font-semibold text-success">Secured</span>{" "}
            {pct ? formatRate(tally.secured.pts) : `${wholeDollars(tally.secured.perYear)} a year`}
          </p>
        )}
      </div>
      <RateBars
        bars={[
          { label: "Today", pct: product.totalPct, parts: product.parts },
          ...(best ? [{ label: `Best option · ${best.title}`, pct: best.ratePct, parts: rateParts(best.result, product.customsValue) }] : []),
        ]}
      />
    </section>
  );
};
