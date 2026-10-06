"use client";

import { useMemo, useState } from "react";
import { ChartCaption } from "@/components/duty-calculator/country-rate-charts/ChartCaption";
import { axis, figureCard } from "@/components/duty-calculator/country-rate-charts/scale";
import { formatDate } from "@/components/duty-calculator/lib/format";
import { useWidth } from "@/components/duty-calculator/rate-history/useWidth";
import * as ui from "@/components/ui/styles";
import { IsoDate } from "@/tariffs/engine-v2/types";
import { formatRate } from "../../formatRate";
import { OriginRate, RateBasis, rateKey, rateOf } from "./analysis";
import { OriginHistory, volatility, Volatility } from "./history";

// Cheap vs stable: every origin by its rate today (across) and how far its rate has swung since
// the verified data begins (up). The lines cross at the product's own origin, so each corner
// reads against yours; the corner that matters is cheaper and steadier. Origins on exactly the
// same spot share one mark, sized by how many.

const HEIGHT = 380;
const PAD = { left: 52, right: 28, top: 24, bottom: 40 };
const FLAG = 28;
// Zero sits this far inside the axes, so a mark at 0% or with no swing stays inside the plot
const INSET = 38;

interface Point {
  key: string;
  origins: OriginRate[];
  rate: number;
  swing: number;
  vol: Volatility;
}

const pileSize = (count: number) => Math.round(Math.min(72, 30 + 7 * Math.log2(count)));

