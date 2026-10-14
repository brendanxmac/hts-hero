// Which countries the US imports an HTS code from (Census general imports by HS10 and country):
// the shape of the chapter files in public/data/us-imports and how a code's figures are read
// from one. Plain, so both the calculator (usImports.ts) and server pages (the HTS code pages)
// use it. Where Census has no figures for the exact 10-digit line, its 8-digit, then 6-digit,
// family stands in (and says so).

export interface ChapterFile {
  year: number;
  prior: number;
  // code → [country, thousands of USD this year, the year before]
  codes: Record<string, [string, number, number][]>;
}

export interface UsImports {
  year: number;
  prior: number;
  // How exactly the figures match the code: its own line, or its 8- or 6-digit family
  level: 10 | 8 | 6;
  // By two-letter country code, in USD
  byCountry: Map<string, { value: number; prior: number }>;
  totalValue: number;
}

export const importsFrom = (file: ChapterFile, digits: string): UsImports | null => {
  for (const level of [10, 8, 6] as const) {
    const prefix = digits.slice(0, level);
    const rows = Object.entries(file.codes).filter(([code]) => (level === 10 ? code === prefix : code.startsWith(prefix)));
    if (!rows.length) continue;
    const byCountry = new Map<string, { value: number; prior: number }>();
    rows.forEach(([, list]) =>
      list.forEach(([iso, value, prior]) => {
        const sum = byCountry.get(iso) ?? { value: 0, prior: 0 };
        byCountry.set(iso, { value: sum.value + value * 1000, prior: sum.prior + prior * 1000 });
      })
    );
    const totalValue = Array.from(byCountry.values()).reduce((s, x) => s + x.value, 0);
    return { year: file.year, prior: file.prior, level, byCountry, totalValue };
  }
  return null;
};

// 617_312_000 → "$617M"; 1_250_000_000 → "$1.3B"; 84_000 → "$84K"
export const formatImportValue = (usd: number) =>
  usd >= 1e9 ? `$${(usd / 1e9).toFixed(1).replace(/\.0$/, "")}B` : usd >= 1e6 ? `$${Math.round(usd / 1e6)}M` : `$${Math.max(1, Math.round(usd / 1e3))}K`;
