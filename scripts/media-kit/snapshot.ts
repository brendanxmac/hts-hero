// Rebuilds the Search Console part of the media kit's snapshot (libs/media-kit/snapshot.json) from a
// folder of Search Console exports, the ones made for each SEO review (seo-data/<date>/):
//   overall/  Performance → Search results, last 3 months, Export → CSV (unzipped)
//   gen-ai/   the same, with the AI features filter on (optional)
// The audience block (Mixpanel) is kept as it is: update it by hand, or set up the live Mixpanel
// connection (libs/media-kit/mixpanel.ts) so the snapshot isn't needed.
//
//   npm run media-kit:snapshot -- seo-data/Nov16

import fs from "fs";
import path from "path";
import { groupRows, isBrandQuery, pageGroup, pathOf, shiftDay, toWeeks, totalsBetween } from "../../libs/media-kit/shape";
import type { MediaKitSnapshot, Row } from "../../libs/media-kit/types";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: npm run media-kit:snapshot -- <folder of Search Console exports>");
  process.exit(1);
}

// A small CSV reader: Search Console quotes fields that hold commas
const readCsv = (file: string): string[][] => {
  if (!fs.existsSync(file)) return [];
  const rows: string[][] = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean)) {
    const cells: string[] = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = !quoted;
      } else if (ch === "," && !quoted) {
        cells.push(cell);
        cell = "";
      } else cell += ch;
    }
    cells.push(cell);
    rows.push(cells);
  }
  return rows.slice(1);
};

const num = (s: string | undefined) => Number((s ?? "0").replace(/[%,]/g, "")) || 0;

const rowsOf = (file: string): Row[] =>
  readCsv(file).map(([label, clicks, impressions, , position]) => ({ label, clicks: num(clicks), impressions: num(impressions), position: num(position) }));

const overall = path.join(dir, "overall");
const days = readCsv(path.join(overall, "Chart.csv")).map(([date, clicks, impressions, , position]) => ({
  date,
  clicks: num(clicks),
  impressions: num(impressions),
  position: num(position),
}));
if (days.length === 0) {
  console.error(`No overall/Chart.csv in ${dir}`);
  process.exit(1);
}
const asOf = days[days.length - 1].date;

const pages = rowsOf(path.join(overall, "Pages.csv"));
const queries = rowsOf(path.join(overall, "Queries.csv"));

const aiDays = readCsv(path.join(dir, "gen-ai", "Chart.csv")).map(([date, impressions]) => ({ date, clicks: 0, impressions: num(impressions) }));
const aiWeeks = (() => {
  const first = aiDays.findIndex((d) => d.impressions > 0);
  return toWeeks(aiDays.slice(Math.max(first, 0)).map((d) => ({ ...d, clicks: 1 }))).map(({ week, impressions, partial }) => ({ week, impressions, ...(partial ? { partial } : {}) }));
})();

const file = path.join(__dirname, "../../libs/media-kit/snapshot.json");
const previous: MediaKitSnapshot | null = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;

const snapshot: MediaKitSnapshot = {
  search: {
    source: "snapshot",
    asOf,
    weekly: toWeeks(days),
    last28: totalsBetween(days, shiftDay(asOf, -27), asOf),
    prev28: totalsBetween(days, shiftDay(asOf, -55), shiftDay(asOf, -28)),
    // The exports cover 3 months, so these are over 3 months too
    breakdownPeriod: "the last 3 months",
    topQueries: queries.filter((q) => !isBrandQuery(q.label)).slice(0, 25),
    pageGroups: groupRows(pages, pageGroup),
    topPages: pages.slice(0, 15).map((p) => ({ ...p, label: pathOf(p.label) })),
    countries: rowsOf(path.join(overall, "Countries.csv")).slice(0, 12),
    devices: rowsOf(path.join(overall, "Devices.csv")),
    pagesCapped: pages.length >= 999,
  },
  ai: aiWeeks.length ? { source: "snapshot", asOf: aiDays[aiDays.length - 1].date, weekly: aiWeeks } : previous?.ai ?? null,
  audience: previous?.audience ?? { source: "snapshot", asOf, weekly: [], countries: [], countryBasis: "visitors" },
};

fs.writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Wrote ${path.relative(process.cwd(), file)}: Search Console data through ${asOf}, ${snapshot.search.weekly.length} weeks`);
