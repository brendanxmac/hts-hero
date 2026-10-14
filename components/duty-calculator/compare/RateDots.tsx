"use client";

import { useState } from "react";
import { ChartFrame, linearScale, niceMax, Tooltip, TooltipRow } from "@/components/ui/charts/kit";
import { PRIMARY_MARK } from "@/components/ui/theme";
import { rateKey } from "@/components/tariff-tracker/product/analysis/analysis";
import { formatRate } from "@/components/tariff-tracker/formatRate";
import { formatImportValue } from "../lib/usImports";
import { CompareOption, optionLabel } from "./options";

// Every origin by its rate, as its flag: countries paying the same rate stack into a neat counted
// block over that rate (no overlapping piles), a line marks yours with everything cheaper shaded,
// the shortlist wears its colors as rings, countries that don't ship this to the US yet fade back,
// and an agreement option has a dashed ring. Hover a dot for the country; select it to add it
// to the shortlist (or take it off).

// A flag's size, and the cell it sits in
const FLAG = 13;
const CELL = 18;
const ROWS = 12;
const MARGIN = { top: 44, right: 16, bottom: 30, left: 16 };

interface Placed {
  option: CompareOption;
  cx: number;
  cy: number;
}

export const RateDots = ({
  options,
  yourPct,
  shortlist,
  colors,
  imports,
  onToggle,
}: {
  options: CompareOption[];
  yourPct: number;
  shortlist: ReadonlySet<string>;
  colors: Record<string, string>;
  // US imports by country (Census), for the shade and the tooltip
  imports: Map<string, { value: number }> | null;
  onToggle: (code: string) => void;
}) => {
  const [hover, setHover] = useState<Placed | null>(null);
  const top = niceMax(Math.max(...options.map((o) => o.pct), yourPct, 1));
  const height = MARGIN.top + ROWS * CELL + MARGIN.bottom + 8;

  // Same-rate groups, lowest first; each a block of columns ROWS dots tall
  const groups = Array.from(
    options.reduce((m, o) => m.set(rateKey(o.pct), [...(m.get(rateKey(o.pct)) ?? []), o]), new Map<number, CompareOption[]>()).entries()
  ).sort((a, b) => a[0] - b[0]);

  const place = (innerWidth: number, innerHeight: number) => {
    const x = linearScale([0, top], [0, innerWidth]);
    const placed: Placed[] = [];
    const ticks: { x: number; at: number; top: number; count: number; pct: number; width: number }[] = [];
    // Each block centered on its rate; where neighbours would overlap, both move apart by half the
    // overlap (a few passes), so every block stays as close to its rate as the space allows
    const blocks = groups.map(([pct, members]) => {
      const width = Math.ceil(members.length / ROWS) * CELL;
      return { pct, members, width, left: x(pct) - width / 2 };
    });
    for (let pass = 0; pass < 30; pass++) {
      let moved = false;
      for (let i = 1; i < blocks.length; i++) {
        const overlap = blocks[i - 1].left + blocks[i - 1].width + 4 - blocks[i].left;
        if (overlap > 0.5) {
          blocks[i - 1].left -= overlap / 2;
          blocks[i].left += overlap / 2;
          moved = true;
        }
      }
      blocks.forEach((b) => (b.left = Math.min(Math.max(b.left, 0), innerWidth - b.width)));
      if (!moved) break;
    }
    blocks.forEach(({ pct, members, width, left }) => {
      ticks.push({ x: left + width / 2, at: x(pct), top: innerHeight - Math.min(members.length, ROWS) * CELL, count: members.length, pct, width });
      // The shortlist first, at the bottom of the block, then suppliers, then the rest
      const sorted = [...members].sort((a, b) => {
        const rank = (o: CompareOption) => (shortlist.has(o.origin.country.code) ? 0 : (imports?.get(o.origin.country.code)?.value ?? 0) > 0 ? 1 : 2);
        return rank(a) - rank(b) || a.origin.country.name.localeCompare(b.origin.country.name);
      });
      sorted.forEach((option, i) => {
        const col = Math.floor(i / ROWS);
        const row = i % ROWS;
        placed.push({ option, cx: left + col * CELL + CELL / 2, cy: innerHeight - row * CELL - CELL / 2 });
      });
    });
    return { x, placed, ticks };
  };

  return (
    <div className="flex flex-col gap-3">
      <ChartFrame
        height={height}
        margin={MARGIN}
        label={`Every origin by its rate: ${options.length} options, from ${formatRate(groups[0]?.[0] ?? 0)} to ${formatRate(groups[groups.length - 1]?.[0] ?? 0)}`}
        onLeave={() => setHover(null)}
        overlay={() => {
          if (!hover) return null;
          const code = hover.option.origin.country.code;
          const value = imports?.get(code)?.value ?? 0;
          return (
            <Tooltip x={hover.cx} y={hover.cy}>
              <p className="m-0 mb-1 font-semibold text-base-content">
                {hover.option.origin.country.flag} {optionLabel(hover.option)}
              </p>
              <TooltipRow label="Duty rate" value={formatRate(hover.option.pct)} />
              <TooltipRow label="Against yours" value={Math.abs(hover.option.pct - yourPct) < 0.005 ? "Same" : `${hover.option.pct < yourPct ? "−" : "+"}${formatRate(Math.abs(hover.option.pct - yourPct))}`} />
              <TooltipRow label="US imports" value={value > 0 ? formatImportValue(value) : "None"} />
              <p className="m-0 mt-1 text-base-content/60">{shortlist.has(code) ? "Select to take it off your shortlist" : "Select to add it to your shortlist"}</p>
            </Tooltip>
          );
        }}
      >
        {({ innerWidth, innerHeight }) => {
          const { x, placed, ticks } = place(innerWidth, innerHeight);
          const yours = x(yourPct);
          return (
            <>
              {/* Cheaper than yours, shaded; yours marked */}
              <rect x={0} y={-24} width={Math.max(0, yours)} height={innerHeight + 24} rx={8} style={{ fill: "oklch(var(--su) / 0.06)" }} />
              <text x={6} y={-30} className="fill-success text-[11px] font-semibold">
                Cheaper than yours
              </text>
              <line x1={yours} x2={yours} y1={-24} y2={innerHeight} stroke={PRIMARY_MARK} strokeWidth={1.5} strokeDasharray="3 3" />
              <text x={yours + 4} y={-30} className="fill-primary text-[11px] font-semibold">
                Yours {formatRate(yourPct)}
              </text>
              {/* The axis: round rates, and a short tick from each block to its rate */}
              <line x1={0} x2={innerWidth} y1={innerHeight + 4} y2={innerHeight + 4} className="stroke-base-300" />
              {x.ticks(5).map((t) => (
                <text key={t} x={x(t)} y={innerHeight + 20} textAnchor="middle" className="fill-base-content/60 text-[11px]">
                  {formatRate(t)}
                </text>
              ))}
              {ticks.map((t, i) => (
                <g key={i}>
                  <line x1={t.x} x2={t.at} y1={innerHeight + 1} y2={innerHeight + 7} className="stroke-base-content/30" />
                  {/* How many pay this rate, over a block of more than one */}
                  {t.count > 1 && (
                    <text x={t.x} y={t.top - 6} textAnchor="middle" className="fill-base-content/60 text-[11px] font-semibold tabular-nums">
                      {/* A narrow block shows just its count; its rate is on the axis under it */}
                      {t.width >= 80 ? `${t.count} at ${formatRate(t.pct)}` : t.count}
                    </text>
                  )}
                </g>
              ))}
              {placed.map((p) => {
                const code = p.option.origin.country.code;
                const picked = shortlist.has(code);
                const isYours = p.option.origin.isOrigin && !p.option.agreement;
                const ships = (imports?.get(code)?.value ?? 0) > 0;
                const ring = isYours ? PRIMARY_MARK : picked ? colors[code] : null;
                return (
                  <g
                    key={p.option.key}
                    className="cursor-pointer"
                    onMouseEnter={() => setHover(p)}
                    onClick={() => onToggle(code)}
                    role="button"
                    aria-label={`${optionLabel(p.option)}, ${formatRate(p.option.pct)}`}
                    // Countries that don't ship it to the US yet fade back
                    opacity={ring || ships ? 1 : 0.4}
                  >
                    {/* The shortlist wears its color as a ring, yours the primary; an agreement option's ring is dashed */}
                    {(ring || p.option.agreement) && (
                      <circle
                        cx={p.cx}
                        cy={p.cy}
                        r={CELL / 2}
                        fill="oklch(var(--b1))"
                        stroke={ring ?? "oklch(var(--bc) / 0.5)"}
                        strokeWidth={ring ? 2 : 1.25}
                        strokeDasharray={p.option.agreement ? "2 2" : undefined}
                      />
                    )}
                    <text x={p.cx} y={p.cy} textAnchor="middle" dominantBaseline="central" fontSize={FLAG} style={{ userSelect: "none" }}>
                      {p.option.origin.country.flag}
                    </text>
                  </g>
                );
              })}
            </>
          );
        }}
      </ChartFrame>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-base-content/70">
        {Array.from(shortlist).map((code) => {
          const o = options.find((x) => x.origin.country.code === code && !x.agreement) ?? options.find((x) => x.origin.country.code === code);
          return o ? (
            <span key={code} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border-2" style={{ borderColor: colors[code] }} aria-hidden />
              {o.origin.country.flag} {o.origin.country.name}
            </span>
          ) : null;
        })}
        <span className="inline-flex items-center gap-1.5">
          <span className="opacity-40" aria-hidden>
            🏳️
          </span>
          Faded: doesn&apos;t ship it to the US yet
        </span>
        {options.some((o) => o.agreement) && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-dashed border-base-content/50" aria-hidden />
            With a trade agreement
          </span>
        )}
      </div>
    </div>
  );
};
