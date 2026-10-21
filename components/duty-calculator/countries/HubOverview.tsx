import { StackedBar } from "@/components/ui/charts/StackedBar";
import { CountUp } from "@/components/ui/marketing";
import { ERROR_MARK, NEUTRAL_FILL, rampColor } from "@/components/ui/theme";
import * as mk from "@/components/ui/marketing/styles";
import type { HubSummary } from "@/libs/country-pages/allCountries";

// The hub at a glance: four counts (HubStats, in the hero) and one bar showing how all countries
// split by the most their goods face (HubOverview, beside the key facts).

export function HubStats({ summary }: { summary: HubSummary }) {
  const stats = [
    { value: summary.forcedLabor.count, label: "Forced-labor tariff", note: "Section 301, since July 24, 2026", tone: "text-rose-600" },
    {
      value: summary.countrySpecific.length + summary.column2.length,
      label: "Own tariffs or Column 2 Rates",
      note: [...summary.countrySpecific.map((r) => r.name), ...summary.column2].join(", "),
      tone: "text-slate-900",
    },
    { value: summary.withPreferences, label: "Trade agreements", note: "Agreements and preference programs", tone: "text-teal-700" },
    { value: summary.none.length, label: "No added tariff", note: "Base rate and Section 232 only", tone: "text-emerald-600" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
      {stats.map((s) => (
        <div key={s.label} className={`${mk.card} flex min-w-0 flex-col p-5`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</div>
          <CountUp to={s.value} className={`mt-2 text-4xl font-bold tracking-tight sm:text-5xl ${s.tone}`} />
          <div className="mt-1.5 wrap-break-word text-sm text-slate-500">{s.note}</div>
        </div>
      ))}
    </div>
  );
}

// Tier colors from the theme, in the bar's order: own tariffs in the error color, the
// forced-labor tiers one hue from dark to light as the rate falls (a sequential ramp), and "no
// added tariff" neutral

export function HubOverview({ summary, tiers }: { summary: HubSummary; tiers: { label: string; count: number }[] }) {
  const shown = tiers.filter((t) => t.count > 0);
  const forcedTiers = shown.filter((t) => t.label !== "No added tariff" && !t.label.startsWith("Own"));
  const parts = shown.map((t) => ({
    ...t,
    color: t.label === "No added tariff" ? NEUTRAL_FILL : t.label.startsWith("Own") ? ERROR_MARK : rampColor(forcedTiers.indexOf(t), forcedTiers.length),
  }));
  const total = parts.reduce((sum, p) => sum + p.count, 0);
  const share = (n: number) => `${Math.round((n / total) * 1000) / 10}%`;
  const countries = (n: number) => `${n} ${n === 1 ? "country" : "countries"}`;

  return (
    <div className={`${mk.card} flex flex-col gap-5 p-6 sm:p-8`}>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">All {summary.total} countries by the most their goods face</h2>
      {total > 0 && (
        <>
          <StackedBar
            parts={parts.map((p) => ({ label: p.label, amount: p.count, color: p.color }))}
            formatValue={countries}
            size="md"
            shape="pill"
            legend={false}
          />
          <ul className="flex flex-col divide-y divide-slate-100 text-sm tabular-nums">
            {parts.map((p) => (
              <li key={p.label} className="flex items-center gap-3 py-2.5">
                <span className="h-3 w-3 shrink-0 rounded-xs" style={{ background: p.color }} aria-hidden />
                <span className="min-w-0 flex-1 text-slate-700">{p.label}</span>
                <span className="font-semibold text-slate-900">{countries(p.count)}</span>
                <span className="w-12 text-right text-slate-500">{share(p.count)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
