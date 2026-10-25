"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { supplyOf } from "../../../duty-calculator/compare/CountryCard";
import { formatMoney } from "../../../duty-calculator/lib/format";
import { formatImportValue, UsImports } from "../../../duty-calculator/lib/usImportsData";
import { formatRate } from "../../formatRate";
import { wholeDollars } from "../../insights/teasers";
import { formatSaving, Measure } from "../../opportunities/measure";
import { SavingOption } from "../../opportunities/options";
import { TrackedProduct } from "../../report";

// The facts beside an option's question: the rate today and with it (RateChange), and for sourcing
// it elsewhere, what the US imports of the product from there and from today's origin (Census).

const money = (n: number) => formatMoney(Math.round(n * 100) / 100).replace(/\.00$/, "");

// "With USMCA", "With the exemption", "From Canada"
const withLabel = (option: SavingOption) =>
  option.kind === "origin" ? `From ${option.setup.country.name}` : option.kind === "program" ? option.title.replace(/^Claim /, "With ") : "With the exemption";

// Today's rate, the rate with the option, and the difference, in one row
export const RateChange = ({
  product,
  option,
  measure,
  shipmentsPerYear,
  done,
}: {
  product: TrackedProduct;
  option: SavingOption;
  measure: Measure;
  shipmentsPerYear: number;
  // Secured: it's the rate now, not a potential one
  done?: boolean;
}) => {
  const pct = measure === "pct";
  const today = pct ? formatRate(product.totalPct) : money(product.result.totalDuty);
  const after = pct ? formatRate(option.ratePct) : money(option.result.totalDuty);
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl bg-tt-soft px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <span className={tt.caption}>Today{pct ? "" : ", a shipment"}</span>
        <span className={`${tt.metric} text-base-content/70`}>{today}</span>
      </div>
      <ArrowRightIcon className="h-5 w-5 shrink-0 text-success" aria-hidden />
      <div className="flex flex-col gap-0.5">
        <span className={tt.caption}>{withLabel(option)}</span>
        <span className={`${tt.metric} !text-success`}>{after}</span>
      </div>
      <div className="ml-auto flex flex-col items-end gap-0.5 text-right">
        <span className="rounded-full bg-success px-3 py-1 text-sm font-bold tabular-nums text-success-content">−{formatSaving(option.usd, product.customsValue, measure)}</span>
        <span className={tt.caption}>
          {pct ? "off the rate" : `${wholeDollars(option.usd * shipmentsPerYear)} a year`}
          {done ? "" : option.kind === "exemption" ? ", if it applies" : ", if you qualify"}
        </span>
      </div>
    </div>
  );
};

const LEVELS: Record<UsImports["level"], string> = { 10: "this 10-digit code", 8: "its 8-digit family", 6: "its 6-digit family" };

const Supplier = ({ label, flag, name, imports, code, highlight }: { label: string; flag: string; name: string; imports: UsImports; code: string; highlight?: boolean }) => {
  const supply = supplyOf(imports, code);
  const row = imports.byCountry.get(code);
  const change = row && row.prior > 0 ? (row.value - row.prior) / row.prior : null;
  const suppliers = Array.from(imports.byCountry.values()).filter((v) => v.value > 0).length;
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-2 rounded-xl p-4 ${highlight ? "bg-primary/[0.06]" : "bg-tt-soft"}`}>
      <span className={tt.caption}>{label}</span>
      <span className="flex items-center gap-2 text-sm font-semibold text-base-content">
        <span className="text-lg" aria-hidden>
          {flag}
        </span>
        {name}
      </span>
      {supply && supply.value > 0 ? (
        <>
          <span className={tt.metricSm}>{formatImportValue(supply.value)}</span>
          <span className="text-xs text-base-content/70">
            {(supply.share * 100).toFixed(supply.share < 0.01 ? 1 : 0)}% of US imports · #{supply.rank} of {suppliers} countries
          </span>
          {change !== null && (
            <span className={`text-xs font-semibold tabular-nums ${change >= 0 ? "text-success" : "text-error"}`}>
              {change >= 0 ? "+" : "−"}
              {Math.abs(change * 100).toFixed(0)}% on {imports.prior}
            </span>
          )}
        </>
      ) : (
        <span className="text-sm text-base-content/70">No US imports from here in {imports.year}</span>
      )}
    </div>
  );
};

// What the US imported of this product from the new origin and from today's, last year (Census)
export const OriginSupply = ({ product, option, imports }: { product: TrackedProduct; option: SavingOption; imports: UsImports | null }) => {
  if (!imports) return <p className={`${tt.caption} m-0`}>Census has no US import figures for this code.</p>;
  return (
    <div className="flex flex-col gap-3">
      <h3 className={tt.sectionTitle}>Who Makes It for the US</h3>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Supplier label={`If you source it here · ${imports.year}`} flag={option.setup.country.flag} name={option.setup.country.name} imports={imports} code={option.setup.country.code} highlight />
        <Supplier label={`Your origin today · ${imports.year}`} flag={product.entry.country.flag} name={product.entry.country.name} imports={imports} code={product.entry.country.code} />
      </div>
      <p className={`${tt.caption} m-0`}>
        US imports of {LEVELS[imports.level]} ({product.entry.element.htsno}), all suppliers {formatImportValue(imports.totalValue)} in {imports.year}. U.S. Census Bureau.
      </p>
    </div>
  );
};
