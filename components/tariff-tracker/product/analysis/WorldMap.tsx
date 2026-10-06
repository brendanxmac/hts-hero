"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  geoCentroid,
  geoContains,
  geoDistance,
  geoEqualEarth,
  geoGraticule10,
  geoOrthographic,
  geoPath,
  GeoProjection,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries110m from "world-atlas/countries-110m.json";
import { numericToAlpha2 } from "i18n-iso-countries";
import { ArrowPathIcon, MinusIcon, PauseIcon, PlayIcon, PlusIcon } from "@heroicons/react/20/solid";
import { formatDate } from "@/components/duty-calculator/lib/format";
import { ChartCaption } from "@/components/duty-calculator/country-rate-charts/ChartCaption";
import { axis, figureCard } from "@/components/duty-calculator/country-rate-charts/scale";
import { useWidth } from "@/components/duty-calculator/rate-history/useWidth";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import palette from "@/components/ui/theme/palette";
import { SUMMARY_COUNTRY_CODES } from "@/libs/hts-duty-summary";
import { formatRate } from "../../formatRate";
import { BASE_PART, shortProgram } from "../../report";
import { OriginRate, partsOf, RateBasis, rateOf } from "./analysis";
import { Timeline } from "./useTimeline";

// Where it's cheapest: a globe of this product's rate from every country, the stronger the
// color the higher, duty-free origins in the savings green. Drag to spin it (it keeps turning
// a little when let go, and slowly on its own when left alone); select a country, here or
// anywhere in the analysis, and the globe turns to face it. It follows the analysis's date: take
// the time-lapse back (or play it from here) and the countries fade to the rates of that day. A
// flat view shows the whole world at once. Drawn on a canvas, so it stays smooth while it turns. Loaded with the Analysis tab only.

type Shape = Feature<Geometry, { name: string }> & { code?: string };
type View = "globe" | "flat";
type Rotation = [number, number, number];

const topology = countries110m as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;

// Every country's outline, with its two-letter code. Antarctica can't be an origin.
const SHAPES: Shape[] = (
  feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name: string }>
).features
  .filter((f) => f.id !== "010")
  .map((f) => ({ ...f, code: f.id ? numericToAlpha2(String(f.id)) : undefined }));
const SHAPE_BY_CODE = new Map(SHAPES.filter((s) => s.code).map((s) => [s.code!, s]));
const GRATICULE = geoGraticule10();
const SPHERE = { type: "Sphere" } as const;

// ── Color ──
// The theme's hex palette, mixed in sRGB the way color-mix() does, so the canvas matches the
// rest of the page in light and dark mode

type Mode = "light" | "dark";
type RGB = [number, number, number];
const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
const lerp = (x: RGB, y: RGB, t: number): RGB => x.map((v, i) => v + (y[i] - v) * t) as RGB;
const css = (c: RGB, alpha = 1) => `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha})`;
const mixRgb = (a: string, b: string, t: number) => lerp(rgb(a), rgb(b), t);
const mix = (a: string, b: string, t: number, alpha = 1) => css(mixRgb(a, b, t), alpha);
const alpha = (hex: string, a: number) => css(rgb(hex), a);

const colorsFor = (mode: Mode) => {
  const p = palette[mode];
  return {
    primary: p.primary,
    success: p.success,
    base100: p["base-100"],
    base200: p["base-200"],
    base300: p["base-300"],
    content: p["base-content"],
    free: mix(p["base-100"], p.success, 0.55),
    noData: mixRgb(p["base-200"], p["base-300"], mode === "dark" ? 0.9 : 0.7),
    // Stronger with the rate, on a square-root scale so the low rates most countries pay still differ
    rateRgb: (pct: number, top: number): RGB =>
      pct < 0.005
        ? mixRgb(p["base-100"], p.success, 0.55)
        : mixRgb(p["base-100"], p.primary, 0.18 + Math.sqrt(Math.min(pct / top, 1)) * 0.72),
    rate: (pct: number, top: number) =>
      css(
        pct < 0.005
          ? mixRgb(p["base-100"], p.success, 0.55)
          : mixRgb(p["base-100"], p.primary, 0.18 + Math.sqrt(Math.min(pct / top, 1)) * 0.72)
      ),
  };
};

