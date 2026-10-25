"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import type { TradeData } from "@/libs/sourcing/trade";
import type { AdcvdCase } from "./useSourcing";
import { SOURCE_URLS, Sources, usd, usdThousands } from "./bits";
import { CapacityEntry, SourcingRow } from "./model";
import type { RelatedCode } from "@/libs/sourcing/trade";
import { Countries } from "@/constants/countries";
import { Coverage, FEW_SUPPLIERS, monthYear } from "./coverage";

// How much the US figures for this code can tell you. Thin when few countries ship it, when the
// world's biggest exporters of its group don't appear in US imports, or when a big supplier
// stopped; each said plainly, with the AD/CVD orders that often explain it, so a gap in the data
// never reads as "nobody makes this there".

// The live AD/CVD orders on this product from a country, in words, and their case numbers
const ordersOn = (row: SourcingRow, cases: AdcvdCase[]) => {
  const flag = row.flags.find((f) => f.id === "adcvd");
  if (!flag) return null;
  const named = cases.filter((c) => (c.country === row.country.code || c.third_countries?.includes(row.country.code)) && flag.detail.includes(c.case_number));
  const since = named.map((c) => c.order_on ?? c.initiated_on).filter((d): d is string => Boolean(d)).sort()[0];
  return {
    text: `under AD/CVD ${named.some((c) => c.order_on) ? "orders" : "cases"} on this product${since ? ` since ${monthYear(since)}` : ""}`,
    cases: named.map((c) => c.case_number),
  };
};

export const DataCoverage = ({
  coverage,
  trade,
  capacity,
  cases,
  months,
  related,
}: {
  coverage: Coverage;
  trade: TradeData | null;
  capacity: { year: number; entry: CapacityEntry | null } | null;
  cases: AdcvdCase[];
  months: string[];
  // The other codes this product's AD/CVD cases cover, with US imports under each
  related: RelatedCode[];
}) => {
  const relatedTotal = related.reduce((sum, r) => sum + r.total, 0);
  // Who ships most under those codes, all of them together
  const relatedBy = new Map<string, number>();
  related.forEach((r) => r.top.forEach(([iso, v]) => relatedBy.set(iso, (relatedBy.get(iso) ?? 0) + v)));
  const relatedTop = Array.from(relatedBy.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([iso, v]) => `${Countries.find((c) => c.code === iso)?.name ?? iso} ${usd(v)}`);
  const hasRelated = relatedTotal > 0;
  if (!coverage.thin) return null;
  const group = trade ? `${trade.code.slice(0, 4)}.${trade.code.slice(4, 6)}` : "its 6-digit group";
  const scope = trade?.level === "HS6" ? `the whole group ${group}` : trade?.level === "HS8" ? "this code's 8 digits" : "this exact code";
  // Every claim names where it comes from
  const census = { label: `US Census, ${months[months.length - 12] ?? ""} to ${months[months.length - 1] ?? ""}`, url: SOURCE_URLS.census };
  const censusAll = { label: `US Census, ${months[0] ?? ""} to ${months[months.length - 1] ?? ""}`, url: SOURCE_URLS.census };
  const atlas = { label: `Atlas of Economic Complexity, ${capacity?.year ?? ""}`, url: SOURCE_URLS.atlas };
  const commerce = (cases: string[]) => ({ label: `Commerce ${cases.join(", ")}`, url: SOURCE_URLS.adcvd });
  return (
    <div className={`${ui.notice("warning")} flex items-start gap-3`} role="note">
      <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <div className="flex min-w-0 flex-col gap-1.5 text-sm">
        <p className="m-0">
          <strong>The US data for {scope} is limited</strong>, so read the US figures and rankings below with care.
        </p>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-base-content/80">
          {coverage.suppliers <= FEW_SUPPLIERS && (
            <li>
              Only {coverage.suppliers} {coverage.suppliers === 1 ? "country" : "countries"} shipped it to the US in the last 12 months
              {trade ? ` (${usd(trade.total.last.value)} in all)` : ""}.
              <Sources items={[census]} />
            </li>
          )}
          {coverage.missing.map((r) => {
            const orders = ordersOn(r, cases);
            return (
              <li key={r.country.code}>
                <strong className="text-base-content">
                  {r.country.flag} {r.country.name}
                </strong>{" "}
                is the #{r.world!.rank} exporter of {group} worldwide ({usdThousands(r.world!.exports)} to all countries in {capacity?.year}) but has no US imports of {scope} in
                the last 12 months{orders ? `; it's ${orders.text}` : ""}.
                <Sources items={[atlas, census, ...(orders ? [commerce(orders.cases)] : [])]} />
              </li>
            );
          })}
          {coverage.stopped
            .filter(([r]) => !coverage.missing.includes(r))
            .map(([r, first, last]) => {
              const orders = ordersOn(r, cases);
              return (
                <li key={r.country.code}>
                  <strong className="text-base-content">
                    {r.country.flag} {r.country.name}
                  </strong>{" "}
                  shipped {usd(first)} in the 12 months from {months[0]} and {usd(last)} in the last 12{orders ? `; it's ${orders.text}` : ""}.
                  <Sources items={[censusAll, ...(orders ? [commerce(orders.cases)] : [])]} />
                </li>
              );
            })}
          {hasRelated && (
            <li>
              <strong className="text-base-content">This product also enters under other codes</strong> named in its AD/CVD cases (in blends or mixtures, for example): the US
              imported {usd(relatedTotal)} under them in the last 12 months, mostly {relatedTop.join(", ")}. See the codes below.
              <Sources items={[census, { label: "Commerce AD/CVD scopes", url: SOURCE_URLS.adcvd }]} />
            </li>
          )}
          <li>
            World exports cover the whole {group} group, so the Capacity rankings lean on them more than on US imports here.
            <Sources items={[atlas]} />
          </li>
        </ul>
        <p className="m-0 text-base-content/70">
          Open <strong>Chart &amp; data</strong> on any figure to see every month and country behind it
          , and <strong>What Other Sources Say</strong> below for the Atlas&apos;s and EU&apos;s figures on who supplies it.
        </p>
      </div>
    </div>
  );
};
