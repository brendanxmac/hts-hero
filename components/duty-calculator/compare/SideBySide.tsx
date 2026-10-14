"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { PlusIcon, TrophyIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import * as ui from "@/components/ui/styles";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { ArrowLink } from "../calculator/ArrowLink";
import { CountryField } from "../fields";
import { formatMoney } from "../lib/format";
import { formatImportValue } from "../lib/usImports";
import { shortDate } from "../rate-history/format";
import { rateParts, TrackedProduct } from "@/components/tariff-tracker/report";
import { CompareOption, optionLabel, optionResult, shortAgreement } from "./options";
import { Origins } from "./useOrigins";

// Side by Side: the shortlist alone, in depth. One column per country, in its color, at the trade
// program claimed for it (none, until one is claimed here or in the calculator), and a row for
// everything worth comparing: what it costs (the duty, against the cheapest landed
// cost, the landed cost), what the duty is made of (every tariff and fee), the trade program,
// and supply (how much the US imports from there, Census). How rates have moved over time, and
// every other country, are the Tracker's Sourcing tab.

const money = (n: number) => formatMoney(Math.round(n * 100) / 100);

const AddCountry = ({ countries, onAdd }: { countries: Country[]; onAdd: (country: Country) => void }) => {
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (searching) document.getElementById("dc-side-add")?.focus();
  }, [searching]);
  return searching ? (
    <div className="flex w-48 flex-col gap-2 text-left">
      <label htmlFor="dc-side-add" className={ui.fieldLabel}>
        Compare with
      </label>
      <CountryField
        id="dc-side-add"
        selected={[]}
        max={1}
        onChange={(picked) => {
          const added = picked[0];
          if (added && !countries.some((c) => c.code === added.code)) onAdd(added);
          setSearching(false);
        }}
      />
      <button type="button" className="self-start text-xs font-medium text-base-content/60 hover:text-base-content" onClick={() => setSearching(false)}>
        Cancel
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setSearching(true)}
      className="flex w-40 flex-col items-center gap-1 rounded-lg border border-dashed border-base-content/20 px-3 py-4 text-sm font-medium text-base-content/70 transition-colors hover:border-primary/40 hover:text-primary"
    >
      <PlusIcon className="h-5 w-5" aria-hidden />
      Add a country
    </button>
  );
};

// A group of rows, under its own heading across the table
const Group = ({ title, span }: { title: string; span: number }) => (
  <Tr>
    <Td colSpan={span} className="!pb-1.5 !pt-5">
      <span className={ui.label}>{title}</span>
    </Td>
  </Tr>
);