const currentMode = (): Mode => {
  const set = document.documentElement.getAttribute("data-theme");
  if (set === "dark" || set === "light") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useMode = () => {
  const [mode, setMode] = useState<Mode>("light");
  useEffect(() => {
    setMode(currentMode());
    const update = () => setMode(currentMode());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  return mode;
};

// ── Motion ──

const SPIN_DEG_PER_MS = 0.004;
const IDLE_BEFORE_SPIN_MS = 2500;
const FLY_MS = 900;
// Countries fade to their new color when the rates change (another date, basis or selection)
const FILL_MS = 650;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// The shortest way round from one longitude to another
const wrap = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

export const WorldMap = ({
  rates,
  shown,
  basis,
  selected,
  onSelect,
  timeline,
}: {
  // Every origin, and the ones the analysis is showing (as of the timeline's date)
  rates: OriginRate[];
  shown: OriginRate[];
  basis: RateBasis;
  selected: string | null;
  onSelect: (code: string) => void;
  // The analysis's shared date, when there's history to move through
  timeline?: Timeline;
}) => {
  const { ref: wrapRef, width } = useWidth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useMode();
  const [view, setView] = useState<View>("globe");
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const height = Math.max(Math.min(Math.round(width * (view === "globe" ? 0.62 : 0.5)), 560), 280);

  const byCode = useMemo(() => new Map(shown.map((o) => [o.country.code, o])), [shown]);
  const { top, ticks } = useMemo(() => axis(Math.max(...rates.map((r) => rateOf(r, "standard")), 1)), [rates]);
  const colors = useMemo(() => colorsFor(mode), [mode]);

  // Each country's color, fading from what's on screen to the new one when anything changes
  const targets = useMemo(() => {
    const out = new Map<string, RGB>();
    SHAPES.forEach((shape) => {
      if (!shape.code) return;
      const origin = byCode.get(shape.code);
      out.set(shape.code, origin ? colors.rateRgb(rateOf(origin, basis), top) : colors.noData);
    });
    return out;
  }, [byCode, basis, top, colors]);
  const fill = useRef<{ from: Map<string, RGB>; to: Map<string, RGB>; start: number }>({
    from: targets,
    to: targets,
    start: 0,
  });
  const yours = shown.find((o) => o.isOrigin);

  // Start facing the product's own origin
  const initial = useMemo<Rotation>(() => {
    const shape = yours && SHAPE_BY_CODE.get(yours.country.code);
    if (!shape) return [-10, -20, 0];
    const [lon, lat] = geoCentroid(shape);
    return [-lon, Math.max(-50, Math.min(50, -lat)), 0];
    // Once per origin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yours?.country.code]);

  // Everything the drawing loop reads, kept current without restarting it
  const live = useRef({
    rotation: initial,
    zoom: 1,
    velocity: 0,
    dragging: false,
    pointerInside: false,
    lastInteraction: 0,
    fly: null as null | { from: Rotation; to: Rotation; start: number },
    dirty: true,
  });
  const data = useRef({ byCode, basis, top, colors, selected, hoverCode: null as string | null, yours: yours?.country.code, view, width, height });

  // The color a country has right now, mid-fade or not
  const fillNow = (code: string, now: number) => {
    const f = fill.current;
    // Through the ref: the drawing loop keeps the first render's functions
    const to = f.to.get(code) ?? data.current.colors.noData;
    const t = Math.min((now - f.start) / FILL_MS, 1);
    return t >= 1 ? to : lerp(f.from.get(code) ?? to, to, easeInOut(t));
  };
  useEffect(() => {
    const now = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = new Map<string, RGB>();
    targets.forEach((_, code) => from.set(code, fillNow(code, now)));
    fill.current = { from, to: targets, start: reduceMotion ? now - FILL_MS : now };
    live.current.dirty = true;
    // Only when the targets change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets]);
  data.current = { ...data.current, byCode, basis, top, colors, selected, yours: yours?.country.code, view, width, height };
  live.current.dirty = true;

  const projectionFor = (w: number, h: number, v: View): GeoProjection => {
    const { rotation, zoom } = live.current;
    if (v === "flat") {
      return geoEqualEarth()
        .rotate([rotation[0], 0, 0])
        .fitExtent(
          [
            [8, 8],
            [w - 8, h - 8],
          ],
          SPHERE
        );
    }
    const r = (Math.min(w, h) / 2 - 18) * zoom;
    return geoOrthographic().scale(r).translate([w / 2, h / 2]).rotate(rotation).clipAngle(90);
  };

  // ── Drawing ──
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const d = data.current;
    if (!canvas || !ctx || !d.width) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(d.width * dpr) || canvas.height !== Math.round(d.height * dpr)) {
      canvas.width = Math.round(d.width * dpr);
      canvas.height = Math.round(d.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, d.width, d.height);
    const c = d.colors;
    const projection = projectionFor(d.width, d.height, d.view);
    const path = geoPath(projection, ctx);
    const globe = d.view === "globe";
    const [cx, cy] = [d.width / 2, d.height / 2];
    const r = projection.scale();

    // The atmosphere: a soft glow around the globe
    if (globe) {
      const glow = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.22);
      glow.addColorStop(0, alpha(c.primary, 0.28));
      glow.addColorStop(1, alpha(c.primary, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.22, 0, Math.PI * 2);
      ctx.fill();
    }

    // The ocean, lit from the upper left on the globe
    ctx.beginPath();
    path(SPHERE);
    if (globe) {
      const ocean = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
      ocean.addColorStop(0, mix(c.base100, c.primary, 0.1));
      ocean.addColorStop(1, mix(c.base200, c.primary, 0.05));
      ctx.fillStyle = ocean;
    } else {
      ctx.fillStyle = mix(c.base200, c.primary, 0.04);
    }
    ctx.fill();

    ctx.beginPath();
    path(GRATICULE);
    ctx.strokeStyle = alpha(c.content, 0.06);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // The countries
    const now = performance.now();
    SHAPES.forEach((shape) => {
      ctx.beginPath();
      path(shape);
      ctx.fillStyle = css(shape.code ? fillNow(shape.code, now) : c.noData);
      ctx.fill();
      ctx.strokeStyle = alpha(c.base100, 0.7);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Outlines on top: hovered, selected, the product's own origin
    const outline = (code: string | null | undefined, color: string, w: number) => {
      const shape = code ? SHAPE_BY_CODE.get(code) : undefined;
      if (!shape) return;
      ctx.beginPath();
      path(shape);
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.stroke();
    };
    if (d.hoverCode && d.byCode.has(d.hoverCode)) outline(d.hoverCode, c.content, 1.5);
    outline(d.selected, c.success, 2.5);
    outline(d.yours, c.primary, 2.5);

    if (globe) {
      // Shade toward the edge, and a soft highlight, so it reads as a sphere
      ctx.save();
      ctx.beginPath();
      path(SPHERE);
      ctx.clip();
      const shade = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.2, cx, cy, r * 1.05);
      shade.addColorStop(0, "rgba(255, 255, 255, 0.10)");
      shade.addColorStop(0.55, "rgba(0, 0, 0, 0)");
      shade.addColorStop(1, "rgba(0, 0, 0, 0.28)");
      ctx.fillStyle = shade;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.beginPath();
      path(SPHERE);
      ctx.strokeStyle = alpha(c.primary, 0.35);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // A pin on the product's own origin, when it's on this side of the globe
    const pinShape = d.yours ? SHAPE_BY_CODE.get(d.yours) : undefined;
    if (pinShape) {
      const centroid = geoCentroid(pinShape);
      const facing = !globe || geoDistance(centroid, [-live.current.rotation[0], -live.current.rotation[1]]) < Math.PI / 2 - 0.1;
      const point = projection(centroid);
      if (facing && point) {
        const [x, y] = point;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = c.primary;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = c.base100;
        ctx.stroke();
        ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
        const label = "YOU";
        const w = ctx.measureText(label).width + 8;
        ctx.fillStyle = c.primary;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - 24, w, 14, 3);
        ctx.fill();
        ctx.fillStyle = c.base100;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, x, y - 17);
      }
    }
  };

  // ── The loop: flying, momentum, idle spin; draws only when something changed ──
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (canvasRef.current) observer.observe(canvasRef.current);
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const s = live.current;
      if (visible) {
        if (s.fly) {
          const t = Math.min((now - s.fly.start) / FLY_MS, 1);
          const e = easeInOut(t);
          s.rotation = [
            s.fly.from[0] + wrap(s.fly.to[0] - s.fly.from[0]) * e,
            s.fly.from[1] + (s.fly.to[1] - s.fly.from[1]) * e,
            0,
          ];
          if (t >= 1) s.fly = null;
          s.dirty = true;
        } else if (!s.dragging && Math.abs(s.velocity) > 0.002) {
          // Momentum after a drag, slowing to a stop
          s.rotation = [s.rotation[0] + s.velocity * dt, s.rotation[1], 0];
          s.velocity *= Math.pow(0.94, dt / 16);
          s.dirty = true;
        } else if (
          !reduceMotion &&
          !s.dragging &&
          !s.pointerInside &&
          data.current.view === "globe" &&
          now - s.lastInteraction > IDLE_BEFORE_SPIN_MS
        ) {
          s.rotation = [s.rotation[0] + SPIN_DEG_PER_MS * dt, s.rotation[1], 0];
          s.dirty = true;
        }
        // Still fading to new colors
        if (now - fill.current.start < FILL_MS) s.dirty = true;
        if (s.dirty) {
          s.dirty = false;
          draw();
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // The loop reads everything through refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Turn to face a country selected anywhere in the analysis
  const flyTo = (code: string) => {
    const shape = SHAPE_BY_CODE.get(code);
    if (!shape) return;
    const [lon, lat] = geoCentroid(shape);
    const s = live.current;
    s.velocity = 0;
    s.lastInteraction = performance.now();
    s.fly = { from: s.rotation, to: [-lon, Math.max(-55, Math.min(55, -lat)), 0], start: performance.now() };
  };
  useEffect(() => {
    if (selected) flyTo(selected);
    // Only when the selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  useEffect(() => {
    live.current.rotation = initial;
    live.current.dirty = true;
  }, [initial]);

  // ── Pointer: drag to spin, hover for a country, click to select ──
  const pointer = useRef({ x: 0, y: 0, t: 0, moved: 0 });

  const countryAt = (x: number, y: number) => {
    const d = data.current;
    const projection = projectionFor(d.width, d.height, d.view);
    if (d.view === "globe" && Math.hypot(x - d.width / 2, y - d.height / 2) > projection.scale()) return undefined;
    const point = projection.invert?.([x, y]);
    if (!point) return undefined;
    return SHAPES.find((s) => geoContains(s, point))?.code;
  };

  const local = (e: React.PointerEvent) => {
    const box = e.currentTarget.getBoundingClientRect();
    return [e.clientX - box.left, e.clientY - box.top] as const;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = local(e);
    try {
      // Keep the drag going if the pointer leaves the canvas mid-spin
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not every pointer can be captured; the drag still works inside the canvas
    }
    const s = live.current;
    s.dragging = true;
    s.fly = null;
    s.velocity = 0;
    s.lastInteraction = performance.now();
    pointer.current = { x, y, t: performance.now(), moved: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = local(e);
    const s = live.current;
    s.pointerInside = true;
    if (s.dragging) {
      const p = pointer.current;
      const now = performance.now();
      const scale = projectionFor(data.current.width, data.current.height, data.current.view).scale();
      // About one degree per pixel at the globe's edge, finer when zoomed in
      const k = 57.3 / scale;
      const dx = x - p.x;
      const dy = y - p.y;
      s.rotation = [
        s.rotation[0] + dx * k,
        data.current.view === "globe" ? Math.max(-80, Math.min(80, s.rotation[1] - dy * k)) : s.rotation[1],
        0,
      ];
      s.velocity = (dx * k) / Math.max(now - p.t, 1);
      s.lastInteraction = now;
      s.dirty = true;
      pointer.current = { x, y, t: now, moved: p.moved + Math.abs(dx) + Math.abs(dy) };
      if (hover) setHover(null);
      return;
    }
    const code = countryAt(x, y);
    const showable = code && data.current.byCode.has(code) ? code : null;
    if (showable !== data.current.hoverCode) {
      data.current.hoverCode = showable;
      s.dirty = true;
    }
    setHover(showable ? { code: showable, x, y } : null);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = live.current;
    s.dragging = false;
    s.lastInteraction = performance.now();
    // A click, not a drag
    if (pointer.current.moved < 5) {
      s.velocity = 0;
      const [x, y] = local(e);
      const code = countryAt(x, y);
      if (code && data.current.byCode.has(code)) onSelect(code);
    }
  };

  const onPointerLeave = () => {
    live.current.pointerInside = false;
    data.current.hoverCode = null;
    live.current.dirty = true;
    setHover(null);
  };

  const zoomBy = (factor: number) => {
    const s = live.current;
    s.zoom = Math.max(1, Math.min(3, s.zoom * factor));
    s.lastInteraction = performance.now();
    s.dirty = true;
  };
  const reset = () => {
    const s = live.current;
    s.zoom = 1;
    s.velocity = 0;
    s.fly = { from: s.rotation, to: initial, start: performance.now() };
  };

  // Origins too small for this map, so the table is where to find them
  const missing = shown.filter((o) => !SHAPE_BY_CODE.has(o.country.code)).length;
  const hovered = hover ? byCode.get(hover.code) : undefined;
  // Ties (often dozens at 0%) list the largest sources of US imports first: the likeliest places
  // to actually source from
  const cheapest = useMemo(() => {
    const sourceRank = (code: string) => {
      const i = SUMMARY_COUNTRY_CODES.indexOf(code);
      return i < 0 ? SUMMARY_COUNTRY_CODES.length : i;
    };
    return shown
      .filter((o) => !o.isOrigin && SHAPE_BY_CODE.has(o.country.code))
      .sort(
        (a, b) =>
          rateOf(a, basis) - rateOf(b, basis) ||
          sourceRank(a.country.code) - sourceRank(b.country.code) ||
          a.country.name.localeCompare(b.country.name)
      )
      .slice(0, 8);
  }, [shown, basis]);

  return (
    <figure className={figureCard}>
      <ChartCaption
        title="Where it's cheapest"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors.free }} />
              <span className={`${ui.caption} mr-1`}>Duty free</span>
              <span className={ui.caption}>Low</span>
              <span
                className="h-2 w-28 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${[0.01, 0.25, 0.5, 0.75, 1].map((f) => colors.rate(f * top, top)).join(", ")})`,
                }}
              />
              <span className={ui.caption}>{ticks[ticks.length - 1]}%</span>
            </div>
            <SegmentedControl<View>
              label="Map view"
              options={[
                { id: "globe", label: "Globe" },
                { id: "flat", label: "Flat" },
              ]}
              value={view}
              onChange={(next) => {
                setView(next);
                live.current.zoom = 1;
                live.current.dirty = true;
              }}
              size="sm"
            />
          </div>
        }
      >
        This product&apos;s rate from every country: the stronger the color, the more it pays. Drag to spin it, select a
        country to compare it with yours.
        {missing > 0 && ` ${missing} small origins are too small to draw; they're in the table below.`}
      </ChartCaption>

      <div className="mt-4 grid items-center gap-4 xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div ref={wrapRef} className="relative" style={{ height }}>
          <canvas
            ref={canvasRef}
            style={{ width, height, touchAction: "none" }}
            className={`block ${hover ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
            onDoubleClick={() => view === "globe" && zoomBy(1.5)}
            role="img"
            aria-label="Map of this product's rate by country"
          />

          {/* The date the colors are for, with the time-lapse's play and today */}
          {timeline && (
            <div className={`${ui.popover} absolute left-2 top-2 flex items-center gap-2 px-2 py-1.5`}>
              <button
                type="button"
                className={ui.button({ variant: timeline.playing ? "secondary" : "primary", size: "sm", icon: true })}
                onClick={timeline.toggle}
                aria-label={timeline.playing ? "Pause the time-lapse" : "Play the time-lapse"}
              >
                {timeline.playing ? <PauseIcon className="h-4 w-4" aria-hidden /> : <PlayIcon className="h-4 w-4" aria-hidden />}
              </button>
              <div className="flex flex-col pr-1">
                <span className="text-sm font-semibold tabular-nums text-base-content">
                  {timeline.atToday ? "Today" : formatDate(timeline.date)}
                </span>
                <span className={ui.caption}>{timeline.atToday ? "Rates in force now" : "Rates on this date"}</span>
              </div>
              {!timeline.atToday && (
                <button type="button" className={`${ui.link} text-xs`} onClick={timeline.toToday}>
                  Today
                </button>
              )}
            </div>
          )}

          {view === "globe" && (
            <div className="absolute bottom-2 right-2 flex flex-col gap-1">
              <button type="button" className={ui.button({ size: "sm", icon: true })} onClick={() => zoomBy(1.4)} aria-label="Zoom in">
                <PlusIcon className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" className={ui.button({ size: "sm", icon: true })} onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom out">
                <MinusIcon className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" className={ui.button({ size: "sm", icon: true })} onClick={reset} aria-label="Back to your origin">
                <ArrowPathIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}

          {hover && hovered && (
            <div
              role="tooltip"
              className={`${ui.tooltip} pointer-events-none absolute z-40 w-56 px-3 py-2 text-xs`}
              style={{ left: Math.min(hover.x + 14, width - 230), top: Math.max(hover.y - 20, 0) }}
            >
              <div className="flex items-center justify-between gap-2 font-semibold text-base-content">
                <span className="truncate">
                  {hovered.country.flag} {hovered.country.name}
                  {hovered.isOrigin && " (yours)"}
                </span>
                <span className="tabular-nums">{formatRate(rateOf(hovered, basis))}</span>
              </div>
              {basis === "agreements" && hovered.agreement && (
                <div className="mt-0.5 text-success">With {hovered.agreement.name}</div>
              )}
              <div className="mt-1.5 flex flex-col gap-0.5 text-base-content/70">
                {partsOf(hovered, basis).length === 0 ? (
                  <span>Duty free</span>
                ) : (
                  partsOf(hovered, basis).map((p) => (
                    <span key={p.key} className="flex justify-between gap-2">
                      <span className="truncate">{p.key === BASE_PART ? "Base duty" : shortProgram(p.key)}</span>
                      <span className="tabular-nums">{formatRate(p.pct)}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Where to look: the cheapest origins, each a click away on the globe */}
        <div className="flex flex-col gap-2">
          <span className={ui.label}>Cheapest origins</span>
          <ol className="flex flex-col">
            {cheapest.map((o) => (
              <li key={o.country.code}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-base-200 ${
                    selected === o.country.code ? "bg-base-200 font-semibold" : ""
                  }`}
                  onClick={() => onSelect(o.country.code)}
                >
                  <span aria-hidden>{o.country.flag}</span>
                  <span className="min-w-0 flex-1 truncate">{o.country.name}</span>
                  <span className={`tabular-nums ${rateOf(o, basis) < 0.005 ? "text-success" : "text-base-content/70"}`}>
                    {formatRate(rateOf(o, basis))}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {yours && (
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-primary/30 px-2 py-1.5 text-left text-sm transition-colors hover:bg-base-200"
              onClick={reset}
            >
              <span aria-hidden>{yours.country.flag}</span>
              <span className="min-w-0 flex-1 truncate font-semibold text-primary">{yours.country.name} (yours)</span>
              <span className="tabular-nums text-primary">{formatRate(rateOf(yours, basis))}</span>
            </button>
          )}
        </div>
      </div>
    </figure>
  );
};
