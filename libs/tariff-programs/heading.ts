import { AllRules } from "@/tariffs/engine-v2/data";
import { getRulesAsOf } from "@/tariffs/engine-v2/snapshot";
import { isEffectiveOn } from "@/tariffs/engine-v2/dates";
import type { CountrySelector, IsoDate, ListRef, RuleSnapshot, Tariff } from "@/tariffs/engine-v2/types";
import { Countries } from "@/constants/countries";
import { dottedCode } from "@/libs/adcvd/format";
import { CBP_IEEPA_REFUNDS_URL, SCOTUS_IEEPA_OPINION_URL, sourceDocuments, type OfficialSource } from "@/libs/official-sources";
import firstSeen from "@/tariffs/engine-v2/data/ch99-first-seen.json";
import revisions from "@/tariffs/engine-v2/data/hts-revisions.json";
import { hubForProgram, type ProgramHub } from "./hubs";

// What a Chapter 99 heading is, from the engine's records: its program, rate, whether it's in force
// and since when, the countries and HTS codes it covers, the headings that override it, its legal
// sources and its history. The /hts/9903.xx.xx pages and the /tariffs program pages are built on it.

export type HeadingStatus = "in-force" | "ended" | "scheduled";

export interface HeadingVersion {
  from?: IsoDate;
  // The first day it no longer applied (exclusive)
  to?: IsoDate;
  rate: string;
  sources: OfficialSource[];
}

