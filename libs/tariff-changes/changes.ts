import { AllRules } from "@/tariffs/engine-v2/data";
import { getRevisionForDate } from "@/tariffs/engine-v2/revisions";
import type { CodeList, IsoDate, RateRule, Tariff } from "@/tariffs/engine-v2/types";

// Every dated change to a Chapter 99 tariff in the engine's data, as rows for the "Latest US
// Tariff Changes" table. Built from the same records the calculator uses, so the table and the
// calculator can't disagree.

export type ChangeKind = "New tariff" | "Rate change" | "Coverage change" | "Terms updated" | "Ended";

export interface TariffChangeRow {
  date: IsoDate;
  heading: string;
  name: string;
  program: string;
  kind: ChangeKind;
  // "25%" → "50%", or a short description of what changed
  detail: string;
  // The HTS revision in force on the change's date
  revision?: string;
}

const programNames = new Map(AllRules.programs.map((p) => [p.id, p.name]));

export const describeRate = (rate: RateRule): string => {
  if (rate.kind === "free") return "Free";
  if (rate.kind === "adValorem") return `${rate.pct}%`;
  if (rate.kind === "topUpTo") return `Up to ${rate.pct}% total`;
  return "See heading";
};

const row = (tariff: Tariff, date: IsoDate, kind: ChangeKind, detail: string): TariffChangeRow => ({
  date,
  heading: tariff.code,
  name: tariff.name,
  program: programNames.get(tariff.program) ?? tariff.program,
  kind,
  detail,
  revision: getRevisionForDate(date)?.title,
});

// Two versions of a heading differ in their terms when anything other than dates and the rate changed
const termsKey = (t: Tariff) =>
  JSON.stringify({ scope: t.scope, requires: t.requires, exceptions: t.exceptions, basis: t.basis, rateByColumn: t.rateByColumn });

const tariffChanges = (since: IsoDate): TariffChangeRow[] => {
  const byCode = new Map<string, Tariff[]>();
  AllRules.tariffs.forEach((t) => byCode.set(t.code, [...(byCode.get(t.code) ?? []), t]));

  const rows: TariffChangeRow[] = [];
  byCode.forEach((versions) => {
    const sorted = [...versions].sort((a, b) => (a.effective.from ?? "").localeCompare(b.effective.from ?? ""));
    sorted.forEach((version, i) => {
      const from = version.effective.from;
      if (from && from >= since) {
        const prev = sorted[i - 1];
        const rate = describeRate(version.rate);
        if (!prev || prev.effective.to !== from) {
          rows.push(row(version, from, "New tariff", rate === "Free" ? "Exemption (free)" : rate));
        } else if (describeRate(prev.rate) !== rate) {
          rows.push(row(version, from, "Rate change", `${describeRate(prev.rate)} → ${rate}`));
        } else if (termsKey(prev) !== termsKey(version)) {
          rows.push(row(version, from, "Terms updated", "Products, countries or exemptions changed"));
        }
      }
      const to = version.effective.to;
      const next = sorted[i + 1];
      if (to && to >= since && next?.effective.from !== to) {
        const rate = describeRate(version.rate);
        rows.push(row(version, to, "Ended", rate === "Free" ? "Exemption ends" : `${rate} tariff ends`));
      }
    });
  });
  return rows;
};

// A product list growing or shrinking changes what a heading covers without touching the heading
const coverageChanges = (since: IsoDate): TariffChangeRow[] => {
  const listUsers = new Map<string, Tariff[]>();
  AllRules.tariffs.forEach((t) => {
    if (t.scope.codes === "all") return;
    JSON.stringify(t.scope.codes)
      .match(/"list":"([^"]+)"/g)
      ?.map((m) => m.slice(8, -1))
      .forEach((id) => listUsers.set(id, [...(listUsers.get(id) ?? []), t]));
  });

  const rows: TariffChangeRow[] = [];
  (AllRules.lists as CodeList[])
    .filter((list) => list.kind === "hts")
    .forEach((list) => {
      const versions = [...list.versions].sort((a, b) => (a.effective.from ?? "").localeCompare(b.effective.from ?? ""));
      versions.forEach((version, i) => {
        const from = version.effective.from;
        const prev = versions[i - 1];
        if (!from || from < since || !prev?.codes || !version.codes) return;
        const before = new Set(prev.codes);
        const after = new Set(version.codes);
        const added = version.codes.filter((c) => !before.has(c)).length;
        const removed = prev.codes.filter((c) => !after.has(c)).length;
        if (added + removed === 0) return;
        const parts = [added && `${added} added`, removed && `${removed} removed`].filter(Boolean).join(", ");
        // One row per list change, credited to the headings in force that day that use it
        const users = (listUsers.get(list.id) ?? []).filter(
          (t) => (!t.effective.from || t.effective.from <= from) && (!t.effective.to || from < t.effective.to)
        );
        const codes = Array.from(new Set(users.map((t) => t.code))).sort();
        if (codes.length === 0) return;
        rows.push({
          ...row(users[0], from, "Coverage change", `HTS codes covered: ${parts}`),
          heading: codes.length > 1 ? `${codes[0]} +${codes.length - 1}` : codes[0],
          // List descriptions are internal names, so shared lists are named for their program
          name: codes.length > 1 ? `${programNames.get(users[0].program) ?? users[0].program}: products covered` : users[0].name,
        });
      });
    });
  return rows;
};

// Newest first; within a day, by heading
export const getTariffChanges = (since: IsoDate = "2026-01-01"): TariffChangeRow[] => {
  const seen = new Set<string>();
  return [...tariffChanges(since), ...coverageChanges(since)]
    .filter((r) => {
      const key = `${r.date}|${r.heading}|${r.kind}|${r.detail}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.heading.localeCompare(b.heading));
};
