import { CountUp } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import type { AlertExample } from "@/libs/tariff-alerts-example";

// Why now, in real numbers: what the tariff feed counted, and a real action on an example product
// (the same one as /tariff-alerts). Rate changes in %. A number too small to matter is left out.

const percent = (n: number) => `${n % 1 === 0 ? n : n.toFixed(1)}%`;

export const NumbersBand = ({ recent, upcoming, recentDays, upcomingDays, example }: { recent: number; upcoming: number; recentDays: number; upcomingDays: number; example: AlertExample | null }) => {
  const row = example?.rows[0];
  const stats = [
    recent >= 3 && { n: recent, label: `new US tariff actions in the last ${recentDays} days` },
    upcoming >= 3 && { n: upcoming, label: `tariff changes taking effect in the next ${upcomingDays} days` },
  ].filter((s): s is { n: number; label: string } => !!s);

  return (
    <section className={`${mk.bandDark} border-t border-base-content/10 py-16 sm:py-20`} aria-labelledby="numbers-title">
      <div className={mk.container}>
        <h2 id="numbers-title" className={`${mk.h2Dark} max-w-3xl`}>
          Tariffs Keep Moving. <span className="text-primary">Your Costs Move With Them.</span>
        </h2>
        <div className={`mt-12 grid grid-cols-1 gap-8 ${stats.length > 1 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {stats.map((s) => (
            <div key={s.label} className="border-l-2 border-primary/60 pl-5">
              <CountUp to={s.n} className="block text-6xl font-semibold tabular-nums tracking-tight text-base-content [font-family:var(--font-tracker-display)] sm:text-7xl" />
              <p className={`${mk.body} mt-2`}>{s.label}</p>
            </div>
          ))}
          {row && example && (
            <div className="border-l-2 border-error/70 pl-5">
              <p className="text-6xl font-semibold tabular-nums tracking-tight text-error [font-family:var(--font-tracker-display)] sm:text-7xl">
                +{percent(Math.round((row.afterPct - row.beforePct) * 10) / 10)}
              </p>
              <p className={`${mk.body} mt-2`}>
                on {row.name.toLowerCase()} from {row.country} under {example.program}: {percent(row.beforePct)} → {percent(row.afterPct)}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
