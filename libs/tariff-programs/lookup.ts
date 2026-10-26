import type { IsoDate } from "@/tariffs/engine-v2/types";
import { canonicalHtsCode, htsCodeDigitsOnly } from "@/libs/hts-code";
import { codeInfoFor } from "./codeLinks";
import { hubPath, PROGRAM_HUBS } from "./hubs";
import { countriesLabel, programPage, type ProgramPage } from "./program";

// "Is my code on the list?": which program pages list an HTS code under a heading in force today.
// A listed code covers every line under it, so 8471.30.01.00 is on a list that names 8471.30. A
// shorter code (8471) can't be on or off a list, so it gets the listed codes beneath it instead.
// The search box on the /tariffs pages asks /api/tariff-programs/lookup, which answers with this.

export interface ProgramLookup {
  // The code as the HTS writes it ("8471.30.01.00")
  code: string;
  // The HTS line's readable name and page, when the code is one
  line: { name?: string; href: string | null };
  // Programs with an in-force heading listing the code (or a code above it)
  listed: {
    slug: string;
    title: string;
    href: string;
    headings: { code: string; name: string; rate: string; countries: string; listedAs: string }[];
  }[];
  // For a code shorter than the listed ones: programs listing codes beneath it
  beneath: { slug: string; title: string; href: string; count: number; examples: string[] }[];
  // Programs with an in-force heading on every product from the countries it names
  everyProduct: { slug: string; title: string; href: string; countries: string }[];
}

let cache: { date: IsoDate; pages: ProgramPage[] } | null = null;
const programPages = () => {
  const date = new Date().toISOString().slice(0, 10);
  if (cache?.date !== date) cache = { date, pages: PROGRAM_HUBS.map((hub) => programPage(hub, date)) };
  return cache.pages;
};

const digits = (code: string) => htsCodeDigitsOnly(code);

export const lookupProgramCode = async (raw: string): Promise<ProgramLookup | null> => {
  const code = canonicalHtsCode(raw.trim());
  if (!code) return null;
  const d = digits(code);

  const listed: ProgramLookup["listed"] = [];
  const beneath: ProgramLookup["beneath"] = [];
  const everyProduct: ProgramLookup["everyProduct"] = [];
  for (const page of programPages()) {
    const { hub } = page;
    const base = { slug: hub.slug, title: hub.title, href: hubPath(hub) };
    const headings = page.inForce.flatMap((p) => {
      if (p.coverage.excluded.some((x) => d.startsWith(digits(x)))) return [];
      const listedAs = p.coverage.codes.find((c) => d.startsWith(digits(c)));
      return listedAs ? [{ code: p.code, name: p.name, rate: p.rate, countries: countriesLabel(p), listedAs }] : [];
    });
    if (headings.length > 0) listed.push({ ...base, headings });
    else {
      const under = page.codes.filter((r) => digits(r.code).startsWith(d) && digits(r.code) !== d).map((r) => r.code);
      if (under.length > 0) beneath.push({ ...base, count: under.length, examples: under.slice(0, 6) });
    }
    // Not the ones that depend on a claim or a use (parts for US vehicle production): those don't
    // cover every product
    const all = page.allProducts.filter((p) => !p.conditional && !p.coverage.excluded.some((x) => d.startsWith(digits(x))));
    if (all.length > 0) {
      const names = Array.from(new Set(all.flatMap((p) => (p.countries.all ? [] : p.countries.names))));
      const countries = all.some((p) => p.countries.all) ? "All countries" : names.length > 3 ? `${names.length} countries` : names.join(", ");
      everyProduct.push({ ...base, countries });
    }
  }

  const info = (await codeInfoFor([code]))[code];
  return { code, line: { name: info?.name, href: info?.href ?? null }, listed, beneath, everyProduct };
};
