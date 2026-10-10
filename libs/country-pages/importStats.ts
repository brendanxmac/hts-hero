import stats from "./import-stats.json";

// What the US imports from a country, from the Census Bureau's trade-in-goods figures
// (import-stats.json, refreshed by `npm run sync-country-imports`). Values are millions of USD.

interface CountryStats {
  name: string;
  imports2024: number | null;
  imports2025: number | null;
  importsYtd: number | null;
  importsYtdPriorYear: number | null;
  rank2025?: number;
}

export const IMPORT_SOURCE = stats.source;

export interface ImportFacts {
  imports2025: number;
  imports2024: number | null;
  rank2025: number;
  // Share of all US goods imports in 2025, in percent
  sharePct: number;
  // This year so far, and the change on the same months of last year
  ytd: { year: number; months: number; through: string; imports: number; changePct: number | null } | null;
}

export const importFacts = (code: string): ImportFacts | null => {
  const c = (stats.countries as Record<string, CountryStats>)[code];
  if (!c?.imports2025 || !c.rank2025 || !stats.world.imports2025) return null;
  const ytd =
    c.importsYtd && stats.ytd.months > 0
      ? {
          year: stats.ytd.year,
          months: stats.ytd.months,
          through: stats.ytd.through,
          imports: c.importsYtd,
          changePct: c.importsYtdPriorYear
            ? Math.round(((c.importsYtd - c.importsYtdPriorYear) / c.importsYtdPriorYear) * 1000) / 10
            : null,
        }
      : null;
  return {
    imports2025: c.imports2025,
    imports2024: c.imports2024,
    rank2025: c.rank2025,
    sharePct: Math.round((c.imports2025 / stats.world.imports2025) * 1000) / 10,
    ytd,
  };
};

// 438,947.2 (millions) → "$438.9 billion"; 812.4 → "$812 million"
export const formatImports = (millions: number) =>
  millions >= 1000
    ? `$${(millions / 1000).toLocaleString("en-US", { maximumFractionDigits: millions >= 100000 ? 0 : 1 })} billion`
    : `$${Math.round(millions).toLocaleString("en-US")} million`;

// 1 → "largest", 2 → "2nd-largest", 23 → "23rd-largest"
export const largestOrdinal = (rank: number) => {
  if (rank === 1) return "largest";
  const suffix = rank % 100 >= 11 && rank % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[rank % 10] ?? "th";
  return `${rank}${suffix}-largest`;
};
