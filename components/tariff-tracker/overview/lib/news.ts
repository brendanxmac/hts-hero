import { AllRules } from "../../../../tariffs/engine-v2/data";
import { addDays } from "../../../../tariffs/engine-v2/history";
import { getVerifiedRevisions } from "../../../../tariffs/engine-v2/revisions";
import { IsoDate } from "../../../../tariffs/engine-v2/types";
import { shortProgram } from "../../report";

// The tariff news tape: tariffs added or ended in the last four months or coming in the next
// four, from the tariff data itself, and the latest HTS revisions. Coming ones first, then newest.

export interface NewsItem {
  date: IsoDate;
  tag: string;
  text: string;
  tone: "error" | "success" | "warning" | "primary";
}

const WINDOW_DAYS = 120;

const programName = (id: string) => shortProgram(AllRules.programs.find((p) => p.id === id)?.name ?? id);

export const tariffNews = (today: IsoDate, limit = 8): NewsItem[] => {
  const since = addDays(today, -WINDOW_DAYS);
  // Far-off scheduled ends (a safeguard ending in 2030) aren't news yet
  const until = addDays(today, WINDOW_DAYS);
  const groups = new Map<string, { date: IsoDate; program: string; kind: "start" | "end"; headings: number }>();
  AllRules.tariffs.forEach((t) => {
    (["start", "end"] as const).forEach((kind) => {
      const date = kind === "start" ? t.effective.from : t.effective.to;
      if (!date || date <= since || date > until) return;
      const key = `${t.program}|${kind}|${date}`;
      const g = groups.get(key) ?? { date, program: t.program, kind, headings: 0 };
      g.headings += 1;
      groups.set(key, g);
    });
  });
  const items: NewsItem[] = Array.from(groups.values()).map((g) => {
    const name = programName(g.program);
    const upcoming = g.date > today;
    const one = g.headings === 1;
    const headings = `${g.headings} ${one ? "heading" : "headings"}`;
    return g.kind === "start"
      ? { date: g.date, tag: upcoming ? `${name}, coming` : name, text: `${headings} ${upcoming ? (one ? "takes" : "take") : "took"} effect`, tone: upcoming ? "warning" : "error" }
      : { date: g.date, tag: name, text: `${headings} ${upcoming ? (one ? "ends" : "end") : "ended"}`, tone: "success" };
  });
  getVerifiedRevisions()
    .filter((r) => r.from > since)
    .forEach((r) => items.push({ date: r.from, tag: `HTS ${r.title}`, text: "in effect", tone: "primary" }));
  return items
    .sort((a, b) => Number(b.date > today) - Number(a.date > today) || b.date.localeCompare(a.date))
    .slice(0, limit);
};