export const SideBySide = ({
  product,
  origins,
  options,
  claimed,
  onClaim,
  asOf,
  countries,
  colors,
  max,
  onAdd,
  onRemove,
  onViewDetails,
}: {
  product: TrackedProduct;
  origins: Origins;
  // Each shortlisted country at its standard rate, in shortlist order
  options: CompareOption[];
  // The trade program claimed for each country (its symbol), and the way to claim or drop one
  claimed: Record<string, string>;
  onClaim: (code: string, symbol: string) => void;
  // The control bar's date, when it isn't today
  asOf?: string;
  countries: Country[];
  colors: Record<string, string>;
  max: number;
  onAdd: (country: Country) => void;
  onRemove: (code: string) => void;
  onViewDetails: (country: Country, preference?: string) => void;
}) => {
  const value = product.customsValue > 0 ? product.customsValue : 1;
  // Each country at its claimed program: the option, worked out in full on the date
  const results = useMemo(
    () =>
      options.map((standard) => {
        const symbol = claimed[standard.origin.country.code];
        const name = symbol ? standard.origin.result.availablePreferences.find((p) => p.symbol === symbol)?.name ?? symbol : undefined;
        const asClaimed: CompareOption = symbol ? { ...standard, agreement: { symbol, name: name! } } : standard;
        const result = optionResult(product, asClaimed, asOf);
        const option: CompareOption = { ...asClaimed, pct: (result.totalDuty / value) * 100, parts: rateParts(result, value) };
        return { option, standard, result };
      }),
    [options, claimed, product, asOf, value]
  );
  const landed = (r: (typeof results)[number]) => product.customsValue + r.result.totalDuty + r.result.totalFees;
  const lowest = Math.min(...results.map(landed));
  const lowestCount = results.filter((r) => Math.abs(landed(r) - lowest) < 0.005).length;
  const { imports, colors: partColors } = origins;
  const ranked = imports
    ? Array.from(imports.byCountry.entries())
        .filter(([, v]) => v.value > 0)
        .sort((a, b) => b[1].value - a[1].value)
        .map(([code]) => code)
    : [];

  // Every tariff line that applies to any option, in the order they first appear
  const lineKeys = Array.from(
    new Map(
      results.flatMap((r) => r.result.lines.filter((l) => l.status === "applies" && l.amount > 0).map((l) => [l.code, l.name] as const))
    ).entries()
  );
  const canAdd = countries.length < max;
  const span = results.length + (canAdd ? 2 : 1);
  // The add column's empty cell on every row, while there's room on the shortlist
  const addCell = canAdd ? <Td /> : null;
  const cell = (render: (r: (typeof results)[number]) => ReactNode) =>
    results.map((r) => (
      <Td key={r.option.key} align="right">
        {render(r)}
      </Td>
    ));

  // The answer, in a line, before the detail: the cheapest option on the shortlist against yours
  const yours = results.find((r) => r.option.origin.isOrigin && !r.option.agreement);
  const cheapest = results.reduce<(typeof results)[number] | undefined>((a, b) => (!a || landed(b) < landed(a) - 0.005 ? b : a), undefined);
  const saved = yours && cheapest ? landed(yours) - landed(cheapest) : 0;
  // An agreement not claimed yet that would beat the cheapest: worth a nudge
  const unclaimed = results
    .filter((r) => r.standard.origin.agreement && claimed[r.option.origin.country.code] !== r.standard.origin.agreement.symbol)
    .map((r) => ({ r, duty: (r.standard.origin.agreement!.pct / 100) * value }))
    .filter((u) => cheapest && u.duty < cheapest.result.totalDuty - 0.005)
    .sort((a, b) => a.duty - b.duty)[0];

  return (
    <div className="flex flex-col gap-4">
      {cheapest && yours && (
        <p className="m-0 px-5 pb-1 pt-4 text-base leading-relaxed text-base-content/80 sm:px-6">
          {results.length === 1 ? (
            <>Add a country to compare {yours.option.origin.country.name} with.</>
          ) : saved < 0.005 ? (
            <>
              <span className="font-semibold text-base-content">{yours.option.origin.country.name}</span> already costs the least on your shortlist
              {asOf ? ` on ${shortDate(asOf, true)}` : ""}.
            </>
          ) : (
            <>
              On your shortlist{asOf ? ` on ${shortDate(asOf, true)}` : ""},{" "}
              {lowestCount > 1 ? (
                <>
                  <span className="font-semibold text-base-content">
                    {results
                      .filter((r) => Math.abs(landed(r) - lowest) < 0.005)
                      .map((r) => optionLabel(r.option))
                      .join(", ")
                      .replace(/, ([^,]*)$/, " and $1")}
                  </span>{" "}
                  tie for the least:
                </>
              ) : (
                <>
                  <span className="font-semibold text-base-content">{optionLabel(cheapest.option)}</span> costs the least:
                </>
              )} <span className="font-semibold text-base-content">{money(cheapest.result.totalDuty)}</span> in duty, up to{" "}
              <span className="font-semibold text-success">{money(saved)}</span> less per shipment than {yours.option.origin.country.name}
              {cheapest.option.agreement ? ", if the goods meet the agreement's rules of origin" : ""}.
            </>
          )}
          {unclaimed && (
            <>
              {" "}
              Claim <span className="font-semibold text-success">{shortAgreement(unclaimed.r.standard.origin.agreement!.name)}</span> for {unclaimed.r.option.origin.country.name} and its
              duty could drop to <span className="font-semibold text-base-content">{money(unclaimed.duty)}</span>.
            </>
          )}
        </p>
      )}
      <Table label="Your shortlist, side by side" valign="top" framed={false} className="[&_tbody>tr>*:first-child]:sticky [&_tbody>tr>*:first-child]:left-0 [&_tbody>tr>*:first-child]:z-[1] [&_tbody>tr>*:first-child]:bg-base-100">
        <THead>
          <Tr>
            <Th className="sticky left-0 z-[2] min-w-[15rem]">
              <span className="sr-only">Detail</span>
            </Th>
            {results.map(({ option: o }) => (
              <Th key={o.key} align="right" className="!normal-case !tracking-normal min-w-[11rem]">
                <span className="flex flex-col items-end gap-1">
                  {/* The country's color, dashed for its agreement option (as in the charts) */}
                  <span className="h-1 w-10 rounded-full" style={{ background: colors[o.origin.country.code] }} aria-hidden />
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-base-content">
                    <span aria-hidden>{o.origin.country.flag}</span>
                    {o.origin.country.name}
                    {o.origin.isOrigin && <span className="text-xs font-normal text-base-content/60">yours</span>}
                    {!o.origin.isOrigin && (
                      <button
                        type="button"
                        className="-mr-1 rounded p-0.5 text-base-content/50 hover:bg-base-300 hover:text-base-content"
                        aria-label={`Remove ${o.origin.country.name} from your shortlist`}
                        title="Remove from your shortlist"
                        onClick={() => onRemove(o.origin.country.code)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </span>
                  <span className="text-xs font-medium text-base-content/60">{o.agreement ? `With ${shortAgreement(o.agreement.name)}` : "Standard rate"}</span>
                </span>
              </Th>
            ))}
            {canAdd && (
              <Th align="center" className="!normal-case !tracking-normal">
                <AddCountry countries={countries} onAdd={onAdd} />
              </Th>
            )}
          </Tr>
        </THead>
        <TBody>
          <Group title={asOf ? `What it costs on ${shortDate(asOf, true)}` : "What it costs today"} span={span} />
          <Tr>
            <RowHeader>Total duty</RowHeader>
            {cell((r) => (
              <span className="flex flex-col items-end">
                <span className={ui.metric.secondary}>{money(r.result.totalDuty)}</span>
                <span className="text-xs text-base-content/60">{formatRate((r.result.totalDuty / value) * 100)} of the value</span>
              </span>
            ))}
            {addCell}
          </Tr>
          <Tr>
            <RowHeader>Against the cheapest</RowHeader>
            {cell((r) => {
              const diff = landed(r) - lowest;
              return Math.abs(diff) < 0.005 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                  <TrophyIcon className="h-3.5 w-3.5" aria-hidden />
                  {lowestCount > 1 ? "Tied lowest" : "Lowest"}
                </span>
              ) : (
                <span className="font-semibold text-error">+{money(diff)}</span>
              );
            })}
            {addCell}
          </Tr>
          <Tr>
            <RowHeader>Landed cost</RowHeader>
            {cell((r) => (
              <span className="font-semibold text-base-content">{money(landed(r))}</span>
            ))}
            {addCell}
          </Tr>

          <Group title="What the duty is made of" span={span} />
          <Tr>
            <RowHeader>Breakdown</RowHeader>
            {cell((r) => (
              <StackedBar
                parts={r.option.parts.map((p) => ({ label: p.key, amount: p.pct, color: partColors[p.key] }))}
                formatValue={formatRate}
                size="xs"
                shape="pill"
                legend={false}
              />
            ))}
            {addCell}
          </Tr>
          <Tr>
            <RowHeader>Base duty</RowHeader>
            {cell((r) => (
              <span>
                {money(r.result.base.amount)} <span className="text-xs text-base-content/60">{r.result.base.ratePct !== undefined ? formatRate(r.result.base.ratePct) : ""}</span>
              </span>
            ))}
            {addCell}
          </Tr>
          {lineKeys.map(([code, name]) => (
            <Tr key={code}>
              <RowHeader>
                <span className="block text-sm text-base-content">{name}</span>
                <span className="font-mono text-xs text-base-content/60">{code}</span>
              </RowHeader>
              {cell((r) => {
                const line = r.result.lines.find((l) => l.code === code && l.status === "applies" && l.amount > 0);
                return line ? (
                  <span>
                    {money(line.amount)} <span className="text-xs text-base-content/60">{line.ratePct !== undefined ? formatRate(line.ratePct) : ""}</span>
                  </span>
                ) : (
                  <span className="text-base-content/40">—</span>
                );
              })}
              {addCell}
            </Tr>
          ))}
          <Tr>
            <RowHeader>Customs fees</RowHeader>
            {cell((r) => (
              <span title={r.result.fees.map((f) => `${f.name}: ${money(f.amount)}`).join(", ")}>{money(r.result.totalFees)}</span>
            ))}
            {addCell}
          </Tr>

          <Group title="Trade program" span={span} />
          <Tr>
            <RowHeader>
              <span className="block text-sm text-base-content">Agreement to claim</span>
              <span className="text-xs text-base-content/60">The one that lowers it most</span>
            </RowHeader>
            {cell((r) => {
              const best = r.standard.origin.agreement;
              const symbol = claimed[r.option.origin.country.code];
              if (!best && !symbol)
                return (
                  <span className="text-base-content/60">
                    {r.standard.origin.result.availablePreferences.length ? "None lowers it" : "None available"}
                  </span>
                );
              const program = best ?? { symbol, name: r.option.agreement?.name ?? symbol };
              const on = symbol === program.symbol;
              const withIt = best ? (best.pct / 100) * value : r.result.totalDuty;
              const cut = r.standard.pct * (value / 100) - withIt;
              return (
                <span className="flex flex-col items-end gap-1.5">
                  <span className="font-semibold text-success">{shortAgreement(program.name)}</span>
                  {!on && cut > 0.005 && (
                    <span className="text-xs text-base-content/70">
                      {money(withIt)} duty, up to <span className="font-semibold text-success">{money(cut)} less</span>
                    </span>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-base-content">
                    <input
                      type="checkbox"
                      className={ui.checkbox}
                      checked={on}
                      onChange={(e) => onClaim(r.option.origin.country.code, e.target.checked ? program.symbol : "")}
                    />
                    {on ? "Claimed" : "Claim it"}
                  </label>
                  {on && <span className="text-xs text-base-content/60">If the goods meet its rules of origin</span>}
                </span>
              );
            })}
            {addCell}
          </Tr>

          <Group title={imports ? `Supply: US imports, ${imports.year}` : "Supply"} span={span} />
          <Tr>
            <RowHeader>From there</RowHeader>
            {cell((r) => {
              const row = imports?.byCountry.get(r.option.origin.country.code);
              return row && row.value > 0 ? (
                <span className="flex flex-col items-end">
                  <span className="font-semibold">{formatImportValue(row.value)}</span>
                  <span className="text-xs text-base-content/60">
                    #{ranked.indexOf(r.option.origin.country.code) + 1} supplier · {imports ? Math.round((row.value / imports.totalValue) * 1000) / 10 : 0}% of US imports
                  </span>
                </span>
              ) : (
                <span className="text-base-content/60">{imports ? "Not a supplier yet" : "No figures"}</span>
              );
            })}
            {addCell}
          </Tr>
          <Tr>
            <RowHeader>{imports ? `Since ${imports.prior}` : "Trend"}</RowHeader>
            {cell((r) => {
              const row = imports?.byCountry.get(r.option.origin.country.code);
              if (!row || row.prior <= 0) return <span className="text-base-content/40">{row && row.value > 0 ? "New" : "—"}</span>;
              const trend = (row.value - row.prior) / row.prior;
              return <span className={`font-semibold ${trend >= 0 ? "text-success" : "text-base-content/70"}`}>{`${trend >= 0 ? "+" : "−"}${Math.abs(Math.round(trend * 100))}%`}</span>;
            })}
            {addCell}
          </Tr>

          <Tr>
            <RowHeader>
              <span className="sr-only">More</span>
            </RowHeader>
            {cell((r) => (
              <ArrowLink onClick={() => onViewDetails(r.option.origin.country, r.option.agreement?.symbol)} className="ml-auto text-sm">
                Full breakdown
              </ArrowLink>
            ))}
            {addCell}
          </Tr>
        </TBody>
      </Table>

    </div>
  );
};
