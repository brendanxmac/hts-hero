"use client";

import { ArrowTopRightOnSquareIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { Countries } from "@/constants/countries";
import { Dialog } from "@/components/ui/Dialog";
import { trackerSans } from "@/components/ui/font";
import { FEES_COLOR, THEME } from "@/components/ui/theme";
import { programColors } from "../../programColors";
import transitData from "@/libs/sourcing/transit.json";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { CENSUS_NOTICE } from "@/components/duty-calculator/lib/census";
import { ChartDialog, ExpandButton, LineChart } from "./ChartDialog";
import { caseEvents, type UsConfidence } from "./coverage";
import type { AdcvdCase } from "./useSourcing";
import * as tt from "@/components/ui/styles/tracker";
import governance from "@/libs/sourcing/governance.json";
import { UNIT_NAMES } from "@/libs/sourcing/trade";
import { ConfidenceBadge, FLAG_TONES, focus, FocusInfo, focusLevel, Growth, rate, ScoreRing, share, transitDays, transitOf, usd, usdThousands } from "./bits";
import { COAST_NAMES, SCORE_KEYS, SCORE_NAMES, SourcingRow } from "./model";

// "2024-03" → "Mar 2024"
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

// Everything on one country, for the dialog it opens in: its four scores across the top, then
// panels, each one thing with its own source: what the US imports of this code from here (month by
// month), what it exports of the code's 6-digit group to the world, what it costs to land, how it
// gets here, and the risks. No frame of its own.

// One block of the detail: a titled panel on the dialog's ground, its source at its foot
const Panel = ({ title, aside, source, children, className = "" }: { title: string; aside?: React.ReactNode; source?: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <section className={`flex min-w-0 flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 ${className}`}>
    <header className="flex flex-wrap items-center justify-between gap-2">
      <h4 className={`${tt.display} m-0 text-base font-semibold text-base-content`}>{title}</h4>
      {aside}
    </header>
    {children}
    {source && (
      <p className="m-0 mt-auto border-t border-base-300 pt-3 text-xs leading-relaxed text-base-content/60">
        <span className="font-semibold text-base-content/70">Source: </span>
        {source}
      </p>
    )}
  </section>
);

// A figure with its label over it and what it means under it
const Stat = ({ label, value, note, tone }: { label: React.ReactNode; value: React.ReactNode; note?: React.ReactNode; tone?: "warning" }) => (
  <div className="flex min-w-0 flex-col gap-0.5">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">{label}</span>
    <span className={`${tt.display} truncate text-lg font-semibold leading-tight tabular-nums ${tone === "warning" ? "text-warning" : "text-base-content"}`}>{value}</span>
    {note && <span className="text-xs leading-snug text-base-content/60">{note}</span>}
  </div>
);

const Meter = ({ label, value }: { label: string; value: number | undefined }) =>
  value === undefined ? null : (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm text-base-content/80">
        {label}
        <span className="font-semibold tabular-nums text-base-content">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-tt-soft">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );

// Places goods are commonly routed through on their way to the US, marked on a country's
// destinations (a flow there isn't a problem in itself)
const HUBS = new Set(["AE", "SG", "HK", "MY"]);
// Destinations listed in Where Its Exports Go
const DESTINATIONS = 8;

// Where a country's exports of the group go: each main destination's share of its exports in the
// latest year, the US always among them, and how each moved since the first year
const ExportsGo = ({ row, flows, group }: { row: SourcingRow; flows: { years: number[]; t: number[]; d: Record<string, number[]> }; group: string }) => {
  const last = flows.years.length - 1;
  const total = flows.t[last] ?? 0;
  const list = Object.entries(flows.d)
    .filter(([, v]) => (v[last] ?? 0) > 0)
    .sort((a, b) => b[1][last] - a[1][last]);
  const shown = list.slice(0, DESTINATIONS);
  const us = list.find(([c]) => c === "US");
  if (us && !shown.includes(us)) shown.push(us);
  const rest = Math.max(0, total - shown.reduce((sum, [, v]) => sum + v[last], 0));
  const max = Math.max(...shown.map(([, v]) => v[last]), rest, 1);
  const toUs = us?.[1][last] ?? 0;
  const lead = shown[0];
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label={`To all countries, ${flows.years[last]}`} value={usdThousands(total)} note={`${group}, every code in it`} />
        <Stat label="Of it to the US" value={toUs > 0 ? share(toUs / total) : "None"} note={toUs > 0 ? usdThousands(toUs) : "No US flow recorded"} />
        <Stat label="Main market" value={lead ? (Countries.find((c) => c.code === lead[0])?.name ?? lead[0]) : "—"} note={lead ? `${share(lead[1][last] / total)} of its exports` : undefined} />
      </div>
      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {shown.map(([code, v]) => {
          const country = Countries.find((c) => c.code === code);
          const first = v[0];
          return (
            <li key={code} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_4.5rem_4rem] items-center gap-3 text-sm">
              <span className={`flex min-w-0 items-center gap-1.5 ${code === "US" ? "font-semibold text-primary" : "text-base-content/80"}`}>
                <span aria-hidden>{country?.flag}</span>
                <span className="truncate">{country?.name ?? code}</span>
                {HUBS.has(code) && (
                  <span className="shrink-0 rounded-full bg-tt-soft px-1.5 text-[10px] text-base-content/60" title="A place goods are commonly routed through">
                    hub
                  </span>
                )}
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-tt-soft">
                <span className={`block h-full rounded-full ${code === "US" ? "bg-primary" : "bg-primary/50"}`} style={{ width: `${Math.max(1, (v[last] / max) * 100)}%` }} />
              </span>
              <span className="text-right tabular-nums text-base-content">{usdThousands(v[last])}</span>
              <span className="text-right text-xs tabular-nums">{first > 0 ? <Growth value={(v[last] - first) / first} /> : <span className="text-base-content/60">new</span>}</span>
            </li>
          );
        })}
        {rest > 0 && (
          <li className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_4.5rem_4rem] items-center gap-3 text-sm text-base-content/60">
            <span>Everywhere else</span>
            <span className="h-2 overflow-hidden rounded-full bg-tt-soft">
              <span className="block h-full rounded-full bg-base-content/25" style={{ width: `${(rest / max) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums">{usdThousands(rest)}</span>
            <span />
          </li>
        )}
      </ol>
      <p className="m-0 text-xs text-base-content/60">
        Change is {flows.years[0]} to {flows.years[last]}. {row.country.name}&apos;s exports to the US here cover the whole group {group}, so they can differ from the US figures for this exact
        code.
      </p>
    </>
  );
};

const FLAG_BORDERS = { error: "border-l-error", warning: "border-l-warning", info: "border-l-base-content/30" } as const;
const FREIGHT = "Freight & insurance";

export const CountryDetail = ({
  row,
  months,
  unit,
  capacityYears,
  districtYear,
  totalMonthly,
  cases = [],
  confidence,
  destinations,
}: {
  row: SourcingRow;
  // How far to lean on the US figures for this code
  confidence?: UsConfidence;
  // Where this country's exports of the group go (the Atlas's country-to-country data)
  destinations?: { years: number[]; t: number[]; d: Record<string, number[]> } | null;
  months: string[];
  unit: string | null;
  capacityYears: { year: number; prior: number } | null;
  districtYear: number | null;
  // Every country's US imports of it each month, for comparison
  totalMonthly?: number[];
  // The AD/CVD cases on this product, marked on its monthly chart when they're this country's
  cases?: AdcvdCase[];
}) => {
  const events = caseEvents(cases, months, row.country.code);
  const [open, setOpen] = useState(false);
  const unitName = unit ? (UNIT_NAMES[unit]?.[0] ?? unit.toLowerCase()) : null;
  const g = row.governance;
  const mix = row.us?.mix;
  const transit = transitOf(row);
  const period = months.length ? `${months[0]} to ${months[months.length - 1]}` : "";
  const lastPeriod = months.length >= 12 ? `${months[months.length - 12]} to ${months[months.length - 1]}` : period;
  const colors = { ...programColors([row]), [FREIGHT]: FEES_COLOR } as Record<string, string>;
  const costParts = [...row.parts.map((p) => ({ label: p.key, amount: p.pct, color: colors[p.key] })), ...(row.freightUsed > 0 ? [{ label: FREIGHT, amount: row.freightUsed, color: FEES_COLOR }] : [])];
  const hasMonths = Boolean(row.us && row.us.monthly.some((v) => v > 0));
  const monthlyTable = {
    columns: ["Month", row.country.name, "All countries", "Share"],
    rows: months
      .map((m, i) => [monthLabel(m), row.us?.monthly[i] ? usd(row.us.monthly[i]) : "—", totalMonthly ? usd(totalMonthly[i]) : "—", totalMonthly?.[i] && row.us ? share(row.us.monthly[i] / totalMonthly[i]) : "—"])
      .reverse(),
  };
  const series = [
    ...(row.us ? [{ name: row.country.name, color: "var(--color-primary)", values: row.us.monthly }] : []),
    ...(totalMonthly ? [{ name: "All countries", color: "color-mix(in oklab, var(--color-base-content) 35%, transparent)", values: totalMonthly }] : []),
  ];

  return (
    <div className="flex flex-col gap-4 bg-base-200 p-5">
      {/* The four scores, each out of 100 among the countries that make or ship it */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SCORE_KEYS.map((k) => (
          <div key={k} className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3">
            <ScoreRing score={Math.round(row.scores[k])} size={52} />
            <span className="flex min-w-0 flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">{SCORE_NAMES[k]}</span>
              <span className="truncate text-sm font-semibold text-base-content">
                {k === "capacity"
                  ? row.world
                    ? `${usdThousands(row.world.exports)} exports`
                    : row.us
                      ? `${usd(row.us.value)} to the US`
                      : "Not an exporter"
                  : k === "reliability"
                    ? g?.rl !== undefined
                      ? `Rule of law ${g.rl}`
                      : "No World Bank scores"
                    : k === "speed"
                      ? `${transitDays(row)} ${transit.mode.split(" (")[0].split(",")[0]}`
                      : `${rate(row.landedPct)} landed`}
              </span>
              <span className="text-xs text-base-content/60">Score out of 100</span>
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel
            title={`US Imports of This Code from ${row.country.name}`}
            aside={
              <span className="flex items-center gap-2">
                {confidence && confidence.level !== "good" && <ConfidenceBadge confidence={confidence} />}
                {row.thinUs && (!confidence || confidence.level === "good") && (
                  <span className={tt.chip("neutral")} title="Under $250K, or fewer than 3 months with shipments, in the last 12 months">
                    Thin US data
                  </span>
                )}
                {hasMonths && <ExpandButton onClick={() => setOpen(true)} label="Table & CSV" />}
              </span>
            }
            source={`U.S. Census Bureau, general imports, ${period}. ${CENSUS_NOTICE}`}
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Last 12 months" value={row.us ? usd(row.us.value) : "None"} note={lastPeriod} />
              <Stat
                label="Share of US imports"
                value={row.us ? share(row.us.share) : "—"}
                note={confidence && confidence.level !== "good" ? `Of only ${confidence.countries} countries on record` : "Of all countries, this code"}
              />
              <Stat label="On the year before" value={row.us ? <Growth value={row.us.growth} /> : "—"} note={row.us ? `Was ${usd(row.us.prior)}` : undefined} />
              <Stat
                label={unitName ? `Value per ${unitName}` : "Value per unit"}
                value={row.us?.unitValue ? `$${row.us.unitValue.toLocaleString("en-US", { maximumFractionDigits: row.us.unitValue < 10 ? 2 : 0 })}` : "—"}
                note="Average declared to Customs"
              />
            </div>
            {hasMonths ? (
              <LineChart label={`US imports of this code from ${row.country.name} by month`} labels={months.map(monthLabel)} markers={events.markers} format={usd} height={220} series={series} />
            ) : (
              <p className="m-0 rounded-xl bg-tt-soft px-4 py-6 text-center text-sm text-base-content/70">No US imports of this code from {row.country.name} in the last 36 months.</p>
            )}
            {events.earlier.length > 0 && <p className="m-0 text-xs text-error">AD/CVD orders on this product from here, before this chart: {events.earlier.join("; ")}.</p>}
            {(mix || (row.us && row.us.districts.length > 0)) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {mix && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">How it ships from here</span>
                    <span className="flex h-3 overflow-hidden rounded-full bg-tt-soft">
                      <span className="bg-primary" style={{ width: `${mix.vessel * 100}%` }} />
                      <span style={{ width: `${mix.air * 100}%`, background: "var(--series-2)" }} />
                      <span className="bg-base-content/25" style={{ width: `${mix.other * 100}%` }} />
                    </span>
                    <span className="flex flex-wrap gap-x-3 text-xs text-base-content/70">
                      <span>{Math.round(mix.vessel * 100)}% sea</span>
                      <span>{Math.round(mix.air * 100)}% air</span>
                      {mix.other >= 0.05 && <span>{Math.round(mix.other * 100)}% land and other</span>}
                    </span>
                  </div>
                )}
                {row.us && row.us.districts.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">Entered the US through, {districtYear}</span>
                    {row.us.districts.map(([name, s]) => (
                      <span key={name} className="flex items-center gap-2 text-sm">
                        <span className="min-w-0 flex-1 truncate text-base-content/80">{name}</span>
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-tt-soft">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${s * 100}%` }} />
                        </span>
                        <span className="w-10 text-right tabular-nums text-base-content/70">{share(s)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Panel>

          <Panel
            title={row.world ? `World Exports of ${row.world.group}` : "World Exports"}
            source={`Harvard Growth Lab, Atlas of Economic Complexity (HS 2022), ${capacityYears?.prior ?? ""}–${capacityYears?.year ?? ""}, CC0. Export Focus is revealed comparative advantage, worked out from it.`}
          >
            {row.world ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label={`To all countries, ${capacityYears?.year ?? ""}`} value={usdThousands(row.world.exports)} note={`#${row.world.rank} worldwide`} />
                  <Stat label="Share of world exports" value={share(row.world.share)} />
                  <Stat label={`Since ${capacityYears?.prior ?? ""}`} value={<Growth value={row.world.growth} />} note={`Was ${usdThousands(row.world.prior)}`} />
                  <Stat
                    label={
                      <span className="inline-flex items-center gap-1">
                        Export Focus
                        <FocusInfo />
                      </span>
                    }
                    value={focus(row.world.rca)}
                    note={focusLevel(row.world.rca)}
                  />
                </div>
                <p className="m-0 rounded-xl bg-tt-soft px-3 py-2 text-xs text-base-content/70">
                  These cover the whole 6-digit group {row.world.group}, not only this code, sold to every country, not only the US: world trade data comes no finer.
                </p>
              </>
            ) : (
              <p className="m-0 text-sm text-base-content/70">{row.country.name} isn&apos;t among the world&apos;s exporters of this code&apos;s 6-digit group.</p>
            )}
          </Panel>

          {destinations && destinations.t[destinations.t.length - 1] > 0 && (
            <Panel
              title="Where Its Exports Go"
              source={`Harvard Growth Lab, Atlas of Economic Complexity, country-to-country trade (HS 2022), ${destinations.years[0]}–${destinations.years[destinations.years.length - 1]}, CC0.`}
            >
              <ExportsGo row={row} flows={destinations} group={row.world?.group ?? "the 6-digit group"} />
            </Panel>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Panel
            title="Landed Cost"
            source="Duty: HTS Hero's tariff engine, today's rates, on a standard shipment. Freight and insurance: U.S. Census Bureau import charges for this code by sea and air, last 12 months."
          >
            <div className="flex items-end justify-between gap-3">
              <Stat label="Duty + freight, share of value" value={rate(row.landedPct)} tone={row.dutyIncomplete ? "warning" : undefined} />
              {row.dutyNote && <span className={tt.chip(row.dutyIncomplete ? "warning" : "success")}>{row.dutyNote}</span>}
            </div>
            {costParts.length > 0 ? (
              <StackedBar parts={costParts} formatValue={rate} showShare={false} shape="pill" />
            ) : (
              <p className="m-0 text-sm text-base-content/70">No duty and no recorded freight.</p>
            )}
            <dl className="m-0 grid grid-cols-2 gap-3">
              <Stat label="Duty" value={rate(row.dutyPct)} note={row.agreement ? `With ${row.agreement.name}: the goods must meet its rules of origin` : "Standard rates"} />
              <Stat
                label="Freight & insurance"
                value={row.byLand ? "By land" : rate(row.freightUsed)}
                note={row.byLand ? "Census records little for trucks and rail" : row.freightEstimated ? "Typical for this code: too little came by sea or air" : "This code from here, last 12 months"}
              />
            </dl>
          </Panel>

          <Panel
            title="Getting It Here"
            source={`Transit: by air where most of this code from here flies (Census); else by sea, our estimate from searoute distances at ${transitData.knots} knots before port time; Canada and Mexico by truck or rail. Logistics Performance Index: World Bank, ${governance.lpi.edition}, country-wide.`}
          >
            <Stat label="Transit to the US" value={transitDays(row)} note={transit.mode} />
            {!row.byLand && row.transit && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
                  By sea from {row.transit.port}
                  {row.transit.via ? ` (${row.transit.via})` : ""}
                </span>
                {(["west", "east", "gulf"] as const).map((c) => (
                  <span key={c} className="flex items-center justify-between text-sm">
                    <span className="text-base-content/80">{COAST_NAMES[c]}</span>
                    <span className={`tabular-nums ${row.transit!.coast === c ? "font-semibold text-primary" : "text-base-content"}`}>~{row.transit![c]} days</span>
                  </span>
                ))}
              </div>
            )}
            {g?.lpi !== undefined && <Stat label="Logistics Performance Index" value={`${g.lpi} of 5`} note="How well the country moves goods, country-wide" />}
          </Panel>

          <Panel
            title="Risk & Compliance"
            source={`Flags: OFAC, DHS (UFLPA), Commerce AD/CVD cases, US Census and the Atlas, each linked. Governance: World Bank Worldwide Governance Indicators ${governance.wgi.year}, country-wide, CC BY 4.0.`}
          >
            {row.flags.length ? (
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {row.flags.map((f) => (
                  <li key={f.id} className={`flex flex-col gap-1.5 rounded-xl border border-l-4 border-base-300 ${FLAG_BORDERS[f.tone]} bg-base-100 px-3.5 py-3`}>
                    <span className={`${tt.chip(FLAG_TONES[f.tone])} self-start`}>{f.label}</span>
                    <span className="text-sm leading-relaxed text-base-content/80">{f.detail}</span>
                    <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline">
                      {f.source}
                      <ArrowTopRightOnSquareIcon className="h-3 w-3" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 flex items-center gap-2 rounded-xl bg-success/10 px-3.5 py-3 text-sm text-base-content/80">
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden />
                No sanctions, AD/CVD cases, UFLPA sector or supply mismatch flags found for this code from here.
              </p>
            )}
            {g?.rl !== undefined && (
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">Country governance, 0–100 (country-wide, not per product)</span>
                <Meter label="Rule of law" value={g.rl} />
                <Meter label="Control of corruption" value={g.cc} />
                <Meter label="Political stability" value={g.pv} />
              </div>
            )}
          </Panel>
        </div>
      </div>

      {hasMonths && (
        <ChartDialog
          open={open}
          onClose={() => setOpen(false)}
          title={`US Imports of This Code from ${row.country.name}, by Month`}
          subtitle={`Against every country together, over the last 36 months.${events.earlier.length ? ` AD/CVD orders on this product from here since before this chart: ${events.earlier.join("; ")}.` : ""}`}
          source={`U.S. Census Bureau, general imports, ${period}. ${CENSUS_NOTICE}`}
          chart={<LineChart label={`US imports of this code from ${row.country.name} by month`} labels={months.map(monthLabel)} markers={events.markers} format={usd} series={series} />}
          table={monthlyTable}
        />
      )}
    </div>
  );
};

// A country's full detail over the page, for one picked anywhere on it (Top Sources, the chart, the
// landed costs, the table), so picking never moves the page
export const CountryDialog = ({ row, onClose, children }: { row: SourcingRow | null; onClose: () => void; children: React.ReactNode }) => (
  <Dialog open={Boolean(row)} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-black/40" aria-hidden />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      {/* It portals out of the Tracker, so it carries the Tracker's look itself (DESIGN_SYSTEM §15) */}
      <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden shadow-2xl`}>
        {row && (
          <>
            <div className="flex items-center justify-between gap-4 border-b border-base-300 px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-4xl leading-none" aria-hidden>
                  {row.country.flag}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <Dialog.Title className={`${tt.display} m-0 truncate text-xl font-semibold text-base-content`}>{row.country.name}</Dialog.Title>
                  <span className="flex flex-wrap gap-1.5">
                    <span className={tt.chip(row.blocked ? "error" : row.candidate ? "primary" : "neutral")}>
                      {row.blocked ? "Not a realistic source today" : row.candidate ? "Makes it or ships it to the US" : "Exports little or none of it"}
                    </span>
                    {row.agreement && <span className={tt.chip("success")}>{row.agreement.name} may apply</span>}
                    {row.flags.length > 0 && <span className={tt.chip("warning")}>{row.flags.length} flag{row.flags.length === 1 ? "" : "s"}</span>}
                  </span>
                </div>
              </div>
              <button type="button" className="rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content" onClick={onClose}>
                <XMarkIcon className="h-5 w-5" aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </>
        )}
      </Dialog.Panel>
    </div>
  </Dialog>
);
