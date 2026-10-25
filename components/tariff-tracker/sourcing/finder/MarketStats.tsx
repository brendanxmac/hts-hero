"use client";

import { useState } from "react";
import { Sparkline } from "@/components/ui/charts/kit";
import { StatStrip } from "@/components/ui/StatStrip";
import { SERIES_COLORS } from "@/components/ui/theme";
import { CENSUS_NOTICE } from "@/components/duty-calculator/lib/census";
import { Countries } from "@/constants/countries";
import type { TradeData } from "@/libs/sourcing/trade";
import { ConfidenceBadge, focus, share, usd, usdThousands } from "./bits";
import { ChartDialog, DataTable, ExpandButton, LineChart, PairedBars } from "./ChartDialog";
import { CapacityFile, CapacityEntry, SourcingRow } from "./model";
import { caseEvents, longRun, usConfidence } from "./coverage";
import type { AdcvdCase } from "./useSourcing";

// The market for this code at a glance, before any ranking: what the US imports of it and how
// that's moving, who supplies most of it, how many countries supply it, and the world trade in it.
// Each opens its full chart and the table behind it.

// "Up 14% on the year before" / "Down 3%…"
const change = (now: number, before: number, since: string) => {
  if (!(before > 0)) return now > 0 ? `New ${since}` : "";
  const pct = Math.round((now / before - 1) * 100);
  return pct === 0 ? `Flat ${since}` : `${pct > 0 ? "Up" : "Down"} ${Math.abs(pct)}% ${since}`;
};
const pctChange = (now: number, before: number) => (before > 0 ? `${now >= before ? "+" : "−"}${Math.abs(Math.round((now / before - 1) * 100))}%` : now > 0 ? "new" : "—");

const nameOf = (iso: string) => {
  const c = Countries.find((x) => x.code === iso);
  return c ? `${c.flag} ${c.name}` : iso;
};
const plainName = (iso: string) => Countries.find((x) => x.code === iso)?.name ?? iso;

// "2024-03" → "Mar 2024"
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

// Countries charted month by month
const LINES = 5;
// Countries in the month-by-month table
const TABLE_COUNTRIES = 8;

type Open = "imports" | "suppliers" | "world" | null;

