import { Countries } from "@/constants/countries";
import { AllRules } from "@/tariffs/engine-v2/data";
import { HtsRevisions, getLatestVerifiedRevision, getRevision, getVerifiedRange } from "@/tariffs/engine-v2/revisions";
import { ChangelogEntry } from "@/libs/supabase/tariff-changelog";

// The numbers the monitoring page quotes, computed from the tariff engine at build time so they
// never go stale or overclaim.

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export interface MonitorFacts {
  year: number;
  // HTS revisions USITC has published this year, the Basic Edition included
  revisionsThisYear: number;
  latestRevisionTitle: string;
  latestRevisionFrom: string;
  // Chapter 99 headings the engine models
  chapter99Headings: number;
  countries: number;
  verifiedFrom: string;
}

export const monitorFacts = (): MonitorFacts => {
  const latest = getLatestVerifiedRevision();
  const year = Number(latest.from.slice(0, 4));
  return {
    year,
    revisionsThisYear: HtsRevisions.filter((r) => r.name.startsWith(String(year))).length,
    latestRevisionTitle: latest.title,
    latestRevisionFrom: longDate(latest.from),
    chapter99Headings: new Set(AllRules.tariffs.map((t) => t.code)).size,
    // Origins only: the US itself isn't one (matches the countries hub)
    countries: Countries.filter((c) => c.code !== "US").length,
    verifiedFrom: longDate(getVerifiedRange().from),
  };
};

export interface CaughtChange {
  id: string;
  // When the revision took effect
  date: string;
  revision: string;
  summary: string;
}

// The verified data note that opens every revision entry ("Verified tariff data now covers
// entries through …") is about the calculator, so the page keeps only what changed
const VERIFIED_NOTE = /^Verified tariff data now covers entries [^.]+\.\s*/;

// The latest HTS revisions from the changelog, as the changes a tracked catalog was alerted to
export const caughtChanges = (entries: ChangelogEntry[], limit: number): CaughtChange[] =>
  entries
    .filter((e) => e.type === "revision" && e.revision)
    .map((e) => {
      const revision = getRevision(e.revision!);
      return {
        id: e.id,
        date: revision ? longDate(revision.from) : longDate(e.entry_date),
        revision: revision?.title ?? e.title,
        summary: e.summary.replace(VERIFIED_NOTE, "").trim(),
      };
    })
    .filter((c) => c.summary.length > 0)
    .slice(0, limit);
