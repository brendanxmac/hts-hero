import { createPublicClient } from "@/app/api/supabase/server";
import { AllRules } from "@/tariffs/engine-v2/data";
import { getRulesAsOf } from "@/tariffs/engine-v2/snapshot";
import type { IsoDate } from "@/tariffs/engine-v2/types";
import { dottedCode } from "@/libs/adcvd/format";
import { sourceDocuments, type OfficialSource } from "@/libs/official-sources";
import type { PublicUpdate } from "@/libs/tariff-updates/public";
import revisions from "@/tariffs/engine-v2/data/hts-revisions.json";
import { headingProfile, longDate, type HeadingProfile } from "./heading";

// /tariffs/section-301-exclusions: the USTR product exclusions from the Section 301 China duties,
// from the engine's records for 9903.88.69 (U.S. note 20(vvv)) and 9903.88.70 (20(www)). Every
// code, date, count and rate on the page comes from here; nothing is typed by hand.

export const EXCLUSION_HEADINGS = ["9903.88.69", "9903.88.70"] as const;

// 20(vvv)(iii)–(iv): numbers whose exclusion covers only a product "described in" them. Every
// 9903.88.70 exclusion is one (the heading asks to confirm the goods for all of its codes).
const DESCRIBED_LIST = "china301ExclusionDescribedProducts20vvv";

export const EXCLUSIONS_PATH = "/tariffs/section-301-exclusions";

export interface ExclusionRow {
  // Dotted HTS code, as the note lists it ("8483.50.90.40")
  code: string;
  heading: string;
  // Only the product described in the note, part of the line
  described: boolean;
}

export interface ExtensionStep {
  // The day this text took effect for entries; absent for the data's first record
  from?: IsoDate;
  // The last day of entries it covered (the record ends the next day)
  through: IsoDate;
  // "January 9, 2027", as the heading's text says it
  textDate: string | null;
  headings: string[];
  // The HTS revision the first record was read from ("Revision 30 (2025)")
  revision: string | null;
  sources: OfficialSource[];
}

export interface OverriddenHeading {
  code: string;
  name: string;
  rate: string;
  // Which exclusion headings it gives way to
  exceptedBy: string[];
}

export interface ExclusionsPage {
  asOf: IsoDate;
  headings: HeadingProfile[];
  rows: ExclusionRow[];
  // The last day of entries the exclusions in force cover, null when none is in force
  through: IsoDate | null;
  // The first day they no longer apply
  endsOn: IsoDate | null;
  // The number of exclusions USTR extended, as the in-force record's source note gives it
  exclusionCount: number | null;
  overridden: OverriddenHeading[];
  history: ExtensionStep[];
  sources: OfficialSource[];
}

