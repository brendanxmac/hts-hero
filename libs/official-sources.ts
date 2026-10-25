import type { IsoDate, Source } from "../tariffs/engine-v2/types";
import { AllRules } from "../tariffs/engine-v2/data";
import { isEffectiveOn } from "../tariffs/engine-v2/dates";
import { usitcHtsFileRestStopUrl } from "./usitc-hts-file-url";

// The primary sources the public pages cite: the USITC's schedule, the legal documents behind each
// Chapter 99 heading (proclamations, executive orders, Federal Register notices, CBP's CSMS
// messages, from the engine's data), CBP's rulings and Census trade data. Links go straight to
// the publisher, so readers (and search engines) can check every figure against the official text.

export interface OfficialSource {
  publisher: string; // "USITC", "Federal Register", "CBP"
  label: string;
  url?: string; // absent when the engine has a citation but no link for it yet
}

export const USITC_HTS_URL = "https://hts.usitc.gov/";
export const CENSUS_TRADE_DATA_URL = "https://www.census.gov/foreign-trade/data/index.html";

// The line in the official schedule, on the USITC's HTS search
export const htsEntryUrl = (htsno: string) => `https://hts.usitc.gov/search?query=${encodeURIComponent(htsno)}`;

// The chapter's PDF, straight from the USITC (it carries the section notes for a section's first chapter)
export const htsChapterPdfUrl = (chapter: number) => usitcHtsFileRestStopUrl(`Chapter ${chapter}`);

// The trade agreements and preference programs behind each line's Special rate
export const HTS_GENERAL_NOTE_3_URL = usitcHtsFileRestStopUrl("General Note 3");

// Customs fees: the rules (19 CFR 24.23 and 24.24) and the fiscal year's adjusted amounts
export const MPF_REGULATION_URL = "https://www.ecfr.gov/current/title-19/chapter-I/part-24/section-24.23";
export const HMF_REGULATION_URL = "https://www.ecfr.gov/current/title-19/chapter-I/part-24/section-24.24";
export const FEES_NOTICE_URL = AllRules.fees.find((f) => f.source?.url)?.source?.url;

// Refunds: the IEEPA decision, CBP's refund guidance, and the statutes for protests (19 U.S.C.
// 1514), drawback (1313) and prior disclosure (1592), on govinfo.gov
export const SCOTUS_IEEPA_OPINION_URL = "https://www.supremecourt.gov/opinions/25pdf/24-1287_4gcj.pdf";
export const CBP_IEEPA_REFUNDS_URL = "https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds";
const USCODE_19 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4";
export const PROTEST_STATUTE_URL = `${USCODE_19}-subtitleIII-partIII-sec1514.htm`;
export const DRAWBACK_STATUTE_URL = `${USCODE_19}-subtitleII-partI-sec1313.htm`;
export const PENALTIES_STATUTE_URL = `${USCODE_19}-subtitleIII-partV-sec1592.htm`;

// A revision's change record on the USITC, e.g. "2026HTSRev11"
export const htsChangeRecordUrl = (release: string) =>
  `https://hts.usitc.gov/reststop/file?release=${encodeURIComponent(release)}&filename=Change%20Record`;

export const cbpRulingsUrl = (htsno: string) => `https://rulings.cbp.gov/search?term=${encodeURIComponent(htsno)}`;

// Federal Register pages for proclamations the engine cites without a link (the same documents
// the blog posts cite). Move these into the engine's sources as headings are next revised.
const PROCLAMATION_URLS: Record<string, string> = {
  "10984": "https://www.federalregister.gov/documents/2025/10/22/2025-19639/adjusting-imports-of-medium--and-heavy-duty-vehicles-medium--and-heavy-duty-vehicle-parts-and-buses",
  "11020": "https://www.federalregister.gov/documents/2026/04/09/2026-06956/adjusting-imports-of-pharmaceuticals-and-pharmaceutical-ingredients-into-the-united-states",
  "11032": "https://www.federalregister.gov/documents/2026/06/04/2026-11314/further-adjusting-the-tariff-regimes-for-imports-of-aluminum-steel-and-copper-into-the-united-states",
  "11046": "https://www.federalregister.gov/documents/2026/07/23/2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united",
  "11047": "https://www.federalregister.gov/documents/2026/07/23/2026-14992/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united",
  "11048": "https://www.federalregister.gov/documents/2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united",
  "11051": "https://www.federalregister.gov/documents/2026/08/05/2026-15975/to-facilitate-positive-adjustment-to-competition-from-imports-of-quartz-surface-products",
  "11055": "https://www.federalregister.gov/documents/2026/08/19/2026-16979/adjusting-imports-of-unmanned-aircraft-systems-and-unmanned-aircraft-systems-components-into-the",
  "11056": "https://www.federalregister.gov/documents/2026/08/24/2026-17294/temporary-suspension-of-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of",
  "11059": "https://www.federalregister.gov/documents/2026/08/31/2026-17842/further-ensuring-affordable-beef-for-the-american-consumer",
  "11064": "https://www.federalregister.gov/documents/2026/09/14/2026-18838/modifying-the-scope-of-products-of-canada-subject-to-the-additional-duties-imposed-to-offset",
  "11065": "https://www.federalregister.gov/documents/2026/09/14/2026-18839/modifying-the-scope-of-products-of-canada-subject-to-the-additional-duties-imposed-to-offset",
};

