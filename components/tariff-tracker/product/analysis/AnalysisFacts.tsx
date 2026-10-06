import { formatMoney } from "@/components/duty-calculator/lib/format";
import * as ui from "@/components/ui/styles";
import { formatRate } from "../../formatRate";
import { AnalysisFacts as Facts, OriginRate } from "./analysis";

// The headline: where this product's origin stands among every other, and what the best one
// would save on its shipment

const flags = (origins: OriginRate[], max = 6) =>
  origins
    .slice(0, max)
    .map((o) => o.country.flag)
    .join(" ") + (origins.length > max ? ` +${origins.length - max}` : "");

const names = (origins: OriginRate[]) =>
  origins.length === 1
    ? origins[0].country.name
    : `${origins[0].country.name} and ${origins.length - 1} ${origins.length === 2 ? "other" : "others"}`;

const Tile = ({ label, value, note, accent }: { label: string; value: string; note: string; accent?: string }) => (
  <div className="bg-base-100 p-5">
    <div className={ui.label}>{label}</div>
    <div className={`${ui.metric.secondary} mt-2 ${accent ?? ""}`}>{value}</div>
    <div className="mt-2 truncate text-xs text-base-content/60" title={note}>
      {note}
    </div>
  </div>
);

export const AnalysisFacts = ({
  facts,
  customsValue,
  filtered = false,
}: {
  facts: Facts;
  customsValue: number;
  // Only some countries are shown, so counts are of those
  filtered?: boolean;
}) => {
  const { origin, originPct, rank, total, cheaper, lowest, highest, bestSaving } = facts;
  const among = filtered ? `the ${total} shown` : `all ${total} origins`;
  return (
    <div className={ui.card}>
      <dl className="grid grid-cols-2 gap-px bg-base-300 lg:grid-cols-4">
        <Tile
          label={`From ${origin?.country.name ?? "your origin"}`}
          value={formatRate(originPct)}
          note={
            cheaper.length
              ? `Rank ${rank} of ${total}${filtered ? " shown" : ""} · ${cheaper.length} ${cheaper.length === 1 ? "origin pays" : "origins pay"} less`
              : `The lowest rate of ${among}`
          }
          accent="text-primary"
        />
        <Tile label="Lowest rate" value={formatRate(lowest.pct)} note={`${flags(lowest.origins)} ${names(lowest.origins)}`} />
        <Tile label="Highest rate" value={formatRate(highest.pct)} note={`${flags(highest.origins)} ${names(highest.origins)}`} />
        <Tile
          label="Most you could save"
          value={bestSaving > 0.005 ? formatMoney((bestSaving / 100) * customsValue).replace(/\.00$/, "") : "—"}
          note={
            bestSaving > 0.005
              ? `${formatRate(bestSaving)} of a ${formatMoney(customsValue).replace(/\.00$/, "")} shipment, from the lowest-rate origin`
              : "No origin pays less than yours"
          }
          accent={bestSaving > 0.005 ? "text-success" : undefined}
        />
      </dl>
    </div>
  );
};
