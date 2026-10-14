"use client";

import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { CENSUS_NOTICE, formatImportValue, UsImports } from "@/components/duty-calculator/lib/usImports";
import { formatRate } from "../../formatRate";
import { OriginRate, RateBasis, rateKey, rateOf } from "./analysis";

// The cheaper origins that already make this product for the US: countries paying less duty than
// the product's own origin that the US imported it from last year (Census), largest supplier
// first, with how much and the trend. A cheaper rate from a country that already ships it at
// scale is a real sourcing option, not just a number.

const SHOWN = 8;

export const ProvenSuppliers = ({
  rates,
  basis,
  imports,
  selected,
  onSelect,
}: {
  rates: OriginRate[];
  basis: RateBasis;
  imports: UsImports | null;
  // The shortlist: lit everywhere
  selected: ReadonlySet<string>;
  onSelect: (code: string) => void;
}) => {
  if (!imports) return null;
  const origin = rates.find((r) => r.isOrigin);
  const originPct = origin ? rateOf(origin, basis) : 0;
  const proven = rates
    .filter((r) => !r.isOrigin && rateKey(rateOf(r, basis)) < rateKey(originPct) && (imports.byCountry.get(r.country.code)?.value ?? 0) > 0)
    .sort((a, b) => (imports.byCountry.get(b.country.code)?.value ?? 0) - (imports.byCountry.get(a.country.code)?.value ?? 0));
  const yours = origin ? imports.byCountry.get(origin.country.code) : undefined;
  const family = imports.level === 10 ? "this product" : `products in the same ${imports.level}-digit group`;

  return (
    <section className={`${ui.card} flex flex-col`} aria-labelledby="proven-suppliers-title">
      <div className="flex flex-col gap-0.5 px-5 pb-3 pt-5">
        <h3 id="proven-suppliers-title" className={ui.cardTitle}>
          Cheaper origins that already make this
        </h3>
        <p className={ui.caption}>
          {proven.length
            ? `${proven.length} ${proven.length === 1 ? "country pays" : "countries pay"} less duty than ${origin?.country.name ?? "your origin"} and already ship ${family} to the US. Largest suppliers first, by ${imports.year} US imports.`
            : `No country paying less duty than ${origin?.country.name ?? "your origin"} shipped ${family} to the US in ${imports.year}.`}
        </p>
      </div>
      {proven.length > 0 && (
        <Table labelledBy="proven-suppliers-title" framed={false}>
          <THead>
            <Tr>
              <Th>Country</Th>
              <Th align="right">Duty rate</Th>
              <Th align="right">US imports, {imports.year}</Th>
              <Th align="right">vs {imports.prior}</Th>
            </Tr>
          </THead>
          <TBody>
            {proven.slice(0, SHOWN).map((r) => {
              const row = imports.byCountry.get(r.country.code)!;
              const trend = row.prior > 0 ? (row.value - row.prior) / row.prior : null;
              return (
                <Tr key={r.country.code} selected={selected.has(r.country.code)} onClick={() => onSelect(r.country.code)}>
                  <RowHeader className="text-base-content">
                    <span className="mr-2" aria-hidden>
                      {r.country.flag}
                    </span>
                    {r.country.name}
                    {basis === "agreements" && r.agreement && <span className="ml-2 text-xs text-base-content/60">with {r.agreement.symbol}</span>}
                  </RowHeader>
                  <Td align="right" className="font-semibold text-success">
                    {formatRate(rateOf(r, basis))}
                  </Td>
                  <Td align="right">{formatImportValue(row.value)}</Td>
                  <Td align="right">
                    {trend === null ? (
                      <span className="text-xs text-base-content/60">New</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-success" : "text-base-content/60"}`}>
                        {trend >= 0 ? <ArrowTrendingUpIcon className="h-3.5 w-3.5" aria-hidden /> : <ArrowTrendingDownIcon className="h-3.5 w-3.5" aria-hidden />}
                        {Math.abs(Math.round(trend * 100))}%
                      </span>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      )}
      <p className="border-t border-base-300 px-5 py-3 text-xs leading-snug text-base-content/60">
        {origin && yours && `For comparison, the US imported ${formatImportValue(yours.value)} from ${origin.country.name} in ${imports.year}. `}
        Source: U.S. Census Bureau, general imports{imports.level === 10 ? "" : `, ${imports.level}-digit group`}. {CENSUS_NOTICE}
      </p>
    </section>
  );
};
