"use client";

import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import type { Confidence, UsConfidence } from "./coverage";
import { formatImportValue } from "@/components/duty-calculator/lib/usImports";
import { InfoTip } from "@/components/ui/InfoTip";
import * as tt from "@/components/ui/styles/tracker";
import type { SourcingFlag } from "@/libs/sourcing/flags";
import { formatRate } from "../../formatRate";
import { SCORE_NAMES, Scores, SourcingRow, transitOf } from "./model";

// The small pieces the Sourcing finder's modules share

// Never "$1K" for nothing (formatImportValue rounds anything small up to $1K)
export const usd = (v: number) => (v > 0 ? formatImportValue(v) : "$0");
// Atlas figures are in thousands of USD
export const usdThousands = (k: number) => usd(k * 1000);
export const share = (s: number) => (s >= 0.1 ? `${Math.round(s * 100)}%` : s >= 0.001 ? `${(s * 100).toFixed(1)}%` : "<0.1%");
export const rate = formatRate;
// Export Focus: revealed comparative advantage (RCA), shown as a multiple of the world average
// ("5.5×"), with two decimals near 1×, where above and below average meet
export const focus = (rca: number) => `${rca < 1.5 ? rca.toFixed(2) : rca < 10 ? rca.toFixed(1) : Math.round(rca)}×`;

// Export Focus in words
export const focusLevel = (rca: number) =>
  rca >= 3 ? "A core export" : rca >= 1 ? "Above the world average" : rca >= 0.5 ? "Below the world average" : "A minor export";

// What Export Focus means, behind an (i) wherever it's shown
export const FocusInfo = ({ className = "" }: { className?: string }) => (
  <InfoTip label="About Export Focus" className={className}>
    <span className="flex flex-col gap-2">
      <span>
        How much a country concentrates on making this product for export. 5× means it takes a five times bigger share of the country&apos;s exports than it does of world
        trade. Above 1× is above average; well above usually means established factories, suppliers and skills for it.
      </span>
      <span className="text-base-content/70">
        From exports to every market (Atlas of Economic Complexity, 2024), so trading hubs that re-export goods can score high too. Economists call it revealed comparative
        advantage (RCA).
      </span>
    </span>
  </InfoTip>
);

export { transitOf };

export const transitDays = (row: Pick<SourcingRow, "byLand" | "transit" | "us">) => {
  const { days } = transitOf(row);
  return days === null ? "—" : `~${days} days`;
};

export const CountryName = ({ row, strong = true }: { row: Pick<SourcingRow, "country">; strong?: boolean }) => (
  <span className={`inline-flex min-w-0 items-center gap-2 ${strong ? "font-semibold text-base-content" : ""}`}>
    <span aria-hidden className="shrink-0">
      {row.country.flag}
    </span>
    <span className="truncate">{row.country.name}</span>
  </span>
);

// Up or down, as a percent, green for growth (more supply), quiet for a fall
export const Growth = ({ value }: { value: number | null | undefined }) => {
  if (value === null || value === undefined) return <span className="text-base-content/60">new</span>;
  const Icon = value >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  return (
    <span className={`inline-flex items-center gap-0.5 tabular-nums ${value >= 0 ? "text-success" : "text-base-content/60"}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {value >= 9 ? `${Math.round(value + 1)}×` : `${Math.round(Math.abs(value) * 100)}%`}
    </span>
  );
};

export const FLAG_TONES: Record<SourcingFlag["tone"], "error" | "warning" | "neutral"> = { error: "error", warning: "warning", info: "neutral" };

export const FlagChips = ({ flags, max = 3 }: { flags: SourcingFlag[]; max?: number }) =>
  flags.length ? (
    <span className="flex flex-wrap gap-1">
      {flags.slice(0, max).map((f) => (
        <span key={f.id} className={`${tt.chip(FLAG_TONES[f.tone])} block max-w-full truncate`} title={f.detail}>
          {f.label}
        </span>
      ))}
      {flags.length > max && <span className={tt.chip("neutral")}>+{flags.length - max}</span>}
    </span>
  ) : null;

// Where the figures before it come from, as small links after a sentence: "Census · Atlas 2024"
export const SOURCE_URLS = {
  census: "https://www.census.gov/foreign-trade/data/index.html",
  atlas: "https://doi.org/10.7910/DVN/FTUUJU",
  adcvd: "https://access.trade.gov/ADCVD_Search.aspx",
} as const;
export const Sources = ({ items }: { items: { label: string; url: string }[] }) => (
  <span className="whitespace-nowrap text-xs text-base-content/50">
    {" "}
    [
    {items.map((s, i) => (
      <span key={s.label}>
        {i > 0 && " · "}
        <a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
          {s.label}
        </a>
      </span>
    ))}
    ]
  </span>
);

// How far to lean on the US figures beside it (coverage.ts usConfidence), with why on hover
const CONFIDENCE_LOOK: Record<Confidence, { label: string; tone: "success" | "neutral" | "warning" }> = {
  good: { label: "Good US data", tone: "success" },
  limited: { label: "Limited US data", tone: "neutral" },
  thin: { label: "Thin US data", tone: "warning" },
};
export const ConfidenceBadge = ({ confidence }: { confidence: UsConfidence }) => {
  const look = CONFIDENCE_LOOK[confidence.level];
  const why = `${confidence.countries} ${confidence.countries === 1 ? "country" : "countries"}, ${usd(confidence.value)} and shipments in ${confidence.months} of the last 12 months on record with US Census for this code.`;
  return (
    <span className={`${tt.chip(look.tone)} gap-1`} title={`${why} ${confidence.level === "good" ? "Enough to lean on." : "Read the US figures with care, and check the other sources on the page."}`}>
      {confidence.level !== "good" && <ExclamationTriangleIcon className="h-3 w-3" aria-hidden />}
      {look.label}
    </span>
  );
};

// The four metrics' scores as short bars
export const ScoreBars = ({ scores, compact = false }: { scores: Scores; compact?: boolean }) => (
  <dl className={`m-0 grid ${compact ? "grid-cols-4 gap-2" : "grid-cols-2 gap-x-4 gap-y-2"}`}>
    {(Object.keys(SCORE_NAMES) as (keyof Scores)[]).map((k) => (
      <div key={k} className="flex min-w-0 flex-col gap-1">
        <dt className="flex items-baseline justify-between gap-2 text-xs text-base-content/60">
          {SCORE_NAMES[k]}
          {!compact && <span className="tabular-nums text-base-content/80">{Math.round(scores[k])}</span>}
        </dt>
        <dd className="m-0 h-1.5 overflow-hidden rounded-full bg-tt-soft" title={`${SCORE_NAMES[k]}: ${Math.round(scores[k])} of 100`}>
          <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(2, scores[k])}%` }} />
        </dd>
      </div>
    ))}
  </dl>
);

