import Link from "next/link";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import { describeTotal, formatDutyPct, HtsDutySummary } from "@/libs/hts-duty-summary";
import { CENSUS_NOTICE } from "@/components/duty-calculator/lib/census";
import { formatImportValue, UsImports } from "@/components/duty-calculator/lib/usImportsData";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { countryPageByCode } from "@/libs/country-pages/countries";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table/Table";

// Where the US imports an HTS code from, on the /hts/[code] page: the code's own top supplying
// countries by last year's US imports (Census), each with its share, the change on the year
// before, and the total duty it pays today (from the Tariff Calculator's engine, with the trade
// program that lowers it most). Server-rendered for search engines.

export const IMPORT_SOURCES_SHOWN = 10;

const joinNames = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

export function ImportSources({
  htsno,
  productName,
  imports,
  duty,
}: {
  htsno: string;
  productName: string;
  imports: UsImports;
  // The duty from each of the top suppliers, in the same order
  duty: HtsDutySummary | null;
}) {
  const rows = Array.from(imports.byCountry.entries())
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, IMPORT_SOURCES_SHOWN);
  const share = (value: number) => (imports.totalValue > 0 ? Math.round((value / imports.totalValue) * 100) : 0);
  const dutyFor = (iso: string) => duty?.rows.find((r) => r.country.code === iso);
  const top = rows.slice(0, 3).map(([iso, v]) => `${dutyFor(iso)?.country.name ?? iso} (${share(v.value)}%)`);
  const scope = imports.level === 10 ? `HTS ${htsno}` : `HTS ${htsno.slice(0, imports.level === 8 ? 10 : 7)} and related codes`;
  const priorTotal = Array.from(imports.byCountry.values()).reduce((s, x) => s + x.prior, 0);
  const totalTrend = priorTotal > 0 ? (imports.totalValue - priorTotal) / priorTotal : null;

  return (
    <section id="us-imports" className={ui.section}>
      <SectionHeader kicker={`Top origins · US imports ${imports.year}`} title={`Top Origins: Countries the US Imports HTS ${htsno} From`}>
        In {imports.year} the US imported {formatImportValue(imports.totalValue)} of {productName.toLowerCase()} ({scope})
        {totalTrend !== null && `, ${totalTrend >= 0 ? "up" : "down"} ${Math.abs(Math.round(totalTrend * 100))}% on ${imports.prior}`}, mostly from{" "}
        {joinNames(top)}. Each country&apos;s total duty today is shown beside its imports.
      </SectionHeader>

      <div className={`${tt.panel} overflow-hidden`}>
        <Table framed={false}>
          <THead>
            <Tr>
              <Th>Country of origin</Th>
              <Th align="right">US imports, {imports.year}</Th>
              <Th align="right">Share</Th>
              <Th align="right">vs {imports.prior}</Th>
              <Th align="right">Total duty today</Th>
            </Tr>
          </THead>
          <TBody>
            {rows.map(([iso, v]) => {
              const row = dutyFor(iso);
              const trend = v.prior > 0 ? (v.value - v.prior) / v.prior : null;
              const page = countryPageByCode(iso);
              const name = row?.country.name ?? iso;
              return (
                <Tr key={iso} className="transition-colors hover:bg-tt-soft">
                  <RowHeader className="whitespace-nowrap">
                    {/* As in Duty by Country: a country page is followed, the calculator isn't */}
                    <Link
                      href={page ? `/duty-calculator/${page.slug}` : `/duty-calculator?code=${htsno}&country=${iso}`}
                      rel={page ? undefined : "nofollow"}
                      className="font-medium text-base-content hover:text-primary hover:underline"
                    >
                      <span aria-hidden="true" className="mr-2">
                        {row?.country.flag}
                      </span>
                      {name}
                    </Link>
                  </RowHeader>
                  <Td align="right" className="font-medium">
                    {formatImportValue(v.value)}
                  </Td>
                  <Td align="right" muted>
                    {share(v.value)}%
                  </Td>
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
                  <Td align="right">
                    {row ? (
                      <>
                        <span className="font-semibold text-base-content">{describeTotal(row)}</span>
                        {row.preference && row.preference.totalPct !== null && (
                          <span className={`${ui.caption} block`}>
                            {formatDutyPct(row.preference.totalPct)} with {row.preference.name}
                          </span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
        <p className="border-t border-base-300 px-6 py-4 text-xs leading-snug text-base-content/60">
          Source: U.S. Census Bureau, general imports{imports.level === 10 ? "" : ` (${imports.level}-digit group, as Census has no figures for this exact line)`}. Duty on a $10,000
          ocean shipment entered today, before customs fees. {CENSUS_NOTICE}
        </p>
      </div>
    </section>
  );
}