// Links for a citation the engine has no URL for: each proclamation it names, an FR document
// number ("FR Doc. 2024-21217"), or an FR page citation ("90 FR 27851")
const citationLinks = (citation: string): { label: string; url: string }[] => {
  const proclamations = Array.from(citation.matchAll(/\b(1\d{4})\b/g), (m) => m[1]).filter((n) => PROCLAMATION_URLS[n]);
  if (/proclamation/i.test(citation) && proclamations.length > 0)
    return Array.from(new Set(proclamations), (n) => ({ label: `Proclamation ${n}`, url: PROCLAMATION_URLS[n] }));
  const doc = citation.match(/FR Doc\.? (\d{4}-\d{4,6})/);
  if (doc) return [{ label: citation, url: `https://www.federalregister.gov/d/${doc[1]}` }];
  const page = citation.match(/\b(\d{2}) FR (\d{3,6})\b/);
  if (page) return [{ label: citation, url: `https://www.federalregister.gov/citation/${page[1]}-FR-${page[2]}` }];
  return [];
};

// "Federal Register" for federalregister.gov and govinfo.gov's FR pages, and so on
export const publisherOf = (url?: string, citation = "") => {
  if (!url) {
    if (/CSMS/i.test(citation)) return "CBP";
    if (/proclamation|\bEO\b|executive order/i.test(citation)) return "The White House";
    if (/\bFR\b/.test(citation)) return "Federal Register";
    if (/U\.S\. note/i.test(citation)) return "USITC";
    return "Official source";
  }
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host === "federalregister.gov" || (host === "govinfo.gov" && url.includes("/FR-"))) return "Federal Register";
  if (host === "govinfo.gov") return "GovInfo";
  if (host === "whitehouse.gov") return "The White House";
  if (host.endsWith("cbp.gov") || host === "content.govdelivery.com") return "CBP";
  if (host === "ustr.gov") return "USTR";
  if (host.endsWith("usitc.gov")) return "USITC";
  if (host.endsWith("trade.gov") || host === "commerce.gov") return "Department of Commerce";
  return host;
};

// A source as one entry per document: its own link, else the documents its citation names, else
// the citation as text
const toOfficial = (source: Source, fallback: string): OfficialSource[] => {
  if (source.url) {
    const label = source.citation ?? fallback;
    return [{ publisher: publisherOf(source.url, label), label, url: source.url }];
  }
  if (!source.citation) return [];
  const links = citationLinks(source.citation);
  return links.length > 0
    ? links.map((l) => ({ publisher: publisherOf(l.url), label: l.label, url: l.url }))
    : [{ publisher: publisherOf(undefined, source.citation), label: source.citation }];
};

// The legal documents behind a Chapter 99 heading in force on the date (or its latest record)
export const headingSources = (code: string, asOf: IsoDate): OfficialSource[] => {
  const records = AllRules.tariffs.filter((t) => t.code === code && t.source && (t.source.url || t.source.citation));
  const record = records.find((t) => isEffectiveOn(t.effective, asOf)) ?? records[records.length - 1];
  return record?.source ? toOfficial(record.source, `HTS heading ${code}`) : [];
};

// One key per document: its Federal Register document number when the link carries one, as
// govinfo.gov and federalregister.gov link the same notice under different URLs
const documentKey = (o: OfficialSource) => o.url?.match(/\b(\d{4}-\d{4,6})(?:\.htm|\/|$)/)?.[1] ?? o.url ?? o.label;

// The documents behind a set of records, once each, for citing next to a row that summarizes them
export const sourceDocuments = (sources: (Source | undefined)[]): OfficialSource[] => {
  const seen = new Set<string>();
  return sources
    .flatMap((s) => (s ? toOfficial(s, "Official notice") : []))
    .filter((o) => {
      const key = documentKey(o);
      return !seen.has(key) && !!seen.add(key);
    });
};

// "9903.01.25" for one heading, "9903.05.29 and 2 more" past three
const headingList = (codes: string[]) => (codes.length <= 3 ? codes.join(", ") : `${codes[0]} and ${codes.length - 1} more`);

// One entry per document behind the Chapter 99 duties given, labeled with the headings it covers
export const legalSources = (duties: { code: string; program: string; source?: Source }[]): OfficialSource[] => {
  const byKey = new Map<string, { source: Source; program: string; codes: string[] }>();
  for (const duty of duties) {
    const key = duty.source?.url ?? duty.source?.citation;
    if (!duty.source || !key) continue;
    const entry = byKey.get(key);
    if (entry) {
      if (!entry.codes.includes(duty.code)) entry.codes.push(duty.code);
    } else byKey.set(key, { source: duty.source, program: duty.program, codes: [duty.code] });
  }
  const seen = new Set<string>();
  return Array.from(byKey.values()).flatMap(({ source, program, codes }) =>
    toOfficial(source, program)
      .filter((o) => !o.url || (!seen.has(documentKey(o)) && !!seen.add(documentKey(o))))
      .map((o) => ({ ...o, label: `${program} (${headingList(codes)}): ${o.label}` })),
  );
};