export const MarketStats = ({
  trade,
  capacity,
  rows,
  cases,
}: {
  trade: TradeData | null;
  capacity: { file: CapacityFile; entry: CapacityEntry | null } | null;
  rows: SourcingRow[];
  // The AD/CVD cases on this product, marked on the monthly chart
  cases: AdcvdCase[];
}) => {
  const [open, setOpen] = useState<Open>(null);
  const total = trade?.total;
  const suppliers = rows.filter((r) => (r.us?.value ?? 0) > 0).sort((a, b) => (b.us?.value ?? 0) - (a.us?.value ?? 0));
  const top = suppliers[0];
  const topThree = suppliers.slice(0, 3).reduce((sum, r) => sum + (r.us?.share ?? 0), 0);
  const world = capacity?.entry;
  // World trade data comes at 6 digits: the code's whole group ("2903.44"), every product in it
  const group = trade ? `${trade.code.slice(0, 4)}.${trade.code.slice(4, 6)}` : "the 6-digit group";
  const months = trade?.months ?? [];
  const period = months.length ? `${months[months.length - 12] ?? months[0]} to ${months[months.length - 1]}` : "";
  const levelText = trade?.level === "HS6" ? " (every code in the 6-digit subheading)" : trade?.level === "HS8" ? " (every code under the first 8 digits)" : "";
  const census = `U.S. Census Bureau, general imports${levelText}${period ? `, ${period}` : ""}. ${CENSUS_NOTICE}`;
  const censusMonthly = `U.S. Census Bureau, general imports${levelText}${months.length ? `, ${months[0]} to ${months[months.length - 1]}` : ""}. ${CENSUS_NOTICE}`;
  const atlas = `Harvard Growth Lab, Atlas of Economic Complexity (HS 2022, the 6-digit subheading), ${capacity?.file.years[0] ?? ""}–${capacity?.file.year ?? ""}, CC0.`;

  const events = caseEvents(cases, months);
  const confidence = usConfidence(trade);
  // A long fall over the three years says more than the last year alone (HFC-125: down 77%)
  const [firstYear, lastYear] = total ? longRun(total.monthly) : [0, 0];
  const fell = firstYear > 0 && lastYear < firstYear * 0.5;
  const firstPeriod = months.length >= 12 ? `${monthLabel(months[0])}–${monthLabel(months[11])}` : "";
  // Countries by all 36 months, not only the last 12: a supplier that stopped still shows
  const byAllMonths = Object.entries(trade?.countries ?? {})
    .map(([iso, c]) => ({ iso, c, sum: c.monthly.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.sum - a.sum);
  const importsTable: DataTable = {
    columns: ["Month", "All countries", ...byAllMonths.slice(0, TABLE_COUNTRIES).map((x) => plainName(x.iso))],
    rows: months
      .map((m, i) => [monthLabel(m), usd(total?.monthly[i] ?? 0), ...byAllMonths.slice(0, TABLE_COUNTRIES).map((x) => (x.c.monthly[i] ? usd(x.c.monthly[i]) : "—"))])
      .reverse(),
  };
  // Every country that shipped in either 12 months
  const supplierRows = Object.entries(trade?.countries ?? {})
    .filter(([, c]) => c.last.value > 0 || c.prior > 0)
    .sort((a, b) => b[1].last.value - a[1].last.value || b[1].prior - a[1].prior);
  const suppliersTable: DataTable = {
    columns: ["Country", "Last 12 months", "12 months before", "Change", "Share of US imports"],
    rows: supplierRows.map(([iso, c]) => [plainName(iso), usd(c.last.value), c.prior > 0 ? usd(c.prior) : "—", pctChange(c.last.value, c.prior), total?.last.value ? share(c.last.value / total.last.value) : "—"]),
  };
  const worldTable: DataTable = {
    columns: ["Country", `${capacity?.file.year ?? ""} exports`, `${capacity?.file.prior ?? ""} exports`, "Change", "Share of world exports", "Export Focus"],
    rows: (world?.c ?? []).map(([iso, now, before, rca]) => [plainName(iso), usdThousands(now), before > 0 ? usdThousands(before) : "—", pctChange(now, before), share(world!.w ? now / world!.w : 0), focus(rca)]),
  };

  return (
    <>
      <StatStrip
        label="The market for this product"
        stats={[
          {
            label: "US Imports of This Product",
            value: total ? usd(total.last.value) : "—",
            note: total
              ? fell
                ? `Last 12 months · down ${Math.round((1 - lastYear / firstYear) * 100)}% on ${firstPeriod}`
                : `Last 12 months · ${change(total.last.value, total.prior, "on the year before").toLowerCase()}`
              : "No Census figures for this code",
            extra: total ? (
              <div className="flex flex-col gap-2">
                <span>
                  <ConfidenceBadge confidence={confidence} />
                </span>
                {total.monthly.some((v) => v > 0) && <Sparkline points={total.monthly.map((y, x) => ({ x, y }))} color="var(--color-primary)" height={28} label="US imports by month" />}
                <ExpandButton onClick={() => setOpen("imports")} />
              </div>
            ) : undefined,
            info: `By month over the last 36 months. ${census}`,
          },
          {
            label: "Top Supplier on Record",
            value: top ? `${top.country.flag} ${top.country.name}` : "—",
            note: top?.us
              ? confidence.level === "good"
                ? `${share(top.us.share)} of US imports of it · ${change(top.us.value, top.us.prior, "on the year").toLowerCase()}`
                : `${share(top.us.share)}, but 1 of only ${confidence.countries} ${confidence.countries === 1 ? "country" : "countries"} on record`
              : "No supplier on record",
            extra: trade ? <ExpandButton onClick={() => setOpen("suppliers")} label="Every supplier" /> : undefined,
            info: census,
          },
          {
            label: "Countries on Record",
            value: suppliers.length.toLocaleString("en-US"),
            note: confidence.level === "thin" ? "Few: see what other sources say below" : suppliers.length ? `The top 3 supply ${share(topThree)}` : "Ship it to the US",
            extra: trade ? <ExpandButton onClick={() => setOpen("suppliers")} label="Every supplier" /> : undefined,
            info: `Countries the US imported it from in the last 12 months. ${census}`,
          },
          {
            label: `World Exports of ${group}`,
            value: world ? usdThousands(world.w) : "—",
            note: world ? `${capacity!.file.year} · ${change(world.w, world.wp, `since ${capacity!.file.prior}`).toLowerCase()}` : "No world figures for this subheading",
            extra: world ? (
              <div className="flex flex-col gap-2">
                {world.wy?.length > 1 && <Sparkline points={world.wy.map((y, i) => ({ x: capacity!.file.years[i], y }))} color="var(--color-primary)" height={28} label="World exports of this product by year" />}
                <ExpandButton onClick={() => setOpen("world")} />
              </div>
            ) : undefined,
            info: `Every country's exports of this product's 6-digit subheading to the world, each year ${capacity?.file.years[0] ?? ""} to ${capacity?.file.year ?? ""} (the Atlas's HS 2022 data starts in 2022). ${world ? `${world.n} countries export it above 1× Export Focus. ` : ""}Harvard Growth Lab, Atlas of Economic Complexity, CC0.`,
          },
        ]}
      />

      {trade && (
        <ChartDialog
          open={open === "imports"}
          onClose={() => setOpen(null)}
          title="US Imports of This Product, by Month"
          subtitle={`All countries and the ${LINES} largest suppliers over the last ${months.length} months (largest over the whole period, so a supplier that stopped still shows).${events.earlier.length ? ` AD/CVD orders on this product from before this chart: ${events.earlier.join("; ")}.` : ""}`}
          source={censusMonthly}
          chart={
            <LineChart
              label="US imports of this product by month"
              labels={months.map(monthLabel)}
              markers={events.markers}
              format={usd}
              series={[
                { name: "All countries", color: "var(--color-base-content)", values: total?.monthly ?? [] },
                ...byAllMonths.slice(0, LINES).map((x, i) => ({ name: plainName(x.iso), color: SERIES_COLORS[i % SERIES_COLORS.length], values: x.c.monthly })),
              ]}
            />
          }
          table={importsTable}
        />
      )}
      {trade && (
        <ChartDialog
          open={open === "suppliers"}
          onClose={() => setOpen(null)}
          title="Every US Supplier of This Product"
          subtitle="The last 12 months against the 12 before, including countries that stopped shipping it."
          source={`U.S. Census Bureau, general imports${levelText}${months.length >= 24 ? `, ${months[months.length - 24]} to ${months[months.length - 1]}` : ""}. ${CENSUS_NOTICE}`}
          chart={
            <PairedBars
              names={["Last 12 months", "12 months before"]}
              format={usd}
              rows={supplierRows.map(([iso, c]) => ({ key: iso, label: nameOf(iso), now: c.last.value, before: c.prior, note: `${pctChange(c.last.value, c.prior)} · was ${c.prior > 0 ? usd(c.prior) : "—"}` }))}
            />
          }
          table={suppliersTable}
        />
      )}
      {world && capacity && (
        <ChartDialog
          open={open === "world"}
          onClose={() => setOpen(null)}
          title={`World Exports of ${group}`}
          subtitle={`Every country's exports of the whole 6-digit group ${group} to all countries (world trade data comes no finer), ${capacity.file.years[0]}–${capacity.file.year}, and the largest exporters in ${capacity.file.year} against ${capacity.file.prior}.`}
          source={atlas}
          chart={
            <div className="flex flex-col gap-6">
              <LineChart label="World exports of this product by year" labels={capacity.file.years.map(String)} format={(v) => usdThousands(v)} height={220} series={[{ name: "World", color: "var(--color-primary)", values: world.wy ?? [] }]} />
              <PairedBars
                names={[String(capacity.file.year), String(capacity.file.prior)]}
                format={(v) => usdThousands(v)}
                rows={world.c.slice(0, 20).map(([iso, now, before, rca]) => ({ key: iso, label: nameOf(iso), now, before, note: `${pctChange(now, before)} · Export Focus ${focus(rca)}` }))}
              />
            </div>
          }
          table={worldTable}
        />
      )}
    </>
  );
};
