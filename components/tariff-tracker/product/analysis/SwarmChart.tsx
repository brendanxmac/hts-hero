"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useWidth } from "@/components/duty-calculator/rate-history/useWidth";
import { axis, figureCard } from "@/components/duty-calculator/country-rate-charts/scale";
import { ChartCaption } from "@/components/duty-calculator/country-rate-charts/ChartCaption";
import * as ui from "@/components/ui/styles";
import { formatRate } from "../../formatRate";
import { BASE_PART, shortProgram } from "../../report";
import { layoutSwarm, OriginRate, partsOf, PlacedNode, RateBasis, rateOf, swarmNodes } from "./analysis";

// A pile's face: as many of its flags as fit, packed into the circle
const Mosaic = ({ origins, size }: { origins: OriginRate[]; size: number }) => {
  const cell = 15;
  const fit = Math.max(1, Math.floor(size / cell) ** 2);
  return (
    <span
      className="flex h-full w-full flex-wrap content-center items-center justify-center overflow-hidden rounded-full bg-base-100 text-[11px] leading-[15px] shadow-sm ring-1 ring-base-300"
      aria-hidden
    >
      {origins.slice(0, fit).map((o) => (
        <span key={o.country.code} className="w-[15px] text-center">
          {o.country.flag}
        </span>
      ))}
    </span>
  );
};

// Every country of origin as its flag, at its rate on one axis: the shape of the whole tariff
// landscape for this product at a glance. Flags rise into place, and glide to their new rates
// when the basis changes (no motion for those who ask for less). Ties among many origins become
// a pile: a mosaic of their flags, bigger the more countries share the rate, with the count;
// open it to see every country in it. The product's own origin is ringed.

const FLAG = 30;
// Ties among this many origins or more become a pile
const PILE_FROM = 6;
// Half the biggest pile, so one at either end of the scale stays inside the chart
const PAD = 48;
// Room under the marks for the scale, and above them for the "You" label
const AXIS = 28;
const HEADROOM = 22;

// A pile's size grows with its count, slowly, so 190 countries don't swamp the chart
const pileSize = (count: number) => Math.round(Math.min(96, 34 + 8 * Math.log2(count)));

const flagFace = (o: OriginRate, ring: string) => (
  <span
    className={`flex h-[30px] w-[30px] items-center justify-center rounded-full bg-base-100 text-lg leading-none shadow-sm ring-1 ${ring}`}
    aria-hidden
  >
    {o.country.flag}
  </span>
);

const Tooltip = ({ origin, basis }: { origin: OriginRate; basis: RateBasis }) => {
  const parts = partsOf(origin, basis);
  const claimed = basis === "agreements" && origin.agreement;
  return (
    <span
      role="tooltip"
      className={`${ui.tooltip} absolute bottom-full left-1/2 z-40 mb-2 w-56 -translate-x-1/2 px-3 py-2 text-left text-xs`}
    >
      <span className="flex items-center justify-between gap-2 font-semibold text-base-content">
        <span className="truncate">
          {origin.country.flag} {origin.country.name}
        </span>
        <span className="tabular-nums">{formatRate(rateOf(origin, basis))}</span>
      </span>
      {claimed && <span className="mt-0.5 block text-success">With {origin.agreement!.name}</span>}
      <span className="mt-1.5 flex flex-col gap-0.5 text-base-content/70">
        {parts.length === 0 ? (
          <span>Duty free</span>
        ) : (
          parts.map((p) => (
            <span key={p.key} className="flex justify-between gap-2">
              <span className="truncate">{p.key === BASE_PART ? "Base duty" : shortProgram(p.key)}</span>
              <span className="tabular-nums">{formatRate(p.pct)}</span>
            </span>
          ))
        )}
      </span>
    </span>
  );
};

