import { Countries, Country } from "../constants/countries";
import { HtsElement } from "../interfaces/hts";
import { calculate } from "../tariffs/engine-v2/calculate";
import { AllRules } from "../tariffs/engine-v2/data";
import { getLatestVerifiedRevision, HtsRevision } from "../tariffs/engine-v2/revisions";
import { DutyColumn, IsoDate } from "../tariffs/engine-v2/types";

// Server-side duty summaries for the /hts/[code] pages: what an import under the code pays
// from the largest sources of US imports, from the same engine as the Tariff Calculator.
// Rendered into the HTML so search engines and AI crawlers can read the rates.

// The largest sources of US imports, in rough order of import value
const SUMMARY_COUNTRY_CODES = [
  "CN", "MX", "CA", "VN", "DE", "JP", "KR", "TW", "IN", "IE",
  "IT", "CH", "TH", "MY", "GB", "FR", "ID", "BR", "BD", "KH",
];

// Totals are for a standard shipment; per-unit base rates make them depend on the quantity
const CUSTOMS_VALUE = 10000;
const QUANTITY = 1000;

export interface AdditionalDuty {
  code: string; // Chapter 99 heading
  program: string; // "Section 301 – China"
  name: string;
  ratePct: number;
}

export interface CountryDuty {
  country: Country;
  column: DutyColumn;
  baseRate: string; // "16.5%", "Free", "6.3¢/liter"
  additional: AdditionalDuty[]; // Chapter 99 duties that apply, above 0%
  additionalPct: number;
  // Base rate plus additional duties as a percent of value; null when the base rate is per unit
  totalPct: number | null;
  // The lowest total from claiming a trade preference, when it's lower
  preference?: { symbol: string; name: string; totalPct: number | null };
}

export interface HtsDutySummary {
  asOf: IsoDate;
  revision: HtsRevision; // latest revision with verified tariff data
  rows: CountryDuty[];
}

// The HTS line carrying the base rates: the line itself, or the nearest parent that has them
export const findRateElement = (element: HtsElement, parents: HtsElement[]) => {
  if (element.general || element.special || element.other || element.additionalDuties) return element;
  for (let i = parents.length - 1; i >= 0; i--) {
    if (parents[i].general || parents[i].special || parents[i].other) return parents[i];
  }
  return element;
};

const programName = (id?: string) =>
  AllRules.programs.find((p) => p.id === id)?.name ?? "Additional duty";

const PREFERENCE_SHORT_NAMES: Record<string, string> = {
  "United States-Mexico-Canada Agreement": "USMCA",
};

// "Generalized System of Preferences (GSP)" -> "GSP",
// "United States-Korea Free Trade Agreement" -> "US-Korea FTA"
export const preferenceName = (name: string) =>
  PREFERENCE_SHORT_NAMES[name] ??
  name.match(/\(([^)]+)\)\s*$/)?.[1] ??
  name.replace(/^United States-(.+?) Free Trade Agreement.*$/, "US-$1 FTA");

const round2 = (n: number) => Math.round(n * 100) / 100;

// Local date as "YYYY-MM-DD"
const todayIso = () => new Date().toLocaleDateString("en-CA");

export const getHtsDutySummary = (
  element: HtsElement,
  rateElement: HtsElement,
): HtsDutySummary | null => {
  // Chapter 99 lines are the additional duties themselves; headings above the rate lines have
  // no rates to start from
  if (!element.htsno || element.htsno.startsWith("99")) return null;
  if (!rateElement.general && !rateElement.other) return null;

  const asOf = todayIso();
  const baseRates = {
    general: rateElement.general,
    special: rateElement.special,
    other: rateElement.other,
  };
  const run = (country: string, claimedPreference?: string) =>
    calculate(AllRules, {
      htsCode: element.htsno,
      country,
      asOf,
      customsValue: CUSTOMS_VALUE,
      quantity: QUANTITY,
      baseRates,
      claimedPreference,
      transportMode: "ocean",
    });

  const rows = SUMMARY_COUNTRY_CODES.flatMap((code) => {
    const country = Countries.find((c) => c.code === code);
    if (!country) return [];
    const result = run(code);
    const totalPctOf = (r: typeof result) =>
      r.requiresQuantity ? null : round2((r.totalDuty / CUSTOMS_VALUE) * 100);

    const additional = result.lines
      .filter((l) => l.status === "applies" && (l.ratePct ?? 0) > 0)
      .map((l) => ({
        code: l.code,
        program: programName(l.program),
        name: l.name,
        ratePct: l.ratePct ?? 0,
      }));
    const additionalAmount = result.lines
      .filter((l) => l.status === "applies")
      .reduce((sum, l) => sum + l.amount, 0);

    let preference: CountryDuty["preference"];
    let lowestDuty = result.totalDuty;
    const symbols = Array.from(new Set(result.availablePreferences.map((p) => p.symbol)));
    for (const symbol of symbols) {
      const claimed = run(code, symbol);
      if (claimed.totalDuty >= lowestDuty) continue;
      lowestDuty = claimed.totalDuty;
      const name = result.availablePreferences.find((p) => p.symbol === symbol)?.name ?? symbol;
      preference = { symbol, name: preferenceName(name), totalPct: totalPctOf(claimed) };
    }

    return [
      {
        country,
        column: result.column,
        baseRate: result.base.reasons[0] ?? "Free",
        additional,
        additionalPct: round2((additionalAmount / CUSTOMS_VALUE) * 100),
        totalPct: totalPctOf(result),
        preference,
      },
    ];
  });

  return { asOf, revision: getLatestVerifiedRevision(), rows };
};

