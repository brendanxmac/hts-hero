import type { HtsElement } from "@/interfaces/hts";
import { describeTotal, findRateElement, getHtsDutySummary } from "@/libs/hts-duty-summary";
import { getHtsElementByCode, getHtsElementParentsServer } from "@/libs/hts-server";
import data from "./top-imports.json";
import stats from "./import-stats.json";

// What the US imports most from a country, by HTS code (Census general imports, from
// `npm run sync-hts-imports`), each with the duty it pays today: for the country pages. Fuels,
// precious metals, art and US goods returned are left out (not products an importer prices),
// as are codes the current HTS no longer has.

export interface TopImport {
  htsno: string;
  label: string;
  // USD
  value: number;
  prior: number;
  // Share of all US imports from the country, in percent
  sharePct: number | null;
  // Total duty today, as a rate ("26.5%"), and the lowest with a trade program, if lower
  total: string;
  preference?: { name: string; total: string };
}

const EXCLUDED = (code: string) => {
  const chapter = code.slice(0, 2);
  const heading = Number(code.slice(0, 4));
  return (
    ["27", "97", "98", "99"].includes(chapter) ||
    (heading >= 7106 && heading <= 7112) ||
    heading === 7115 ||
    heading === 7118
  );
};

// A short name for a 10-digit line. Its own description often only makes sense under its parents
// ("New", "Coniferous"), so it leads with its 4-digit heading, cut to its first clause, and adds
// the line's own words when they're short and say something ("Motor cars and other motor
// vehicles · New").
const clean = (text: string) => text.replace(/:$/, "").replace(/\s+/g, " ").trim();
// "Motor cars and other motor vehicles principally designed for…" → "Motor cars"
const headingName = (text: string, max = 40) => {
  const clause = clean(text)
    // "Insulated (including enameled or anodized) wire" reads as "Insulated wire"
    .replace(/\s*\([^)]*\)/g, "")
    .split(/[;:(]|, (?:including|whether|other than|for example)| (?:and|or) other /)[0]
    .replace(/,\s*$/, "")
    .trim();
  return clause.length <= max ? clause : `${clause.slice(0, max).replace(/\s+\S*$/, "")}…`;
};
// "Other", "Other: Of cotton": says nothing on its own
const isVague = (text: string) => /^other\b/i.test(text);
export const shortLabel = (element: HtsElement, parents: HtsElement[]) => {
  // The 4-digit heading, else the broadest line with a code of its own (some headings are written
  // at 8 digits, like toys), else the top of the chain
  const heading =
    parents.find((p) => p.htsno?.replace(/\./g, "").length === 4) ?? parents.find((p) => p.htsno) ?? parents[0];
  if (!heading) return headingName(element.description, 60);
  const head = headingName(heading.description);
  // The most specific line below the heading that's short enough to read and says something
  const below = [element, ...parents.slice(parents.indexOf(heading) + 1).reverse()];
  const qualifier = below.map((e) => clean(e.description)).find((d) => d.length <= 40 && !isVague(d) && d.toLowerCase() !== head.toLowerCase());
  return qualifier ? `${head} · ${qualifier.charAt(0).toUpperCase()}${qualifier.slice(1)}` : head;
};

export const TOP_IMPORTS_YEAR = data.year;
export const TOP_IMPORTS_PRIOR = data.prior;

export const countryTopImports = (code: string, elements: HtsElement[], max = 10): TopImport[] => {
  const list = (data.countries as unknown as Record<string, [string, number, number][]>)[code] ?? [];
  // All US imports from the country that year, in millions (Census country totals)
  const totalMillions = (stats.countries as Record<string, { imports2025?: number | null }>)[code]?.imports2025 ?? null;
  const out: TopImport[] = [];
  for (const [digits, thousands, priorThousands] of list) {
    if (out.length >= max) break;
    if (EXCLUDED(digits)) continue;
    const htsno = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}.${digits.slice(8, 10)}`;
    const element = getHtsElementByCode(htsno, elements);
    if (!element) continue;
    const parents = getHtsElementParentsServer(element, elements);
    const duty = getHtsDutySummary(element, findRateElement(element, parents), [code])?.rows[0];
    if (!duty) continue;
    const value = thousands * 1000;
    out.push({
      htsno: element.htsno,
      label: shortLabel(element, parents),
      value,
      prior: priorThousands * 1000,
      sharePct: totalMillions ? Math.round((value / (totalMillions * 1e6)) * 1000) / 10 : null,
      total: describeTotal(duty),
      preference:
        duty.preference && duty.preference.totalPct !== null
          ? { name: duty.preference.name, total: `${duty.preference.totalPct}%` }
          : undefined,
    });
  }
  return out;
};
