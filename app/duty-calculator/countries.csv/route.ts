import { countryRows } from "@/libs/country-pages/allCountries";

// /duty-calculator/countries.csv: the tariffs-by-country table as a file, for spreadsheets,
// researchers and AI tools. Same rows as the hub page; rebuilt daily.
export const revalidate = 86400;

const cell = (value: string | number | null) => {
  const text = value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function GET() {
  const asOf = new Date().toISOString().slice(0, 10);
  const header = [
    "Country",
    "ISO code",
    "US imports 2025 (USD millions)",
    "Import rank 2025",
    "Section 301 forced-labor tariff",
    "Other country tariffs",
    "Column 2 rates",
    "Own Section 232 rates (headings)",
    "Trade agreements",
    "As of",
  ];
  const lines = countryRows(asOf)
    .sort((a, b) => (b.imports2025 ?? -1) - (a.imports2025 ?? -1))
    .map((r) =>
      [
        r.name,
        r.code,
        r.imports2025,
        r.rank2025,
        r.forcedLabor ?? "None",
        r.otherTariffs.map((t) => `${t.name}: ${t.rates} on ${t.allProducts ? "all products" : "listed products"}`).join("; ") || "None",
        r.column2 ? "Yes" : "No",
        r.dealRates,
        r.preferences.join("; ") || "None",
        asOf,
      ]
        .map(cell)
        .join(",")
    );
  const body = [header.join(","), ...lines].join("\n") + "\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `inline; filename="us-tariffs-by-country-${asOf}.csv"`,
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