// "16.5%", "36.5%"
export const formatDutyPct = (pct: number) => `${round2(pct)}%`;

// A row's total in words: "36.5%", or "6.3¢/liter + 25%" for per-unit base rates
export const describeTotal = (row: Pick<CountryDuty, "totalPct" | "baseRate" | "additionalPct">) =>
  row.totalPct !== null
    ? formatDutyPct(row.totalPct)
    : row.additionalPct > 0
      ? `${row.baseRate} + ${formatDutyPct(row.additionalPct)}`
      : row.baseRate;

// A readable product name for an HTS line. Many descriptions only make sense under their
// parents ("Of cotton", "Other", "Valued over $12/pair"), so those borrow the nearest
// parent that names the product: "T-shirts, singlets, tank tops and similar garments, of cotton".
const FRAGMENT_RE =
  /^(other|parts|thereof|mixtures|the foregoing|articles|not elsewhere|of |for |with |without |in |on |valued|containing|having|weighing|measuring|not |men's|women's|boys'|girls'|babies'|subject to|described in|certified|entered|put up|incorporating|including|excluding|comprising|designed|used |suitable|whether|presented|imported|wholly|solely|principally|mainly)/i;

// A qualifier rather than a product: "Of cotton", "Other", "Upholstered"
const isFragment = (description: string) =>
  FRAGMENT_RE.test(description.trim()) || /^\w+ed$/i.test(description.trim());

// Without trailing punctuation or textile category numbers ("Men's (345)")
const cleanDescription = (description: string) =>
  description.trim().replace(/(\s*\(\d{3}\))+$/, "").replace(/[\s:;,.]+$/, "");

const capitalize = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

// Drops parentheticals, then trailing comma clauses, then words, until the text fits
const shorten = (text: string, max: number) => {
  let out = text;
  if (out.length > max) out = out.replace(/\s*\([^)]*\)/g, "");
  while (out.length > max && out.includes(",")) out = out.slice(0, out.lastIndexOf(",")).trim();
  if (out.length > max) out = `${out.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
  return out;
};

// "Other shrimps and prawns" -> "Shrimps and prawns"; a bare "Other" stays
const withoutOther = (text: string) =>
  /^other\s+\S/i.test(text) ? capitalize(text.replace(/^other\s+/i, "")) : text;

export const htsProductName = (element: HtsElement, parents: HtsElement[], max = 70) => {
  const own = withoutOther(cleanDescription(element.description));
  if (!isFragment(own)) return shorten(own, max);

  // The nearest parent whose lead clause names the product. "Other wooden furniture" does
  // once "Other" goes; a 4-digit heading always does, even "Parts and accessories of…"
  const head = [...parents]
    .reverse()
    .map((p) => {
      const lead = withoutOther(cleanDescription(p.description.split(/[:;]/)[0]));
      return { lead, isHeading: p.indent === "0" };
    })
    .find(({ lead, isHeading }) => isHeading || !isFragment(lead))?.lead;
  if (!head) return shorten(own, max);

  // A short qualifier ("Of cotton") adds to the name; a long or generic one ("Other") doesn't
  const qualifier =
    own.length <= 30 && !/^(other|parts|thereof|articles)/i.test(own)
      ? `${own.charAt(0).toLowerCase()}${own.slice(1)}`
      : "";
  const room = qualifier ? max - qualifier.length - 2 : max;
  const shortHead = shorten(head, Math.max(room, 20));
  return qualifier ? `${shortHead}, ${qualifier}` : shortHead;
};

// "Apr 10, 2026"
export const formatSummaryDate = (isoDate: IsoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const joinList = (items: string[]) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

// A product name inside a sentence: "wine", "t-shirts"; names led by an acronym ("LED lamps")
// keep their capitals
export const inSentence = (name: string) =>
  /^[A-Z][a-z]/.test(name) ? `${name.charAt(0).toLowerCase()}${name.slice(1)}` : name;

// One sentence a reader (or an AI answer) can lift whole: what the goods pay from one country
export const dutyAnswerSentence = ({
  productName,
  htsno,
  row,
  asOf,
}: {
  productName: string;
  htsno: string;
  row: CountryDuty;
  asOf: IsoDate;
}) => {
  const subject = `As of ${formatSummaryDate(asOf)}, US imports of ${inSentence(productName)} (HTS ${htsno}) from ${row.country.name}`;
  const base = row.baseRate === "Free" ? "a duty-free base rate" : `the ${row.baseRate} base rate`;
  const extras = joinList(row.additional.map((a) => `${a.program} (${formatDutyPct(a.ratePct)})`));

  if (!row.additional.length) {
    return `${subject} pay ${base}, with no additional tariffs.`;
  }
  if (row.totalPct === null) {
    return `${subject} pay ${base} plus ${formatDutyPct(row.additionalPct)} in additional tariffs: ${extras}.`;
  }
  return `${subject} pay ${formatDutyPct(row.totalPct)} in duties: ${base} plus ${extras}.`;
};

// The lowest total among the rows: "16.5%, from Germany, Japan and 6 more"
export const lowestTotal = (rows: CountryDuty[]) => {
  const priced = rows.filter((r) => r.totalPct !== null);
  if (!priced.length) return null;
  const lowest = Math.min(...priced.map((r) => r.totalPct as number));
  const countries = priced.filter((r) => r.totalPct === lowest).map((r) => r.country.name);
  const named = countries.length > 3 ? [...countries.slice(0, 2), `${countries.length - 2} more`] : countries;
  return { pct: lowest, countries, label: `${formatDutyPct(lowest)}, from ${joinList(named)}` };
};
