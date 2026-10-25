"use client";

import { useEffect, useMemo, useState } from "react";
import { useHts } from "@/contexts/HtsContext";
import { Countries } from "@/constants/countries";
import { mono } from "@/components/ui/font";
import { Module } from "@/components/ui/Module";
import * as tt from "@/components/ui/styles/tracker";
import type { RelatedCode } from "@/libs/sourcing/trade";
import { usd } from "./bits";
import type { AdcvdCase } from "./useSourcing";

// The other codes this product's AD/CVD cases cover (R-125's orders also name its blends under
// 3827.xx), with what the US imported under each and from where. Shows where a product goes when
// it isn't under its own code: in a blend, a mixture, an older or newer number.

const MAX_CODES = 8;

// "38276300" → "3827.63.00"; 6, 8 or 10 digits
const dotted = (digits: string) => [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(".");

// The case codes outside this code's own 6-digit group, and the cases naming each
export const relatedCodesOf = (cases: AdcvdCase[], code: string) => {
  const named = new Map<string, AdcvdCase[]>();
  cases.forEach((c) => {
    const outdated = new Set((c.hts_outdated ?? []).map((x) => x.replace(/\D/g, "")));
    [...(c.hts_main ?? []), ...(c.hts_also ?? [])]
      .map((x) => x.replace(/\D/g, "").replace(/0000$/, ""))
      .filter((x) => x.length >= 6 && !x.startsWith(code.slice(0, 6)) && !outdated.has(x))
      .forEach((x) => named.set(x, [...(named.get(x) ?? []), c].filter((v, i, all) => all.indexOf(v) === i)));
  });
  return Array.from(named.entries()).slice(0, MAX_CODES);
};

export const useRelatedCodes = (codes: string[]) => {
  const key = codes.join(",");
  const [state, setState] = useState<{ key: string; codes: RelatedCode[] } | null>(null);
  useEffect(() => {
    if (!key) return;
    let live = true;
    fetch(`/api/sourcing/related?codes=${key}`)
      .then((r): Promise<{ codes: RelatedCode[] }> | null => (r.ok ? r.json() : null))
      .catch((): null => null)
      .then((d) => live && setState({ key, codes: d?.codes ?? [] }));
    return () => {
      live = false;
    };
  }, [key]);
  return state && state.key === key ? state.codes : null;
};

export const RelatedCodes = ({ related, cases }: { related: RelatedCode[]; cases: Map<string, AdcvdCase[]> }) => {
  const { htsElements } = useHts();
  // The line itself, or for a 6- or 8-digit code the shortest line under it
  const describe = (digits: string) =>
    htsElements
      .filter((e) => e.htsno === dotted(digits) || e.htsno.startsWith(`${dotted(digits)}.`))
      .sort((x, y) => x.htsno.length - y.htsno.length)[0]?.description ?? null;
  const rows = useMemo(() => [...related].sort((a, b) => b.total - a.total), [related]);
  if (!rows.length) return null;
  return (
    <Module
      title="Where Else This Product Shows Up"
      subtitle="Other codes named in the scope of the AD/CVD cases on this product, and what the US imported under each in the last 12 months. The product can arrive under them, in a blend or mixture for example; whether a shipment is in scope depends on the case's scope wording."
      padded={false}
    >
      <div className="mt-4 overflow-x-auto border-t border-base-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-base-300 text-xs uppercase tracking-wide text-base-content/70">
              <th scope="col" className="px-5 py-2 text-left font-semibold sm:px-6">
                Code
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Named in
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                US imports, 12 mo
              </th>
              <th scope="col" className="px-5 py-2 text-left font-semibold sm:px-6">
                Largest suppliers
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b border-base-300 last:border-0 align-top">
                <td className="px-5 py-3 sm:px-6">
                  <span className={`${mono.className} font-semibold text-base-content`}>{dotted(r.code)}</span>
                  {describe(r.code) && <span className="block max-w-sm text-xs text-base-content/60">{describe(r.code)}</span>}
                </td>
                <td className="px-3 py-3 text-xs text-base-content/70">
                  {(cases.get(r.code) ?? []).map((c) => (
                    <span key={c.case_number} className="block">
                      {c.case_number} · {c.product}
                    </span>
                  ))}
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-base-content">{r.total > 0 ? usd(r.total) : "None"}</td>
                <td className="px-5 py-3 text-xs sm:px-6">
                  {r.top.length ? (
                    <span className="flex flex-wrap gap-x-3 gap-y-1">
                      {r.top.map(([iso, v]) => {
                        const country = Countries.find((c) => c.code === iso);
                        return (
                          <span key={iso} className="whitespace-nowrap text-base-content/80">
                            {country?.flag} {country?.name ?? iso} <span className="tabular-nums text-base-content/60">{usd(v)}</span>
                          </span>
                        );
                      })}
                    </span>
                  ) : (
                    <span className="text-base-content/50">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`${tt.caption} px-5 py-3 sm:px-6`}>Source: the cases&apos; scope codes from Commerce (ITA); US imports from the U.S. Census Bureau.</p>
    </Module>
  );
};