export interface HeadingProfile {
  code: string;
  name: string;
  program: { id: string; name: string; authority: string };
  hub: ProgramHub | null;
  status: HeadingStatus;
  // The record the page describes: today's, else the last one (ended) or the next one (scheduled)
  asOf: IsoDate;
  // "+25%", "0% (exempt)", "Up to 15%, including the base rate"
  rate: string;
  // The rate's percentage: the added duty, or the total it tops up to (`rateKind` says which)
  ratePct: number | null;
  rateKind: "adValorem" | "free" | "topUpTo" | "other";
  // "on the value of the steel content"; null when it's the full customs value
  basis: string | null;
  // Applies only when the importer confirms a fact or claims a program
  conditional: boolean;
  // Start of the unbroken run of versions (absent when the data starts before tracking)
  startedOn?: IsoDate;
  // First day it no longer applies, when it has ended or is scheduled to end
  endsOn?: IsoDate;
  // The first HTS revision whose Chapter 99 lists it
  firstRevision: { name: string; title: string; from: IsoDate } | null;
  countries: { all: boolean; names: string[]; except: string[] };
  coverage: {
    all: boolean;
    // Covered codes as dotted HTS prefixes, sorted ("7208", "7326.90.86")
    codes: string[];
    excluded: string[];
  };
  // Headings that take precedence over this one (it doesn't apply when they do)
  exceptions: string[];
  // The program's other headings on the same date
  siblings: { code: string; name: string }[];
  legalText: string;
  sources: OfficialSource[];
  history: HeadingVersion[];
  refund: { text: string; links: { label: string; url: string }[] } | null;
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: IsoDate, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const formatPct = (n: number) => `${Number(n.toFixed(2))}%`;

const countryName = (code: string) => Countries.find((c) => c.code === code)?.name ?? code;

const isListRef = (v: string | ListRef): v is ListRef => typeof v === "object" && v !== null && "list" in v;

// Every country a selector names, resolving lists ("eu-members") on the date
const countryCodes = (selector: CountrySelector | (string | ListRef)[] | undefined, snapshot: RuleSnapshot): string[] => {
  if (!selector || selector === "all") return [];
  return Array.from(
    new Set(selector.flatMap((entry) => (isListRef(entry) ? Array.from(snapshot.lists.get(entry.list) ?? []) : [entry])))
  );
};

// Every HTS prefix a selector names on the date, dotted and sorted
const codePrefixes = (selector: "all" | (string | ListRef)[] | undefined, snapshot: RuleSnapshot): string[] => {
  if (!selector || selector === "all") return [];
  const digits = new Set<string>();
  for (const entry of selector) {
    if (isListRef(entry)) snapshot.lists.get(entry.list)?.forEach((d) => digits.add(d));
    else digits.add(entry.replace(/\D/g, ""));
  }
  return Array.from(digits)
    .filter((d) => d.length >= 2)
    .sort()
    .map(dottedCode);
};

const BASIS: Record<string, string> = {
  metalContent: "on the value of the metal content",
  metalContentCovered: "on the value of the metal content",
  metalContentInChapters: "on the value of the metal content",
  usContentPortion: "on the value of the non-US content",
};

export const describeRate = (t: Tariff) => {
  const pct = Number(t.rate.pct);
  if (t.rate.kind === "free") return "0% (no added duty)";
  if (t.rate.kind === "topUpTo") return `Up to ${formatPct(pct)}, including the base rate`;
  if (t.rate.kind === "adValorem") return pct === 0 ? "0% (no added duty)" : `+${formatPct(pct)}`;
  return "See the legal text";
};

const versionsOf = (code: string) =>
  AllRules.tariffs
    .filter((t) => t.code === code)
    .sort((a, b) => (a.effective.from ?? "").localeCompare(b.effective.from ?? ""));

export const isModeledHeading = (code: string) => AllRules.tariffs.some((t) => t.code === code);

// The record on `today`, else the latest ended one, else the next scheduled one
const pickRecord = (versions: Tariff[], today: IsoDate): { record: Tariff; status: HeadingStatus; asOf: IsoDate } | null => {
  const current = versions.find((t) => isEffectiveOn(t.effective, today));
  if (current) return { record: current, status: "in-force", asOf: today };
  const past = versions.filter((t) => t.effective.to && t.effective.to <= today);
  if (past.length > 0) {
    const record = past[past.length - 1];
    return { record, status: "ended", asOf: addDays(record.effective.to!, -1) };
  }
  const next = versions.find((t) => t.effective.from && t.effective.from > today);
  return next ? { record: next, status: "scheduled", asOf: next.effective.from! } : null;
};

// The start of the unbroken run of versions that includes `record`
const runStart = (versions: Tariff[], record: Tariff) => {
  let current: Tariff | undefined = record;
  while (current?.effective.from) {
    const from: string = current.effective.from;
    const previous = versions.find((t) => t.effective.to === from);
    if (!previous) break;
    current = previous;
  }
  return current?.effective.from;
};

const revisionInfo = (name?: string) => {
  const rev = (revisions as { name: string; title: string; from: string }[]).find((r) => r.name === name);
  return rev ? { name: rev.name, title: rev.title, from: rev.from } : null;
};

// Refund status, for duties struck down in court. Only IEEPA so far (REFUNDS.md); the wording is
// "may qualify", and the importer's broker files the claim.
const refundFor = (authority: string): HeadingProfile["refund"] =>
  authority === "IEEPA"
    ? {
        text:
          "The Supreme Court held on February 20, 2026 that IEEPA does not authorize tariffs, and IEEPA duties ended for goods entered on or after February 24, 2026. CBP has been refunding IEEPA duties, with interest, through ACE since April 20, 2026. Importers who paid this duty may qualify for a refund; which entries qualify depends on their liquidation status, and the importer's customs broker files the claim.",
        links: [
          { label: "Supreme Court opinion (Learning Resources v. Trump)", url: SCOTUS_IEEPA_OPINION_URL },
          { label: "CBP: IEEPA duty refunds", url: CBP_IEEPA_REFUNDS_URL },
        ],
      }
    : null;

export const headingProfile = (code: string, today: IsoDate = todayIso()): HeadingProfile | null => {
  const versions = versionsOf(code);
  const picked = pickRecord(versions, today);
  if (!picked) return null;
  const { record, status, asOf } = picked;
  const snapshot = getRulesAsOf(AllRules, asOf);
  const program = AllRules.programs.find((p) => p.id === record.program);
  const authority = program?.authority ?? "other";
  const all = record.scope.countries === "all";
  const first = (firstSeen as { headings: Record<string, { first: string }> }).headings[code];

  return {
    code,
    name: record.name,
    program: { id: record.program, name: program?.name ?? record.program, authority },
    hub: hubForProgram(record.program),
    status,
    asOf,
    rate: describeRate(record),
    ratePct: record.rate.kind === "adValorem" || record.rate.kind === "topUpTo" ? Number(record.rate.pct) : record.rate.kind === "free" ? 0 : null,
    rateKind: (["adValorem", "free", "topUpTo"].includes(record.rate.kind) ? record.rate.kind : "other") as HeadingProfile["rateKind"],
    basis: record.basis ? BASIS[record.basis.kind] ?? null : null,
    conditional: (record.requires ?? []).some((c) => ["answer", "preferenceClaimed", "inputCompare"].includes(c.kind)),
    startedOn: runStart(versions, record),
    endsOn: record.effective.to,
    firstRevision: revisionInfo(first?.first),
    countries: {
      all,
      names: countryCodes(record.scope.countries, snapshot).map(countryName).sort(),
      except: countryCodes(record.scope.excludeCountries, snapshot).map(countryName).sort(),
    },
    coverage: {
      all: record.scope.codes === "all",
      codes: codePrefixes(record.scope.codes, snapshot),
      excluded: codePrefixes(record.scope.excludeCodes, snapshot),
    },
    exceptions: (record.exceptions ?? []).filter((c) => c !== code),
    siblings: snapshot.tariffs
      .filter((t) => t.program === record.program && t.code !== code)
      .map((t) => ({ code: t.code, name: t.name }))
      .sort((a, b) => a.code.localeCompare(b.code)),
    legalText: record.description.trim(),
    sources: sourceDocuments([record.source]),
    history: versions.map((t) => ({
      from: t.effective.from,
      to: t.effective.to,
      rate: describeRate(t),
      sources: sourceDocuments([t.source]),
    })),
    refund: refundFor(authority),
  };
};

// "February 24, 2026"
export const longDate = (iso: IsoDate) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

// "all countries", "China", "China and Hong Kong", "27 countries"
export const countriesPhrase = (p: HeadingProfile) => {
  const { all, names, except } = p.countries;
  if (all) return except.length > 0 ? `goods from every country except ${listNames(except)}` : "goods from every country";
  if (names.length === 0) return "goods from the countries it names";
  return `goods from ${listNames(names)}`;
};

const listNames = (names: string[]) => {
  if (names.length > 6) return `${names.length} countries`;
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

// The answer sentence the page leads with: what the heading is, what it adds and where it stands
export const isExemption = (p: Pick<HeadingProfile, "rateKind" | "ratePct">) => p.rateKind === "free" || p.ratePct === 0;

// "in the 5,906 HTS codes it lists"
const scopePhrase = (p: HeadingProfile) =>
  p.coverage.all ? "" : ` in the ${p.coverage.codes.length.toLocaleString("en-US")} HTS code${p.coverage.codes.length === 1 ? "" : "s"} it lists`;

// The data's earliest revision: a heading first seen there was already in the HTS before tracking
export const EARLIEST_REVISION = (revisions as { name: string }[])[0]?.name;

// What the heading does, in the tense its status calls for: "adds 25% to the regular duty on goods
// from China in the 5,906 HTS codes it lists"
export const headingEffect = (p: HeadingProfile) => {
  const past = p.status === "ended";
  if (isExemption(p)) return `${past ? "meant" : "means"} no added ${p.program.name} duty for goods entered under it`;
  if (p.rateKind === "topUpTo")
    return `${past ? "brought" : "brings"} the duty on ${countriesPhrase(p)}${scopePhrase(p)} up to ${formatPct(p.ratePct ?? 0)}, including the base rate`;
  return `${past ? "added" : "adds"} ${p.rate.replace(/^\+/, "")}${p.basis ? ` ${p.basis}` : ""} to the regular duty on ${countriesPhrase(p)}${scopePhrase(p)}`;
};

// Where it stands: "It has been in force since July 24, 2026."
export const headingWhen = (p: HeadingProfile) => {
  const since = p.startedOn
    ? ` since ${longDate(p.startedOn)}`
    : p.firstRevision && p.firstRevision.name !== EARLIEST_REVISION
      ? `, and has been in the HTS since ${p.firstRevision.title}`
      : "";
  if (p.status === "in-force") {
    if (p.endsOn) return `It is in force${since} and ends for goods entered on or after ${longDate(p.endsOn)}.`;
    return p.startedOn ? `It has been in force${since}.` : `It is in force${since}.`;
  }
  if (p.status === "ended")
    return `It ended for goods entered on or after ${longDate(p.endsOn!)}${p.startedOn ? `, after applying from ${longDate(p.startedOn)}` : ""}.`;
  return `It takes effect for goods entered on or after ${longDate(p.startedOn ?? p.asOf)}.`;
};

// The answer the page leads with: what the heading is, what it does and where it stands
export const headingAnswer = (p: HeadingProfile) =>
  `HTS ${p.code}, "${p.name}", is a Chapter 99 heading under ${p.program.name}. It ${headingEffect(p)}. ${headingWhen(p)}`;

// When a heading started, for tables: its start date, else "Before 2025" when the HTS already had it
// when our data begins, else the revision that added it
export const sinceLabel = (p: HeadingProfile) =>
  p.startedOn
    ? longDate(p.startedOn)
    : p.firstRevision?.name === EARLIEST_REVISION
      ? "Before 2025"
      : p.firstRevision
        ? `In the HTS since ${p.firstRevision.title}`
        : "—";
