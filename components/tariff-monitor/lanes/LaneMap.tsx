import { geoCentroid, geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries110m from "world-atlas/countries-110m.json";
import { LANES } from "./lanes";

// A world map drawn on the server, centered on the Pacific so lanes from Asia cross it, with
// animated lanes from each origin into the US. Dots move with SVG animation (no script) and are
// hidden for reduced motion.

const W = 1200;
const H = 600;
const US = "840";

const topo = countries110m as unknown as Topology<{ countries: GeometryCollection }>;
const world = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;
const projection = geoEqualEarth()
  .rotate([160, 0])
  .fitExtent(
    [
      [10, 10],
      [W - 10, H - 10],
    ],
    world
  );
// Whole-pixel coordinates: invisible at this size, and about half the markup
const pathOf = geoPath(projection).digits(0);
const byId = new Map(world.features.map((f) => [String(f.id), f as Feature<Geometry, { name: string }>]));

// Hand-placed anchors where a centroid lands oddly (the US and Canada centroids sit far north/west)
const ANCHORS: Record<string, [number, number]> = { "840": [-96, 38], "124": [-79, 49] };
const point = (id: string) => projection(ANCHORS[id] ?? geoCentroid(byId.get(id)!))!;

const usPt = point(US);
const lanePath = (id: string) => {
  const [x, y] = point(id);
  const mx = (x + usPt[0]) / 2;
  const my = Math.min(y, usPt[1]) - Math.abs(x - usPt[0]) * 0.18 - 40;
  return `M ${x} ${y} Q ${mx} ${my} ${usPt[0]} ${usPt[1]}`;
};

const laneColor = new Map(LANES.map((l) => [l.id, l.color]));

// Every country that isn't highlighted, drawn as one path; the US and the lane origins get their own
const background = pathOf({
  type: "FeatureCollection",
  features: world.features.filter((f) => String(f.id) !== US && !laneColor.has(String(f.id))),
} as FeatureCollection) ?? "";
const highlighted = world.features.filter((f) => String(f.id) === US || laneColor.has(String(f.id)));

export const LaneMap = () => (
  <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Trade lanes into the US from ${LANES.map((l) => l.country).join(", ")}, each with a 2026 tariff change`}>
    <path d={background} fill="#1e293b" stroke="#0b1220" strokeWidth={0.5} />
    {highlighted.map((f) => {
      const id = String(f.id);
      return (
        <path
          key={id}
          d={pathOf(f) ?? ""}
          fill={id === US ? "#e2e8f0" : laneColor.get(id)}
          fillOpacity={id === US ? 0.95 : 0.6}
          stroke="#0b1220"
          strokeWidth={0.5}
        />
      );
    })}
    {LANES.map((l, i) => (
      <g key={l.id}>
        <path d={lanePath(l.id)} fill="none" stroke={l.color} strokeWidth={2} strokeOpacity={0.55} strokeDasharray="6 6">
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />
        </path>
        <circle r={6} fill={l.color} className="motion-reduce:hidden">
          <animateMotion dur="3.2s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={lanePath(l.id)} />
        </circle>
        <circle cx={point(l.id)[0]} cy={point(l.id)[1]} r={5} fill={l.color} stroke="#0b1220" strokeWidth={1.5} />
      </g>
    ))}
    <circle cx={usPt[0]} cy={usPt[1]} r={9} fill="#f8fafc" />
    <circle cx={usPt[0]} cy={usPt[1]} r={9} fill="none" stroke="#5eead4" strokeWidth={2} className="motion-reduce:hidden">
      <animate attributeName="r" from="9" to="34" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.9" to="0" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);