export const CheapVsStable = ({
  rates,
  histories,
  ready,
  progress,
  basis,
  since,
  selected,
  onSelect,
}: {
  rates: OriginRate[];
  histories: Map<string, OriginHistory>;
  ready: boolean;
  progress: number;
  basis: RateBasis;
  since: IsoDate;
  selected: string | null;
  onSelect: (code: string) => void;
}) => {
  const { ref, width } = useWidth();
  const [hover, setHover] = useState<string | null>(null);

  const points = useMemo(() => {
    if (!ready) return [] as Point[];
    const groups = new Map<string, Point>();
    rates.forEach((o) => {
      const h = histories.get(o.country.code);
      if (!h) return;
      const vol = volatility(h, basis);
      const rate = rateKey(rateOf(o, basis));
      const swing = rateKey(vol.swing);
      // The product's own origin always has a mark of its own
      const key = o.isOrigin ? `you-${o.country.code}` : `${rate}|${swing}`;
      const group = groups.get(key) ?? { key, origins: [], rate, swing, vol };
      group.origins.push(o);
      groups.set(key, group);
    });
    return Array.from(groups.values());
  }, [ready, rates, histories, basis]);

  const yours = points.find((p) => p.origins.some((o) => o.isOrigin));
  const x = axis(Math.max(...points.map((p) => p.rate), 1));
  const y = axis(Math.max(...points.map((p) => p.swing), 5));
  const plotW = Math.max(width - PAD.left - PAD.right, 1);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const px = (v: number) => PAD.left + INSET + (v / x.top) * (plotW - INSET);
  const py = (v: number) => PAD.top + plotH - INSET - (v / y.top) * (plotH - INSET);

  const better = yours
    ? points.filter((p) => p !== yours && p.rate < yours.rate && p.swing <= yours.swing).reduce((n, p) => n + p.origins.length, 0)
    : 0;

  const quadrants = yours
    ? [
        { label: "Cheaper, steadier", x: PAD.left + 8, y: PAD.top + plotH - 8, anchor: "start", good: true },
        { label: "Cheaper, more volatile", x: PAD.left + 8, y: PAD.top + 14, anchor: "start" },
        { label: "Pricier, steadier", x: PAD.left + plotW - 8, y: PAD.top + plotH - 8, anchor: "end" },
        { label: "Pricier, more volatile", x: PAD.left + plotW - 8, y: PAD.top + 14, anchor: "end" },
      ]
    : [];

  return (
    <figure className={figureCard}>
      <ChartCaption title="Cheap vs stable">
        {ready && yours
          ? `${better} ${better === 1 ? "origin is" : "origins are"} cheaper than yours and at least as steady. Across: the rate today. Up: how far it has swung since ${formatDate(since)}.`
          : `Across: the rate today. Up: how far it has swung since ${formatDate(since)}.`}
      </ChartCaption>

      <div ref={ref} className="relative mt-4 select-none" style={{ height: HEIGHT }}>
        {!ready ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className={ui.caption}>Working out every origin&apos;s rate history…</span>
            <span className="h-1.5 w-48 overflow-hidden rounded-full bg-base-300">
              <span className="block h-full bg-primary" style={{ width: `${progress * 100}%` }} />
            </span>
          </div>
        ) : (
          width > 0 && (
            <>
              <svg className="absolute inset-0" width={width} height={HEIGHT} aria-hidden>
                {/* The corner that matters, tinted */}
                {yours && (
                  <rect
                    x={PAD.left}
                    y={py(yours.swing)}
                    width={Math.max(px(yours.rate) - PAD.left, 0)}
                    height={Math.max(PAD.top + plotH - py(yours.swing), 0)}
                    className="fill-success/10"
                  />
                )}
                {x.ticks.map((t) => (
                  <g key={`x${t}`}>
                    <line x1={px(t)} x2={px(t)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-base-300" />
                    <text x={px(t)} y={HEIGHT - 18} textAnchor="middle" className="fill-base-content/60 text-[11px]">
                      {t}%
                    </text>
                  </g>
                ))}
                {y.ticks.map((t) => (
                  <g key={`y${t}`}>
                    <line x1={PAD.left} x2={PAD.left + plotW} y1={py(t)} y2={py(t)} className="stroke-base-300" />
                    <text x={PAD.left - 8} y={py(t) + 4} textAnchor="end" className="fill-base-content/60 text-[11px]">
                      {t}
                    </text>
                  </g>
                ))}
                <text x={PAD.left + plotW / 2} y={HEIGHT - 2} textAnchor="middle" className="fill-base-content/60 text-[11px]">
                  Rate today
                </text>
                <text
                  transform={`translate(12 ${PAD.top + plotH / 2}) rotate(-90)`}
                  textAnchor="middle"
                  className="fill-base-content/60 text-[11px]"
                >
                  Swing (points)
                </text>
                {/* The cross at the product's own origin */}
                {yours && (
                  <>
                    <line x1={px(yours.rate)} x2={px(yours.rate)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-primary/50" strokeDasharray="4 4" />
                    <line x1={PAD.left} x2={PAD.left + plotW} y1={py(yours.swing)} y2={py(yours.swing)} className="stroke-primary/50" strokeDasharray="4 4" />
                  </>
                )}
                {quadrants.map((q) => (
                  <text
                    key={q.label}
                    x={q.x}
                    y={q.y}
                    textAnchor={q.anchor as "start" | "end"}
                    className={`text-[11px] font-semibold uppercase tracking-wider ${q.good ? "fill-success" : "fill-base-content/40"}`}
                  >
                    {q.label}
                  </text>
                ))}
              </svg>

              {points
                .slice()
                // Big piles underneath, your origin on top
                .sort((a, b) => b.origins.length - a.origins.length || Number(a === yours) - Number(b === yours))
                .map((p) => {
                  const single = p.origins.length === 1;
                  const o = p.origins[0];
                  const size = single ? FLAG : pileSize(p.origins.length);
                  const isYours = p === yours;
                  const isSelected = single && selected === o.country.code;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      className={`absolute -translate-x-1/2 translate-y-1/2 rounded-full motion-safe:transition-[left,bottom] motion-safe:duration-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                        hover === p.key || isYours ? "z-30" : "z-20"
                      }`}
                      style={{ left: px(p.rate), bottom: HEIGHT - py(p.swing), width: size, height: size }}
                      onMouseEnter={() => setHover(p.key)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(p.key)}
                      onBlur={() => setHover(null)}
                      onClick={() => single && onSelect(o.country.code)}
                      aria-label={
                        single
                          ? `${o.country.name}: ${formatRate(p.rate)}, swung ${formatRate(p.swing)}`
                          : `${p.origins.length} countries at ${formatRate(p.rate)}, swung ${formatRate(p.swing)}`
                      }
                    >
                      <span
                        className={`flex h-full w-full flex-wrap content-center items-center justify-center overflow-hidden rounded-full bg-base-100 shadow-sm ${
                          single ? "text-base" : "text-[10px] leading-[13px]"
                        } ${
                          isYours
                            ? "ring-2 ring-primary"
                            : isSelected
                              ? "ring-2 ring-success"
                              : hover === p.key
                                ? "ring-2 ring-base-content/40"
                                : "ring-1 ring-base-300"
                        }`}
                        aria-hidden
                      >
                        {single
                          ? o.country.flag
                          : p.origins.slice(0, Math.floor(size / 13) ** 2).map((m) => (
                              <span key={m.country.code} className="w-[13px] text-center">
                                {m.country.flag}
                              </span>
                            ))}
                      </span>
                      {!single && (
                        <span className="absolute left-1/2 top-full -mt-2 -translate-x-1/2 rounded-full bg-base-content px-1.5 text-[10px] font-semibold tabular-nums text-base-100">
                          {p.origins.length}
                        </span>
                      )}
                      {isYours && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded bg-primary px-1 text-[10px] font-semibold uppercase leading-4 tracking-wide text-primary-content">
                          You
                        </span>
                      )}
                      {hover === p.key && (
                        <span
                          role="tooltip"
                          className={`${ui.tooltip} absolute bottom-full left-1/2 z-40 mb-2 w-60 -translate-x-1/2 px-3 py-2 text-left text-xs`}
                        >
                          <span className="block font-semibold text-base-content">
                            {single ? `${o.country.flag} ${o.country.name}` : `${p.origins.length} countries`}
                          </span>
                          <span className="mt-1 flex justify-between">
                            <span className="text-base-content/70">Rate today</span>
                            <span className="font-semibold tabular-nums">{formatRate(p.rate)}</span>
                          </span>
                          <span className="flex justify-between">
                            <span className="text-base-content/70">Range since {formatDate(since)}</span>
                            <span className="tabular-nums">
                              {formatRate(p.vol.min)} – {formatRate(p.vol.max)}
                            </span>
                          </span>
                          <span className="flex justify-between">
                            <span className="text-base-content/70">Changes</span>
                            <span className="tabular-nums">{p.vol.changes}</span>
                          </span>
                          {!single && (
                            <span className="mt-1 block text-base-content/60">
                              {p.origins
                                .slice(0, 8)
                                .map((m) => m.country.name)
                                .join(", ")}
                              {p.origins.length > 8 ? ` and ${p.origins.length - 8} more` : ""}
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
            </>
          )
        )}
      </div>
    </figure>
  );
};
