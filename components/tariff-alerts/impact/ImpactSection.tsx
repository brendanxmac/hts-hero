import { EntryCta } from "@/components/onboarding/EntryCta";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as cta from "@/components/ui/marketing/cta";
import { SectionIntro, Reveal } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { mono } from "@/components/ui/font";
import type { AlertExample } from "@/libs/tariff-alerts-example";

// "See the Impact": what an alert opens on, at its simplest: each affected import and how much its
// duty went up, from the same engine-backed example as the hero. Rates in %, never dollars.

const pct = (n: number) => `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}%`;

// The impact as a marketing picture, not a table: import cards floating on the background, each
// with its name big, its rate before → after, and how much it changed in a badge: red up, green down
const Changes = ({ example }: { example: AlertExample }) => {
  // A few that went up, then the ones that came down
  const rows = [...example.rows.filter((r) => r.afterPct > r.beforePct).slice(0, 3), ...example.relief];
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* A soft glow behind the cards */}
      <div className="absolute inset-x-0 -inset-y-8 -z-10 rounded-[48px] sm:-inset-8 bg-linear-to-br from-error/15 via-primary/10 to-transparent blur-3xl" aria-hidden />
      <div>
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const change = Math.round((r.afterPct - r.beforePct) * 10) / 10;
            const up = change > 0;
            return (
              <li
                key={`${r.htsno}-${r.country}`}
                className="flex items-center gap-4 rounded-2xl bg-base-100 p-4 shadow-xl shadow-base-content/10 ring-1 ring-base-content/10 sm:px-5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-semibold text-base-content [font-family:var(--font-tracker-display)]">{r.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-base-content/60">
                    <span className="font-semibold tabular-nums text-base-content/80">
                      {pct(r.beforePct)} → {pct(r.afterPct)}
                    </span>
                    <span className="text-base-content/30">·</span>
                    <span className={`${mono.className} whitespace-nowrap text-xs`}>{r.htsno}</span>
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-2xl font-bold tabular-nums shadow-lg [font-family:var(--font-tracker-display)] ${up ? "bg-error text-error-content shadow-error/25" : "bg-success text-success-content shadow-success/25"
                    }`}
                >
                  {up ? "+" : "−"}
                  {pct(Math.abs(change))}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export const ImpactSection = ({ example }: { example: AlertExample | null }) => (
  <section id="impact" className={mk.band} aria-labelledby="impact-title">
    <div className={`${mk.container} grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20`}>
      <div>
        <SectionIntro eyebrow="" title="See How New Tariffs Affect Your Products" id="impact-title">
          A tariff headline doesn&apos;t always tell you what you&apos;ll pay. We instantly show you how it affects your products, without tab switching and spreadsheet craziness.
        </SectionIntro>
        <div className="mt-10">
          <EntryCta page="tariff-alerts" entry="alerts_page" section="impact" label="Get Started" className={cta.buttonPrimarySm}>
            Get Started <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </EntryCta>
        </div>
      </div>
      {example && (
        <Reveal>
          <Changes example={example} />
        </Reveal>
      )}
    </div>
  </section>
);
