"use client";

import { useState } from "react";
import type { UsConfidence } from "./coverage";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Sparkline } from "@/components/ui/charts/kit";
import { Module } from "@/components/ui/Module";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import governance from "@/libs/sourcing/governance.json";
import transit from "@/libs/sourcing/transit.json";
import * as tt from "@/components/ui/styles/tracker";
import { ConfidenceBadge, FLAG_TONES, focus, Growth, MetricTiles, rate, ScoreRing, share, transitDays, transitOf, usd, usdThousands } from "./bits";
import { AIR_DAYS, LAND_DAYS, reasonsFor, SCORE_KEYS, SCORE_NAMES, Scores, SourcingRow } from "./model";

// The countries worth a closer look first, ranked one metric at a time (Capacity, Reliability,
// Speed or Cost; there's no overall score), each saying where its figures come from. One column
// each, with its score, the figure behind it, why it stands out, and any flags. Picking one opens
// its profile.

export type ShortlistView = keyof Scores;

const VIEWS: { id: ShortlistView; label: string }[] = SCORE_KEYS.map((k) => ({ id: k, label: SCORE_NAMES[k] }));

const LAND_DAYS_TEXT = `${LAND_DAYS} days`;

// Where each view's figures come from
const SOURCES: Record<ShortlistView, string> = {
  capacity: "Each country's exports to all countries of this code's whole 6-digit group (the finest level world trade data comes at) and its Export Focus: Harvard Growth Lab, Atlas of Economic Complexity (2024). US imports of this product: U.S. Census Bureau, last 12 months.",
  reliability: `The country's governance, which is country-wide, not per product: World Bank Worldwide Governance Indicators (${governance.wgi.year}), rule of law, control of corruption and political stability. Less flags on this product from there: OFAC sanctions, DHS (UFLPA) and Commerce AD/CVD cases.`,
  speed: `Transit time to the US: by sea, our estimate from searoute distances between each country's main port and the nearest US coast at ${transit.knots} knots, before port time; Canada and Mexico about ${LAND_DAYS_TEXT} by truck or rail; about ${AIR_DAYS} days by air where most of this product from a country flies (U.S. Census mode of transport).`,
  cost: "Duty on this product: HTS Hero's tariff engine, today's rates, best trade agreement where on. Freight and insurance on this product: U.S. Census Bureau import charges, last 12 months.",
};

// Ties in one part go to the bigger exporter, the better governed, the nearer, the cheaper
const TIEBREAK: Record<keyof Scores, (r: SourcingRow) => number> = {
  capacity: (r) => r.world?.exports ?? r.us?.value ?? 0,
  reliability: (r) => r.governance?.rl ?? 0,
  speed: (r) => -(transitOf(r).days ?? 99),
  cost: (r) => -r.landedPct,
};

const ranked = (rows: SourcingRow[], view: ShortlistView) => {
  const options = rows.filter((r) => r.candidate);
  return [...options].sort((a, b) => Math.round(b.scores[view]) - Math.round(a.scores[view]) || TIEBREAK[view](b) - TIEBREAK[view](a));
};

// The figure behind the view's ranking, with its fuller story, for the card's feature tile
const featureOf = (row: SourcingRow, view: ShortlistView): { label: string; value: string; note: string } => {
  if (view === "capacity") {
    return row.world
      ? {
          label: `Its exports of ${row.world.group}, all countries, 2024`,
          value: usdThousands(row.world.exports),
          note: `#${row.world.rank} worldwide · Export Focus ${focus(row.world.rca)} · ${row.us && row.us.value > 0 ? `${usd(row.us.value)} of this code to the US in 12 months` : "none of this code to the US in 12 months"}`,
        }
      : { label: "US imports of this code from here, 12 months", value: row.us ? usd(row.us.value) : "—", note: "Not among the world's exporters of its 6-digit group" };
  }
  if (view === "reliability") {
    const g = row.governance;
    return {
      label: "Reliability, out of 100",
      value: String(Math.round(row.scores.reliability)),
      note: `${g?.rl !== undefined ? `Country: rule of law ${g.rl} · corruption control ${g.cc} · stability ${g.pv}` : "No World Bank scores"} · ${row.flags.length ? `${row.flags.length} flag${row.flags.length === 1 ? "" : "s"} on this product` : "no flags on this product"}`,
    };
  }
  if (view === "speed") return { label: "Transit to the US", value: transitDays(row), note: transitOf(row).mode };
  return {
    label: "Landed cost of this code",
    value: rate(row.landedPct),
    note: `${rate(row.dutyPct)} duty${row.agreement ? " with a trade agreement" : ""} + ${row.byLand ? "land freight" : `${rate(row.freightUsed)} freight${row.freightEstimated ? " (typical)" : ""}`}`,
  };
};

const SHOWN = 4;

// How this code travels from here: a thin bar by sea, air and the rest (the time is in Speed)
const Shipping = ({ row }: { row: SourcingRow }) => {
  const mix = row.us?.mix;
  if (!mix) return <span className="text-xs text-base-content/60">No US shipments of this code from here to show how it travels</span>;
  return (
    <span className="flex flex-col gap-1">
      <span className="flex h-1.5 overflow-hidden rounded-full bg-tt-soft">
        <span className="bg-primary" style={{ width: `${mix.vessel * 100}%` }} />
        <span style={{ width: `${mix.air * 100}%`, background: "var(--series-2)" }} />
        <span className="bg-base-content/25" style={{ width: `${mix.other * 100}%` }} />
      </span>
      <span className="text-[11px] text-base-content/60">
        Ships {Math.round(mix.vessel * 100)}% by sea · {Math.round(mix.air * 100)}% by air
        {mix.other >= 0.05 ? ` · ${Math.round(mix.other * 100)}% land/other` : ""}
      </span>
    </span>
  );
};