// Each of the four metrics for a country card: the one the cards are ranked by first (feature),
// larger, with its fuller story; then the other three as compact rows. Each shows its figure, what
// that figure is, and its score out of 100 as a bar.
const ScoreBar = ({ score, label }: { score: number; label: string }) => (
  <span className="flex items-center gap-1.5" title={`${label} score: ${score} of 100`}>
    <span className="h-1.5 w-full overflow-hidden rounded-full bg-base-content/10">
      <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(2, score)}%` }} />
    </span>
    <span className="w-6 shrink-0 text-right text-[11px] font-semibold tabular-nums text-base-content/70">{score}</span>
  </span>
);

export const MetricTiles = ({ row, highlight, feature }: { row: SourcingRow; highlight: keyof Scores; feature: { label: string; value: string; note: string } }) => {
  const g = row.governance;
  const { mode } = transitOf(row);
  const parts: { key: keyof Scores; value: string; note: string }[] = [
    {
      key: "capacity",
      value: row.world ? usdThousands(row.world.exports) : row.us ? usd(row.us.value) : "—",
      note: row.world ? `${row.world.group} exports, all countries · #${row.world.rank}` : row.us ? "US imports of this code" : "Not an exporter",
    },
    {
      key: "reliability",
      value: g?.rl !== undefined ? `${g.rl}/100` : "—",
      note: `Rule of law${row.flags.length ? ` · ${row.flags.length} flag${row.flags.length === 1 ? "" : "s"}` : " · no flags"}`,
    },
    { key: "speed", value: transitDays(row), note: mode.split(" (")[0].split(",")[0] },
    { key: "cost", value: rate(row.landedPct), note: row.dutyNote ?? `${rate(row.dutyPct)} duty + ${row.byLand ? "land freight" : `${rate(row.freightUsed)} freight`}` },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      <dl className="m-0 flex flex-col gap-1 rounded-xl bg-primary/10 px-3 py-2.5 ring-1 ring-inset ring-primary/25">
        <dt className="truncate text-[11px] font-semibold uppercase tracking-wide text-primary" title={feature.label}>
          {SCORE_NAMES[highlight]} · {feature.label}
        </dt>
        <dd className={`${tt.metricSm} m-0`}>{feature.value}</dd>
        <dd className="m-0 line-clamp-2 text-xs leading-snug text-base-content/70" title={feature.note}>
          {feature.note}
        </dd>
        <dd className="m-0">
          <ScoreBar score={Math.round(row.scores[highlight])} label={SCORE_NAMES[highlight]} />
        </dd>
      </dl>
      <dl className="m-0 flex flex-col divide-y divide-base-300">
        {parts
          .filter((p) => p.key !== highlight)
          .map((p) => (
            <div key={p.key} className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-3 py-1.5">
              <span className="flex min-w-0 flex-col">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-base-content/60">{SCORE_NAMES[p.key]}</dt>
                <dd className="m-0 truncate text-sm font-semibold tabular-nums text-base-content" title={`${p.value} · ${p.note}`}>
                  {p.value} <span className="text-xs font-normal text-base-content/60">{p.note}</span>
                </dd>
              </span>
              <dd className="m-0">
                <ScoreBar score={Math.round(row.scores[p.key])} label={SCORE_NAMES[p.key]} />
              </dd>
            </div>
          ))}
      </dl>
    </div>
  );
};

// The score itself, in a ring
export const ScoreRing = ({ score, size = 52 }: { score: number; size?: number }) => {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} aria-label={`Score ${score} of 100`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} className="stroke-base-300" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} strokeLinecap="round" stroke="var(--color-primary)" strokeDasharray={`${(score / 100) * c} ${c}`} />
      </svg>
      <span className={`${tt.display} absolute text-base font-semibold tabular-nums text-base-content`}>{score}</span>
    </span>
  );
};