export const SwarmChart = ({
  rates,
  basis,
  selected,
  onSelect,
  maxPct,
  title = "Every origin, by its rate",
  description = "Each flag is a country this product could come from. Hover for its tariffs, select one to compare it with yours. Piles hold countries that pay the same rate.",
  footer,
}: {
  rates: OriginRate[];
  basis: RateBasis;
  selected: string | null;
  onSelect: (code: string) => void;
  // A fixed top for the scale, so the axis stays put while the rates change (the time-lapse)
  maxPct?: number;
  title?: string;
  description?: ReactNode;
  // Under the chart, inside its card: the time-lapse's controls
  footer?: ReactNode;
}) => {
  const { ref, width } = useWidth();
  const [hover, setHover] = useState<string | null>(null);
  const [openPile, setOpenPile] = useState<string | null>(null);
  // Flags start on the axis and rise into place once there's a frame to animate from
  const [risen, setRisen] = useState(false);
  useEffect(() => {
    if (!width) return;
    const frame = requestAnimationFrame(() => setRisen(true));
    return () => cancelAnimationFrame(frame);
  }, [width]);

  // One scale for both bases, so switching shows movement rather than a rescaled axis
  const { top, ticks } = useMemo(
    () => axis(maxPct ?? Math.max(...rates.map((r) => rateOf(r, "standard")), 1)),
    [rates, maxPct]
  );
  const x = (pct: number) => PAD + (pct / top) * Math.max(width - PAD * 2, 1);

  const placed: PlacedNode[] = useMemo(
    () =>
      width
        ? layoutSwarm(swarmNodes(rates, basis, PILE_FROM), x, (n) => (n.kind === "pile" ? pileSize(n.origins.length) : FLAG))
        : [],
    // x depends only on width and top
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rates, basis, width, top]
  );
  // Tall enough for the highest mark, and never squat
  const height = Math.max(...placed.map((p) => p.y + p.size), 3 * FLAG) + HEADROOM;
  const pile = placed.find((p) => p.node.key === openPile)?.node;

  return (
    <figure className={`${figureCard} relative`}>
      <ChartCaption title={title}>{description}</ChartCaption>

      <div ref={ref} className="relative mt-6 select-none" style={{ height: height + AXIS }}>
        {/* Gridlines and the scale */}
        {width > 0 &&
          ticks.map((t) => (
            <div key={t} className="absolute" style={{ left: x(t), top: 0, bottom: 0 }} aria-hidden>
              <span className={`absolute top-0 bottom-6 w-px ${t === 0 ? "bg-base-content/20" : "bg-base-300"}`} />
              <span className={`${ui.caption} absolute bottom-0 -translate-x-1/2 tabular-nums`}>{t}%</span>
            </div>
          ))}

        {placed.map(({ node, cx, y, size }, i) => {
          const bottom = AXIS + (risen ? y : 0);
          const motion = {
            left: cx,
            bottom,
            opacity: risen ? 1 : 0,
            // Rise from the axis left to right, then move together
            transitionDelay: risen ? `${Math.min(i * 6, 500)}ms` : "0ms",
          };
          const motionClass =
            "absolute -translate-x-1/2 motion-safe:transition-[left,bottom,opacity] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]";

          if (node.kind === "pile") {
            const open = openPile === node.key;
            return (
              <button
                key={node.key}
                type="button"
                className={`${motionClass} z-10 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                  open || hover === node.key ? "ring-2 ring-primary" : ""
                }`}
                style={{ ...motion, width: size, height: size }}
                onClick={() => setOpenPile(open ? null : node.key)}
                onMouseEnter={() => setHover(node.key)}
                onMouseLeave={() => setHover(null)}
                aria-expanded={open}
                aria-label={`${node.origins.length} countries at ${formatRate(node.pct)}`}
              >
                <Mosaic origins={node.origins} size={size} />
                <span
                  className={`absolute left-1/2 top-full -mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 text-[11px] font-semibold tabular-nums shadow-sm ${
                    open || hover === node.key ? "bg-primary text-primary-content" : "bg-base-content text-base-100"
                  }`}
                >
                  {node.origins.length}
                </span>
                {hover === node.key && !open && (
                  <span
                    role="tooltip"
                    className={`${ui.tooltip} absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 whitespace-nowrap px-2 py-1 text-xs`}
                  >
                    <span className="font-semibold">{node.origins.length} countries</span> at {formatRate(node.pct)} ·
                    select to see them
                  </span>
                )}
              </button>
            );
          }

          const o = node.origin;
          const code = o.country.code;
          const isSelected = selected === code;
          const ring = o.isOrigin
            ? "ring-2 ring-primary"
            : isSelected
              ? "ring-2 ring-success"
              : hover === code
                ? "ring-2 ring-base-content/40"
                : "ring-base-300";
          return (
            <button
              key={node.key}
              type="button"
              className={`${motionClass} ${hover === code || isSelected || o.isOrigin ? "z-30" : "z-20"} rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`}
              style={motion}
              onClick={() => onSelect(code)}
              onMouseEnter={() => setHover(code)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(code)}
              onBlur={() => setHover(null)}
              aria-pressed={isSelected}
              aria-label={`${o.country.name}: ${formatRate(rateOf(o, basis))}${o.isOrigin ? ", this product's origin" : ""}`}
            >
              {flagFace(o, ring)}
              {o.isOrigin && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded bg-primary px-1 text-[10px] font-semibold uppercase leading-4 tracking-wide text-primary-content">
                  You
                </span>
              )}
              {hover === code && <Tooltip origin={o} basis={basis} />}
            </button>
          );
        })}
      </div>

      {/* An opened pile: every country in it */}
      {pile && pile.kind === "pile" && (
        <div className="mt-4 rounded-lg border border-base-300 bg-base-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-base-content">
              {pile.origins.length} countries at {formatRate(pile.pct)}
            </span>
            <button type="button" className={`${ui.link} text-xs`} onClick={() => setOpenPile(null)}>
              Close
            </button>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
            {pile.origins.map((o) => (
              <li key={o.country.code}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-base-100 ${
                    selected === o.country.code ? "bg-base-100 font-semibold text-success" : "text-base-content/80"
                  }`}
                  onClick={() => onSelect(o.country.code)}
                >
                  <span aria-hidden>{o.country.flag}</span>
                  <span className="truncate">{o.country.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {footer}
    </figure>
  );
};
