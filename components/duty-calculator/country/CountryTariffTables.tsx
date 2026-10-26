import Link from "next/link";
import type { CountryTariffs } from "@/libs/country-pages/countryTariffs";
import type { OfficialSource } from "@/libs/official-sources";
import { mono } from "@/components/ui/font";
import { PROGRAM } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { RowHeader, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table/Table";
import { hubForProgram, hubPath } from "@/libs/tariff-programs/hubs";


// A program's color, when its name starts with one of the marketing programs ("Section 301 ...")
const programColor = (name: string) =>
  (Object.entries(PROGRAM) as [string, string][]).find(([program]) => name.startsWith(program))?.[1];

const HeadingLinks = ({ codes }: { codes: string[] }) => (
  <span className="flex flex-wrap gap-1.5">
    {codes.map((code) => (
      <Link
        key={code}
        href={`/hts/${code}`}
        className={`${mono.className} rounded-md bg-slate-100 skin:bg-tt-soft px-1.5 py-0.5 text-xs font-medium text-slate-700 skin:text-base-content/80 transition-colors hover:bg-teal-50 skin:hover:bg-primary/10 hover:text-teal-700 skin:hover:text-primary`}
      >
        {code}
      </Link>
    ))}
  </span>
);

// The proclamations and notices behind a row, linked to the publisher
const SourceLinks = ({ sources }: { sources: OfficialSource[] }) =>
  sources.length > 0 ? (
    <span className="mt-1.5 block text-xs font-normal leading-snug text-slate-500 skin:text-base-content/60">
      Source:{" "}
      {sources.map((source, i) => (
        <span key={source.url ?? source.label}>
          {i > 0 && "; "}
          {source.url ? (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-teal-700 skin:decoration-base-content/20 skin:hover:text-primary">
              {source.label}
            </a>
          ) : (
            source.label
          )}
        </span>
      ))}
    </span>
  ) : null;

// The programs written for this country, then its own Section 232 rates
export function CountryTariffTables({ tariffs, countryName }: { tariffs: CountryTariffs; countryName: string }) {
  return (
    <div className="flex flex-col gap-6">
      {tariffs.programs.length > 0 && (
        <div className={`${mk.card} overflow-hidden`}>
          <Table framed={false} valign="top">
            <THead>
              <Tr>
                <Th>Program</Th>
                <Th>Rate</Th>
                <Th>Covers</Th>
                <Th>Chapter 99 headings</Th>
              </Tr>
            </THead>
            <TBody>
              {tariffs.programs.map((p) => {
                const color = programColor(p.name);
                return (
                  <Tr key={p.id}>
                    <RowHeader className="font-semibold text-slate-900 skin:text-base-content">
                      <span className="flex items-baseline gap-2.5">
                        {/* Program colors are data colors, set inline (DESIGN_SYSTEM §14) */}
                        {color && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />}
                        {hubForProgram(p.id) ? (
                          <Link href={hubPath(hubForProgram(p.id)!)} className="hover:text-teal-700 skin:hover:text-primary hover:underline">
                            {p.name}
                          </Link>
                        ) : (
                          p.name
                        )}
                      </span>
                      <SourceLinks sources={p.sources} />
                    </RowHeader>
                    <Td className="font-semibold text-slate-900 skin:text-base-content">{p.rates}</Td>
                    <Td className="text-slate-600 skin:text-base-content/70">{p.allProducts ? "All products" : "Listed products"}</Td>
                    <Td><HeadingLinks codes={p.headings} /></Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
        </div>
      )}

      {tariffs.dealRates.length > 0 && (
        <div className={`${mk.card} overflow-hidden`}>
          <div className="border-b border-slate-200 skin:border-base-300 px-6 py-5">
            <h3 className={mk.h3}>Section 232 rates for goods from {countryName}</h3>
            <p className={`${mk.small} mt-1`}>These replace the standard Section 232 rate for the products they cover</p>
          </div>
          <Table framed={false} valign="top">
            <THead>
              <Tr>
                <Th>Heading</Th>
                <Th>Covers</Th>
                <Th>Rate</Th>
              </Tr>
            </THead>
            <TBody>
              {tariffs.dealRates.map((d) => (
                <Tr key={d.code}>
                  <Td><HeadingLinks codes={[d.code]} /></Td>
                  <RowHeader className="text-slate-700 skin:text-base-content/80">
                    {d.name}
                    <SourceLinks sources={d.sources} />
                  </RowHeader>
                  <Td className="whitespace-nowrap font-semibold text-slate-900 skin:text-base-content">{d.rate}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <p className="text-sm leading-relaxed text-slate-600 skin:text-base-content/70">
        Section 232 tariffs on steel, aluminum, copper, autos and parts, trucks, semiconductors, wood products,
        pharmaceuticals and drones apply to goods from every country, and some programs switch others off. See{" "}
        <Link href="/blog/us-tariff-stacking-rules" className={mk.link}>how US tariffs stack</Link>.
      </p>
    </div>
  );
}
