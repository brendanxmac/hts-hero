"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { PlusIcon, TrophyIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import { Sparkline, time } from "@/components/ui/charts/kit";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import * as ui from "@/components/ui/styles";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { volatility } from "@/components/tariff-tracker/product/analysis/history";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { TrackedProduct } from "@/components/tariff-tracker/report";
import { ArrowLink } from "../calculator/ArrowLink";
import { CountryField } from "../fields";
import { formatMoney, todayIso } from "../lib/format";
import { formatImportValue } from "../lib/usImports";
import { shortDate } from "../rate-history/format";
import { CompareOption, optionLabel, optionResult, segmentsFor, shortAgreement } from "./options";
import { ShortlistCanvas } from "./ShortlistCanvas";
import { Origins } from "./useOrigins";

// Side by Side: the shortlist alone, in depth. One column per option (each shortlisted country,
// and beside it the same country with the trade agreement it could claim), in the country's color,
// and a row for everything worth comparing: what it costs (the duty, against the cheapest landed
// cost, the landed cost), what the duty is made of (every tariff and fee), the trade program,
// supply (how much the US imports from there, Census) and stability (the rate since the verified
// data starts, how often and how far it moved). Under it, the shortlist charted.

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
  asOf,
  countries,
  colors,
  max,
  signedIn,
  onAdd,
  onRemove,
  onViewDetails,
}: {
  product: TrackedProduct;
  origins: Origins;
  // In shortlist order (under the control bar's trade programs choice)
  options: CompareOption[];
  // The control bar's date, when it isn't today
  asOf?: string;
  countries: Country[];
  colors: Record<string, string>;
  max: number;
  signedIn: boolean;
  onAdd: (country: Country) => void;
  onRemove: (code: string) => void;
  onViewDetails: (country: Country, preference?: string) => void;
}) => {
  const value = product.customsValue > 0 ? product.customsValue : 1;
  const results = useMemo(() => options.map((o) => ({ option: o, result: optionResult(product, o, asOf) })), [options, product, asOf]);
  const landed = (r: (typeof results)[number]) => product.customsValue + r.result.totalDuty + r.result.totalFees;
  const lowest = Math.min(...results.map(landed));
  const lowestCount = results.filter((r) => Math.abs(landed(r) - lowest) < 0.005).length;
  const { imports, histories, colors: partColors } = origins;
  const ranked = imports
    ? Array.from(imports.byCountry.entries())
        .filter(([, v]) => v.value > 0)
        .sort((a, b) => b[1].value - a[1].value)
        .map(([code]) => code)
    : [];
  const today = time(todayIso());

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
      <Td key={r.option.key} align="right" className={r.option.agreement ? "bg-base-200/40" : ""}>
        {render(r)}
      </Td>
    ));

  // The answer, in a line, before the detail: the cheapest option on the shortlist against yours
  const yours = results.find((r) => r.option.origin.isOrigin && !r.option.agreement);
  const cheapest = results.reduce<(typeof results)[number] | undefined>((a, b) => (!a || landed(b) < landed(a) - 0.005 ? b : a), undefined);
  const saved = yours && cheapest ? landed(yours) - landed(cheapest) : 0;

  return (
    <div className="flex flex-col gap-4">
      {cheapest && yours && (
        <p className="m-0 text-base leading-relaxed text-base-content/80">
          {results.length === 1 ? (
            <>Add a country to compare {yours.option.origin.country.name} with.</>
          ) : saved < 0.005 ? (
            <>
              <span className="font-semibold text-base-content">{yours.option.origin.country.name}</span> already costs the least on your shortlist
              {asOf ? ` on ${shortDate(asOf, true)}` : ""}.
            </>
          ) : (
            <>
              On your shortlist{asOf ? ` on ${shortDate(asOf, true)}` : ""}, <span className="font-semibold text-base-content">{optionLabel(cheapest.option)}</span> costs the
              least: <span className="font-semibold text-base-content">{money(cheapest.result.totalDuty)}</span> in duty, up to{" "}
              <span className="font-semibold text-success">{money(saved)}</span> less per shipment than {yours.option.origin.country.name}
              {cheapest.option.agreement ? ", if the goods meet the agreement's rules of origin" : ""}.
            </>
          )}
        </p>
      )}
      <Table label="Your shortlist, side by side" valign="top" className="[&_tbody>tr>*:first-child]:sticky [&_tbody>tr>*:first-child]:left-0 [&_tbody>tr>*:first-child]:z-[1] [&_tbody>tr>*:first-child]:bg-base-100">
        <THead>
          <Tr>
            <Th className="sticky left-0 z-[2] min-w-[15rem]">
              <span className="sr-only">Detail</span>
            </Th>
            {results.map(({ option: o }) => (
              <Th key={o.key} align="right" className={`!normal-case !tracking-normal min-w-[11rem] ${o.agreement ? "!bg-base-200/70" : ""}`}>
                <span className="flex flex-col items-end gap-1">
                  {/* The country's color, dashed for its agreement option (as in the charts) */}
                  <span className={`h-1 w-10 rounded-full ${o.agreement ? "opacity-60" : ""}`} style={{ background: colors[o.origin.country.code] }} aria-hidden />
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-base-content">
                    <span aria-hidden>{o.origin.country.flag}</span>
                    {o.origin.country.name}
                    {o.origin.isOrigin && !o.agreement && <span className="text-xs font-normal text-base-content/60">yours</span>}
                    {!o.origin.isOrigin && !o.agreement && (
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
            <RowHeader>Claimed</RowHeader>
            {cell((r) =>
              r.option.agreement ? (
                <span className="flex flex-col items-end gap-0.5">
                  <span className="font-semibold text-success">{shortAgreement(r.option.agreement.name)}</span>
                  <span className="text-xs text-base-content/60">If the goods meet its rules of origin</span>
                </span>
              ) : (
                <span className="flex flex-col items-end gap-0.5">
                  <span className="text-base-content/70">None</span>
                  {r.result.availablePreferences.length > 0 && (
                    <span className="text-xs text-base-content/60">
                      {r.result.availablePreferences.length} {r.result.availablePreferences.length === 1 ? "program" : "programs"} available
                    </span>
                  )}
                </span>
              )
            )}
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

          <Group title={`Stability, since ${shortDate(origins.range.from, true)}`} span={span} />
          <Tr>
            <RowHeader>Rate over time</RowHeader>
            {cell((r) => {
              const segments = segmentsFor(r.option, histories.get(r.option.origin.country.code));
              return segments.length ? (
                <div className="ml-auto w-32">
                  <Sparkline
                    points={segments.map((s) => ({ x: time(s.from), y: s.pct }))}
                    color={colors[r.option.origin.country.code]}
                    step
                    to={today}
                    height={28}
                    label={`${optionLabel(r.option)}'s rate over time`}
                  />
                </div>
              ) : (
                <span className={`${ui.skeleton} ml-auto block h-7 w-32`} aria-hidden />
              );
            })}
            {addCell}
          </Tr>
          <Tr>
            <RowHeader>Changes</RowHeader>
            {cell((r) => {
              const h = histories.get(r.option.origin.country.code);
              if (!h) return <span className="text-base-content/40">…</span>;
              const segments = segmentsFor(r.option, h);
              const v = volatility(h, r.option.agreement ? "agreements" : "standard");
              const latest = [...segments].reverse().find((s) => s.changes.length > 0);
              return v.changes === 0 ? (
                <span className="text-base-content/70">Steady</span>
              ) : (
                <span className="flex flex-col items-end">
                  <span>
                    {v.changes} {v.changes === 1 ? "change" : "changes"} · swung {formatRate(v.swing)}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {formatRate(v.min)} to {formatRate(v.max)}
                    {latest ? ` · last ${shortDate(latest.from)}` : ""}
                  </span>
                </span>
              );
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

      <ShortlistCanvas options={options} colors={colors} origins={origins} field={signedIn} asOf={asOf} />
    </div>
  );
};
