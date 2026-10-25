"use client";

import { useEffect, useState } from "react";
import { Countries } from "@/constants/countries";
import { Module } from "@/components/ui/Module";
import * as tt from "@/components/ui/styles/tracker";
import type { CrossSources as CrossSourcesData, TradeData } from "@/libs/sourcing/trade";
import { SOURCE_URLS, Sources, usd, usdThousands } from "./bits";
import { CapacityEntry } from "./model";

// What other sources say about who supplies this product, beside the US Census figures for the
// exact code: US imports of the code's 6-digit group in the same years from Census and from the
// Atlas (which reconciles importer and exporter reports), and EU imports. When the code's own US
// figures are thin, this shows whether a missing country really doesn't supply it, or ships it
// under another code, or sells it elsewhere.

const ROWS = 10;

export const useCrossSources = (code: string | null) => {
  const [state, setState] = useState<{ code: string; data: CrossSourcesData | null } | null>(null);
  useEffect(() => {
    if (!code) return;
    let live = true;
    fetch(`/api/sourcing/partners?code=${code}`)
      .then((r): Promise<CrossSourcesData> | null => (r.ok ? r.json() : null))
      .catch((): null => null)
      .then((data) => live && setState({ code, data }));
    return () => {
      live = false;
    };
  }, [code]);
  return state && state.code === code ? state.data : null;
};

const eur = (v: number) => usd(v).replace("$", "€");
const latest = (years: number[] | undefined) => (years?.length ? years[years.length - 1] : null);

// What a row shows, in a few words
const reading = (thisCode: number, census: number, atlas: number, eu: number, year: number | null) => {
  if (thisCode <= 0 && (census >= 100_000 || atlas >= 100_000)) return { text: `Shipped the group to the US in ${year}, but none of this code in the last 12 months`, tone: "warning" as const };
  if (thisCode > 0 && census < 1_000 && atlas < 1_000) return { text: `None to the US in ${year}, new since`, tone: "warning" as const };
  if (census >= 1_000_000 && atlas >= 1_000_000 && (census > atlas * 2 || atlas > census * 2)) return { text: "US and reconciled figures differ", tone: "neutral" as const };
  if (census < 1_000 && atlas < 1_000 && eu > 0) return { text: "Supplies the EU, not the US", tone: "neutral" as const };
  if (thisCode <= 0 && census < 1_000 && atlas < 1_000) return { text: "Exports it elsewhere: not to the US or EU", tone: "neutral" as const };
  return { text: "Sources agree", tone: "success" as const };
};

export const CrossSources = ({ data, trade, world }: { data: CrossSourcesData; trade: TradeData | null; world: CapacityEntry | null }) => {
  const atlasYear = latest(data.atlas?.years);
  const euYear = latest(data.eu?.years);
  const at = (src: CrossSourcesData["atlas"], iso: string, year: number | null) => (year && src?.byCountry[iso]?.[year]) || 0;
  // The countries worth comparing: the largest in any source, and the biggest world exporters
  const score = new Map<string, number>();
  const bump = (iso: string, v: number) => score.set(iso, Math.max(score.get(iso) ?? 0, v));
  Object.entries(trade?.countries ?? {}).forEach(([iso, c]) => bump(iso, c.last.value));
  Object.keys(data.census?.byCountry ?? {}).forEach((iso) => bump(iso, at(data.census, iso, atlasYear)));
  Object.keys(data.atlas?.byCountry ?? {}).forEach((iso) => bump(iso, at(data.atlas, iso, atlasYear)));
  Object.keys(data.eu?.byCountry ?? {}).forEach((iso) => bump(iso, at(data.eu, iso, euYear)));
  (world?.c ?? []).slice(0, 5).forEach(([iso, exports]) => bump(iso, exports * 1000));
  const countries = Array.from(score.entries())
    // Sourcing into the US: the US itself isn't a source
    .filter(([iso, v]) => v > 0 && iso !== "US")
    .sort((a, b) => b[1] - a[1])
    .slice(0, ROWS)
    .map(([iso]) => iso);
  if (!countries.length) return null;

  const months = trade?.months ?? [];
  const lastPeriod = months.length >= 12 ? `${months[months.length - 12]} to ${months[months.length - 1]}` : "last 12 months";
  return (
    <Module
      title="What Other Sources Say"
      subtitle={`Who supplies ${data.group} by other sources, beside the US figures for this exact code. A country missing from the code's US figures may still ship the group, ship it under another code, or sell it elsewhere.`}
      padded={false}
    >
      <div className="mt-4 overflow-x-auto border-t border-base-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-base-300 text-xs uppercase tracking-wide text-base-content/70">
              <th scope="col" className="px-5 py-2 text-left font-semibold sm:px-6">
                Country
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                US, this code
                <span className="block text-[10px] font-normal normal-case tracking-normal text-base-content/50">Census, last 12 mo</span>
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                US, {data.group}
                <span className="block text-[10px] font-normal normal-case tracking-normal text-base-content/50">Census, {atlasYear}</span>
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                US, {data.group}
                <span className="block text-[10px] font-normal normal-case tracking-normal text-base-content/50">Atlas, reconciled, {atlasYear}</span>
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                EU, {data.group}
                <span className="block text-[10px] font-normal normal-case tracking-normal text-base-content/50">Eurostat, {euYear}</span>
              </th>
              <th scope="col" className="px-5 py-2 text-left font-semibold sm:px-6">
                What it shows
              </th>
            </tr>
          </thead>
          <tbody>
            {countries.map((iso) => {
              const country = Countries.find((c) => c.code === iso);
              const thisCode = trade?.countries[iso]?.last.value ?? 0;
              const census = at(data.census, iso, atlasYear);
              const atlas = at(data.atlas, iso, atlasYear);
              const eu = at(data.eu, iso, euYear);
              const r = reading(thisCode, census, atlas, eu, atlasYear);
              const exporter = world?.c.find(([c]) => c === iso);
              return (
                <tr key={iso} className="border-b border-base-300 last:border-0">
                  <th scope="row" className="px-5 py-2.5 text-left font-semibold text-base-content sm:px-6">
                    {country?.flag} {country?.name ?? iso}
                    {exporter && <span className="block text-xs font-normal text-base-content/60">{usdThousands(exporter[1])} exports to all countries</span>}
                  </th>
                  <td className={`px-3 py-2.5 text-right tabular-nums ${thisCode > 0 ? "font-semibold text-base-content" : "text-base-content/40"}`}>{thisCode > 0 ? usd(thisCode) : "None"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-base-content/80">{census > 0 ? usd(census) : "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-base-content/80">{atlas > 0 ? usd(atlas) : "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-base-content/80">{eu > 0 ? eur(eu) : "—"}</td>
                  <td className="px-5 py-2.5 sm:px-6">
                    <span className={tt.chip(r.tone)}>{r.text}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`${tt.caption} m-0 px-5 py-3 leading-relaxed sm:px-6`}>
        The group&apos;s figures cover every code in {data.group}, so a neighboring product counts too. The Atlas reconciles what importers and exporters each report, so it can differ
        from Census; EU figures are in euros.
        <Sources
          items={[
            { label: `US Census, ${lastPeriod} and ${atlasYear}`, url: SOURCE_URLS.census },
            { label: `Atlas of Economic Complexity, ${atlasYear}`, url: SOURCE_URLS.atlas },
            { label: `Eurostat Comext, ${euYear}`, url: "https://ec.europa.eu/eurostat/comext/newxtweb/" },
          ]}
        />
      </p>
    </Module>
  );
};
