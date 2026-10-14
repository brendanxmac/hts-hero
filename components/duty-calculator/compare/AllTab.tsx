"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import * as ui from "@/components/ui/styles";
import { rateKey, rateOf } from "@/components/tariff-tracker/product/analysis/analysis";
import { ProvenSuppliers } from "@/components/tariff-tracker/product/analysis/ProvenSuppliers";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { formatMoney } from "../lib/format";
import { basisFor, optionLabel, optionsFor, ProgramMode } from "./options";
import { OriginsList } from "./OriginsList";
import { Origins } from "./useOrigins";

// The map loads with this tab only
const WorldMap = dynamic(() => import("@/components/tariff-tracker/product/analysis/WorldMap").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <div className={`${ui.skeleton} h-[28rem] w-full`} />,
});

// All: the whole field, in four steps. The headline (how many countries beat yours, the lowest
// option, the most one could save, how many cheaper ones already ship it to the US), where in
// the world it's cheapest (the globe), every origin (as one chart or one table, with search and
// a filter), and the cheaper countries that already make it for the US. The shortlist is lit
// everywhere; selecting a country anywhere adds it (or takes it off). The control bar's date and
// trade programs choice apply to all of it.

const Stat = ({ label, value, note, tone }: { label: string; value: string; note: string; tone?: string }) => (
  <div className="bg-base-100 p-5">
    <div className={ui.label}>{label}</div>
    <div className={`${ui.metric.secondary} mt-2 ${tone ?? ""}`}>{value}</div>
    <div className="mt-2 truncate text-xs text-base-content/60" title={note}>
      {note}
    </div>
  </div>
);

export const AllTab = ({
  origins,
  mode,
  customsValue,
  shortlist,
  colors,
  lastAdded,
  onToggle,
}: {
  origins: Origins;
  mode: ProgramMode;
  customsValue: number;
  shortlist: ReadonlySet<string>;
  colors: Record<string, string>;
  lastAdded: string | null;
  onToggle: (code: string) => void;
}) => {
  const { rates, imports } = origins;
  const basis = basisFor(mode);
  const yours = rates.find((r) => r.isOrigin);
  // Yours on the same footing: with its own agreement when the choice is "with"
  const yourPct = yours ? rateOf(yours, basis) : 0;
  const options = useMemo(() => rates.flatMap((r) => optionsFor(r, mode)), [rates, mode]);
  const cheaper = options.filter((o) => !(o.origin.isOrigin && !o.agreement) && rateKey(o.pct) < rateKey(yourPct));
  const cheaperCountries = new Set(cheaper.map((o) => o.origin.country.code));
  const lowest = options.reduce((a, b) => (b.pct < a.pct ? b : a), options[0]);
  const proven = Array.from(cheaperCountries).filter((code) => (imports?.byCountry.get(code)?.value ?? 0) > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className={ui.card}>
        <dl className="grid grid-cols-2 gap-px bg-base-300 lg:grid-cols-4">
          <Stat
            label={`From ${yours?.country.name ?? "your origin"}`}
            value={formatRate(yourPct)}
            note={cheaperCountries.size ? `${cheaperCountries.size} of ${rates.length} countries can pay less` : `The lowest of all ${rates.length} countries`}
            tone="text-primary"
          />
          <Stat label="Lowest option" value={lowest ? formatRate(lowest.pct) : "—"} note={lowest ? optionLabel(lowest) : ""} />
          <Stat
            label="Most an option could save"
            value={lowest && lowest.pct < yourPct - 0.005 ? formatMoney(((yourPct - lowest.pct) / 100) * customsValue).replace(/\.00$/, "") : "—"}
            note={lowest && lowest.pct < yourPct - 0.005 ? `Up to, per shipment, ${optionLabel(lowest)}` : "No option pays less than yours"}
            tone={lowest && lowest.pct < yourPct - 0.005 ? "text-success" : undefined}
          />
          <Stat
            label="Cheaper and proven"
            value={imports ? proven.length.toLocaleString("en-US") : "—"}
            note={imports ? `Cheaper countries the US imported this from in ${imports.year}` : "No US import figures for this code"}
          />
        </dl>
      </div>

      {/* The control bar sets the globe's date, so it has no timeline of its own here */}
      <WorldMap rates={rates} shown={rates} basis={basis} selected={lastAdded} onSelect={onToggle} />

      <OriginsList origins={origins} mode={mode} shortlist={shortlist} colors={colors} onToggle={onToggle} />

      <ProvenSuppliers rates={rates} basis={mode === "without" ? "standard" : "agreements"} imports={imports} selected={shortlist} onSelect={onToggle} />
    </div>
  );
};