// US imports of this code from here, month by month; its share said against how few countries are
// on record when that's few
const Trend = ({ row, confidence }: { row: SourcingRow; confidence: UsConfidence }) =>
  row.us && row.us.monthly.some((v) => v > 0) ? (
    <span className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-base-content/60">US imports of this code, 12 mo</span>
        <span className="font-semibold tabular-nums text-base-content">{usd(row.us.value)}</span>
      </span>
      <Sparkline points={row.us.monthly.map((y, x) => ({ x, y }))} color="var(--color-primary)" height={24} label={`US imports from ${row.country.name} by month`} />
      <span className="text-[11px] text-base-content/60">
        {confidence.level === "good" ? `${share(row.us.share)} of all US imports of it` : `${share(row.us.share)} of only ${confidence.countries} on record`} · <Growth value={row.us.growth} /> on the year
      </span>
    </span>
  ) : (
    <span className="text-xs text-base-content/60">No US imports of this code from here in 36 months</span>
  );

export const Shortlist = ({
  rows,
  onSelect,
  confidence,
}: {
  rows: SourcingRow[];
  // How far to lean on the US figures for this code
  confidence: UsConfidence;
  // Opens a country's full detail (in a dialog over the page)
  onSelect: (code: string) => void;
}) => {
  const [view, setView] = useState<ShortlistView>("capacity");
  const shown = ranked(rows, view).slice(0, SHOWN);
  return (
    <Module
      title="Top Sources"
      // One control beside the title, on one row (it scrolls on a phone rather than wrapping)
      actions={
        <div className="max-w-full overflow-x-auto">
          <SegmentedControl<ShortlistView>
            label="Rank by"
            options={VIEWS}
            value={view}
            onChange={setView}
          />
        </div>
      }
      padded={false}
    >
      <div className="-mt-2 flex flex-col gap-1 px-5 pb-4 sm:px-6">
        <p className={`${tt.subtitle} m-0`}>Ranked by {SCORE_NAMES[view].toLowerCase()} for this product, scored out of 100 among the countries that make or ship it.</p>
        <p className="m-0 text-xs text-base-content/60">
          <span className="font-semibold text-base-content/70">Source: </span>
          {SOURCES[view]}
        </p>
        {(view === "capacity" || view === "cost") && confidence.level !== "good" && (
          <p className="m-0 mt-1 flex flex-wrap items-center gap-2 text-xs text-base-content/70">
            <ConfidenceBadge confidence={confidence} />
            {view === "capacity"
              ? "With so little US data, these rankings lean on world exports of the 6-digit group."
              : "Freight shares here come from very few shipments; where a country has too few, it's the typical share."}
          </p>
        )}
      </div>
      <div className="border-t border-base-300">
        {shown.length ? (
          <ol className="m-0 grid list-none grid-cols-1 p-0 sm:grid-cols-2 xl:grid-cols-4 [&>li]:border-base-300 max-sm:[&>li:not(:first-child)]:border-t sm:max-xl:[&>li:nth-child(n+3)]:border-t sm:[&>li:nth-child(even)]:border-l xl:[&>li:not(:first-child)]:border-l">
            {shown.map((row, i) => (
              <li key={row.country.code} className="min-w-0">
                <button type="button" onClick={() => onSelect(row.country.code)} className="flex h-full w-full flex-col gap-3 px-4 py-4 text-left transition-colors hover:bg-tt-soft/60 sm:px-5">
                  <span className="flex items-start justify-between gap-2">
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className={tt.eyebrow(i === 0 ? "primary" : "neutral")}>
                        #{i + 1}
                        {i === 0 ? ` · Top for ${SCORE_NAMES[view].toLowerCase()}` : ""}
                      </span>
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="text-2xl leading-none" aria-hidden>
                          {row.country.flag}
                        </span>
                        <span className={`${tt.display} truncate text-base font-semibold text-base-content`}>{row.country.name}</span>
                      </span>
                    </span>
                    <ScoreRing score={Math.round(row.scores[view])} size={44} />
                  </span>
                  <MetricTiles row={row} highlight={view} feature={featureOf(row, view)} />
                  <Trend row={row} confidence={confidence} />
                  <Shipping row={row} />
                  {(reasonsFor(row).length > 0 || row.thinUs || row.flags.length > 0) && (
                    <span className="flex flex-wrap gap-1 [&>span]:block [&>span]:max-w-full [&>span]:truncate [&>span]:text-[11px]">
                      {reasonsFor(row)
                        .slice(0, 3)
                        .map((r) => (
                          <span key={r.label} className={tt.chip(r.tone)} title={r.label}>
                            {r.label}
                          </span>
                        ))}
                      {row.thinUs && (
                        <span className={tt.chip("neutral")} title="Its US figures rest on very little (under $250K, or fewer than 3 months with shipments, in the last 12), so its US share, freight and unit value say less.">
                          Thin US data
                        </span>
                      )}
                      {row.flags.map((f) => (
                        <span key={f.id} className={tt.chip(FLAG_TONES[f.tone])} title={f.detail}>
                          {f.label}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Full details
                    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className={`${tt.body} px-5 py-5 sm:px-6`}>No other country both makes this and ships it to the US yet.</p>
        )}
      </div>
    </Module>
  );
};
