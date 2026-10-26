import { AllRules } from "@/tariffs/engine-v2/data";
import type { IsoDate } from "@/tariffs/engine-v2/types";
import { sourceDocuments, type OfficialSource } from "@/libs/official-sources";
import { describeRate, headingProfile, isExemption, longDate, type HeadingProfile } from "./heading";
import type { ProgramHub } from "./hubs";

// Everything a /tariffs/[slug] page shows, from the engine's records for the program on one date:
// its headings (in force, scheduled and ended), every HTS code its headings list with the rate
// each adds, its exemptions, and a dated log of its changes.

export interface CodeRow {
  // Dotted HTS prefix, as the heading lists it ("7208", "8708.29.50")
  code: string;
  headings: { code: string; name: string; rate: string; countries: string }[];
}

export interface ProgramChange {
  date: IsoDate;
  kind: "start" | "end";
  heading: string;
  name: string;
  rate: string;
  sources: OfficialSource[];
}

export interface ProgramPage {
  hub: ProgramHub;
  asOf: IsoDate;
  // Headings that charge a duty and are in force
  inForce: HeadingProfile[];
  // In-force headings that charge nothing (exemptions, reliefs, reporting lines)
  exemptions: HeadingProfile[];
  scheduled: HeadingProfile[];
  ended: HeadingProfile[];
  // Every code the in-force charging headings list, in HTS order
  codes: CodeRow[];
  // In-force charging headings that cover every product (no list)
  allProducts: HeadingProfile[];
  changes: ProgramChange[];
  lastChange: IsoDate | null;
  // "7.5%–100%" across the in-force charging headings; null when there are none
  rateRange: string | null;
  sources: OfficialSource[];
}

const formatPct = (n: number) => `${Number(n.toFixed(2))}%`;

// "China", "every country", "every country except United Kingdom", "27 countries"
export const countriesLabel = (p: HeadingProfile) => {
  const { all, names, except } = p.countries;
  if (all) return except.length > 0 ? `All except ${except.length > 3 ? `${except.length} countries` : except.join(", ")}` : "All countries";
  if (names.length > 3) return `${names.length} countries`;
  return names.join(", ") || "Named countries";
};

export const programPage = (hub: ProgramHub, today: IsoDate = new Date().toISOString().slice(0, 10)): ProgramPage => {
  const records = AllRules.tariffs.filter((t) => hub.programs.includes(t.program));
  const codes = Array.from(new Set(records.map((t) => t.code))).sort();
  const profiles = codes.map((c) => headingProfile(c, today)).filter((p): p is HeadingProfile => !!p);

  const current = profiles.filter((p) => p.status === "in-force");
  const inForce = current.filter((p) => !isExemption(p));
  const exemptions = current.filter((p) => isExemption(p));

  const byCode = new Map<string, CodeRow>();
  for (const p of inForce) {
    for (const code of p.coverage.codes) {
      const row = byCode.get(code) ?? { code, headings: [] };
      row.headings.push({ code: p.code, name: p.name, rate: p.rate, countries: countriesLabel(p) });
      byCode.set(code, row);
    }
  }

  const changes: ProgramChange[] = records
    .flatMap((t) => {
      const base = { heading: t.code, name: t.name, sources: sourceDocuments([t.source]) };
      const rate = describeRate(t);
      return [
        ...(t.effective.from ? [{ ...base, date: t.effective.from, kind: "start" as const, rate }] : []),
        ...(t.effective.to ? [{ ...base, date: t.effective.to, kind: "end" as const, rate }] : []),
      ];
    })
    .filter((c) => c.date <= today)
    // A version replaced by the next one on the same day isn't a start or an end
    .filter((c, _, all) =>
      c.kind === "start"
        ? !all.some((o) => o.kind === "end" && o.heading === c.heading && o.date === c.date)
        : !all.some((o) => o.kind === "start" && o.heading === c.heading && o.date === c.date)
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.heading.localeCompare(b.heading));

  const pcts = inForce.map((p) => p.ratePct).filter((n): n is number => n !== null && n > 0);
  const lo = Math.min(...pcts);
  const hi = Math.max(...pcts);

  return {
    hub,
    asOf: today,
    inForce,
    exemptions,
    scheduled: profiles.filter((p) => p.status === "scheduled"),
    ended: profiles.filter((p) => p.status === "ended").sort((a, b) => (b.endsOn ?? "").localeCompare(a.endsOn ?? "")),
    codes: Array.from(byCode.values()).sort((a, b) => a.code.localeCompare(b.code)),
    allProducts: inForce.filter((p) => p.coverage.all),
    changes,
    lastChange: changes[0]?.date ?? null,
    rateRange: pcts.length === 0 ? null : lo === hi ? formatPct(lo) : `${formatPct(lo)}–${formatPct(hi)}`,
    sources: sourceDocuments(records.filter((t) => current.some((p) => p.code === t.code)).map((t) => t.source)),
  };
};

// The answer the page leads with
export const hubLead = (page: ProgramPage) => {
  const { hub, inForce, codes, allProducts, rateRange, lastChange, ended } = page;
  if (inForce.length === 0) {
    const lastEnd = ended.map((p) => p.endsOn ?? "").sort().pop();
    return `The ${hub.short} are no longer collected: the last of their ${ended.length} Chapter 99 headings ended for goods entered on or after ${lastEnd ? longDate(lastEnd) : "its end date"}. They still apply to entries made while they were in force.`;
  }
  const covers =
    codes.length > 0
      ? `${codes.length.toLocaleString("en-US")} HTS codes${allProducts.length > 0 ? ", plus every product from the countries some of them name" : ""}`
      : "every product from the countries they name";
  return `${inForce.length} Chapter 99 heading${inForce.length === 1 ? " is" : "s are"} in force under the ${hub.short} on ${longDate(page.asOf)}, adding ${rateRange} to the regular duty and covering ${covers}.${lastChange ? ` The latest change took effect on ${longDate(lastChange)}.` : ""}`;
};