const addDays = (iso: IsoDate, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const revisionTitle = (name?: string) =>
  (revisions as { name: string; title: string }[]).find((r) => r.name === name)?.title ?? null;

const THROUGH = /through ([A-Z][a-z]+ \d{1,2}, \d{4})/;

export const exclusionsPage = (today: IsoDate = new Date().toISOString().slice(0, 10)): ExclusionsPage => {
  const headings = EXCLUSION_HEADINGS.map((c) => headingProfile(c, today)).filter((p): p is HeadingProfile => !!p);
  const snapshot = getRulesAsOf(AllRules, today);
  const described = new Set(Array.from(snapshot.lists.get(DESCRIBED_LIST) ?? []).map(dottedCode));

  const rows: ExclusionRow[] = headings
    .filter((p) => p.status === "in-force")
    .flatMap((p) =>
      p.coverage.codes.map((code) => ({
        code,
        heading: p.code,
        described: p.code === "9903.88.70" || described.has(code),
      }))
    )
    .sort((a, b) => a.code.localeCompare(b.code) || a.heading.localeCompare(b.heading));

  const inForce = headings.filter((p) => p.status === "in-force");
  const endsOn = inForce.map((p) => p.endsOn).filter((d): d is IsoDate => !!d).sort()[0] ?? null;

  const current = AllRules.tariffs.find((t) => t.code === "9903.88.69" && inForce.some((p) => p.code === t.code) && (!t.effective.from || t.effective.from <= today) && (!t.effective.to || t.effective.to > today));
  const count = current?.source.note?.match(/(\d+) exclusions/)?.[1];

  const overridden: OverriddenHeading[] = snapshot.tariffs
    .filter((t) => !EXCLUSION_HEADINGS.includes(t.code as (typeof EXCLUSION_HEADINGS)[number]))
    .map((t) => ({ t, by: EXCLUSION_HEADINGS.filter((c) => (t.exceptions ?? []).includes(c)) }))
    .filter(({ by }) => by.length > 0)
    .map(({ t, by }) => {
      const p = headingProfile(t.code, today);
      return { code: t.code, name: t.name, rate: p?.rate ?? "", exceptedBy: [...by] };
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  // Each version of the two headings' text, merged when both changed on the same dates
  const records = AllRules.tariffs
    .filter((t) => EXCLUSION_HEADINGS.includes(t.code as (typeof EXCLUSION_HEADINGS)[number]) && t.effective.to)
    .sort((a, b) => (a.effective.to ?? "").localeCompare(b.effective.to ?? ""));
  const firstFrom = new Map<string, IsoDate | undefined>();
  for (const c of EXCLUSION_HEADINGS) firstFrom.set(c, records.find((t) => t.code === c)?.effective.from);
  const history: ExtensionStep[] = [];
  for (const t of records) {
    const isFirst = firstFrom.get(t.code) === t.effective.from;
    const from = isFirst ? undefined : t.effective.from;
    const through = addDays(t.effective.to!, -1);
    const step = history.find((s) => s.through === through && s.from === from);
    if (step) {
      step.headings.push(t.code);
      if (!isFirst) step.sources = [...step.sources, ...sourceDocuments([t.source])].filter(
        (s, i, all) => all.findIndex((o) => o.label === s.label) === i
      );
      continue;
    }
    history.push({
      from,
      through,
      textDate: t.description.match(THROUGH)?.[1] ?? null,
      headings: [t.code],
      revision: isFirst ? revisionTitle(t.source.revision) : null,
      // The first record's text is the HTS revision's; its source cites the notice that later changed it
      sources: isFirst ? [] : sourceDocuments([t.source]),
    });
  }
  history.sort((a, b) => b.through.localeCompare(a.through));

  return {
    asOf: today,
    headings,
    rows,
    through: endsOn ? addDays(endsOn, -1) : null,
    endsOn,
    exclusionCount: count ? Number(count) : null,
    overridden,
    history,
    sources: sourceDocuments(
      AllRules.tariffs.filter((t) => inForce.some((p) => p.code === t.code) && (!t.effective.to || t.effective.to > today) && (!t.effective.from || t.effective.from <= today)).map((t) => t.source)
    ),
  };
};

// "20(vvv)": the U.S. note subdivision a heading's text points to
export const noteOf = (p: Pick<HeadingProfile, "legalText">) => p.legalText.match(/U\.S\. note (20\([a-z]+\))/)?.[1] ?? null;

const listAnd = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

const countOf = (page: ExclusionsPage) => new Set(page.rows.map((r) => r.code)).size;

// The answer the page leads with
export const exclusionsLead = (page: ExclusionsPage) => {
  const codes = countOf(page);
  if (!page.through || codes === 0)
    return `No Section 301 China product exclusions are in force on ${longDate(page.asOf)}: headings ${EXCLUSION_HEADINGS.join(" and ")} no longer apply to goods entered now.`;
  const count = page.exclusionCount ? `${page.exclusionCount} ` : "";
  return `${count}USTR product exclusions from the Section 301 duties on goods from China are in force on ${longDate(page.asOf)} and apply to goods entered through ${longDate(page.through)}, covering ${codes} HTS codes under headings ${page.headings.filter((p) => p.status === "in-force").map((p) => p.code).join(" and ")}.`;
};

// The page's questions, shown in its FAQ and FAQPage schema (which must match what's visible)
export const exclusionFaqs = (page: ExclusionsPage): [string, string][] => {
  const inForce = page.headings.filter((p) => p.status === "in-force");
  const codes = countOf(page);
  const described = page.rows.filter((r) => r.described).length;
  const count = page.exclusionCount ? `${page.exclusionCount} ` : "";
  const extensions = page.history.filter((s) => s.from).sort((a, b) => a.through.localeCompare(b.through));
  const firstText = page.history.find((s) => !s.from)?.textDate;
  const switchedOff = page.overridden.map((o) => `${o.code} (${o.name.replace(/^Section 301 China: /, "")}, ${o.rate})`);
  const faqs: [string, string][] = [];
  if (page.through && page.endsOn) {
    faqs.push([
      "When do the Section 301 exclusions expire?",
      `The ${count}exclusions under headings ${inForce.map((p) => p.code).join(" and ")} apply to goods of China entered through ${longDate(page.through)}, as the headings' text reads on ${longDate(page.asOf)}. Goods entered on or after ${longDate(page.endsOn)} no longer qualify unless USTR extends them again.`,
    ]);
  }
  if (extensions.length > 0) {
    faqs.push([
      "Have the Section 301 exclusions been extended?",
      `Yes. Our tariff data records ${extensions.length} extension${extensions.length === 1 ? "" : "s"}${firstText ? ` since the text read "through ${firstText}"` : ""}: ${extensions
        .map((s) => `from ${longDate(s.from!)}, the exclusions run through ${s.textDate ?? longDate(s.through)}${s.sources[0] ? ` (${s.sources[0].label})` : ""}`)
        .join("; ")}.`,
    ]);
  }
  if (codes > 0) {
    faqs.push([
      "Which HTS codes are covered by the Section 301 exclusions?",
      `${codes} HTS codes: ${inForce.map((p) => `${p.coverage.codes.length} under ${p.code}${noteOf(p) ? ` (U.S. note ${noteOf(p)})` : ""}`).join(" and ")}. For ${described} of them the exclusion covers only the product the note describes, which is part of the goods under that line. This page lists every code.`,
    ]);
  }
  faqs.push([
    "How do I claim a Section 301 exclusion?",
    `Report heading ${EXCLUSION_HEADINGS[0]} (or ${EXCLUSION_HEADINGS[1]} for the solar manufacturing equipment) with the product's HTS code on the entry. The Section 301 headings ${listAnd(page.overridden.map((o) => o.code))} apply "except as provided in" these headings, so goods entered under them don't owe that Section 301 duty. Where the exclusion covers a product described in the note, the goods must match that description, which the importer or their customs broker decides.`,
  ]);
  if (switchedOff.length > 0 && page.endsOn) {
    faqs.push([
      "What happens if the Section 301 exclusions expire?",
      `Goods entered on or after ${longDate(page.endsOn)} would owe the Section 301 duty of the heading that covers their HTS code again: ${listAnd(switchedOff)}. This page and the HTS Hero duty calculator follow the tariff data, so they show any further extension once it is published.`,
    ]);
  }
  return faqs;
};

// The published /tariff-updates about these exclusions: updates naming either heading, plus
// Section 301 exclusion updates that name only the product codes. Never throws: the page renders
// without them.
export const getExclusionUpdates = async (): Promise<PublicUpdate[]> => {
  const headings = `{${EXCLUSION_HEADINGS.map((c) => `"${c}"`).join(",")}}`;
  const { data, error } = await createPublicClient()
    .from("tariff_updates")
    .select("slug, title, summary, kind, authority, countries, hts_codes, products, effective_on, stage, first_seen_at, last_activity_at")
    .eq("status", "published")
    .or(`hts_codes.ov.${headings},scope_headings.ov.${headings},and(kind.eq.exclusion,title.ilike.*301*)`)
    .order("first_seen_at", { ascending: false })
    .limit(20);
  if (error) {
    console.error("Loading Section 301 exclusion updates:", error.message);
    return [];
  }
  return (data ?? []) as PublicUpdate[];
};
