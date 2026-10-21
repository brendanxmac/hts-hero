import { PROGRAM } from "@/components/ui/marketing";

// How a change reaches your products: the official sources flow through the engine's four steps to
// the products a change hits, each in its tariff program's color. The programs and dates are real
// (tariff changelog); the products are examples. The dots move with SVG animation (no script) and
// are hidden for reduced motion.

const W = 760;
const H = 420;
const SOURCES = ["USITC · HTS revisions", "White House · orders", "Federal Register", "CBP · CSMS"];
const STAGES = ["Base rate", "Chapter 99 stacking", "Exemptions, preferences", "Fees"];
const PRODUCTS = [
  { name: "Lager beer · CA", tag: "Sec. 338 +50%", color: PROGRAM["Section 338"] },
  { name: "Drones · CN", tag: "Sec. 232 +25%", color: PROGRAM["Section 232"] },
  { name: "Products of Brazil", tag: "Sec. 301 +25%", color: PROGRAM["Section 301"] },
];
const ENGINE = { x: 270, y: 60, w: 220, h: 300 };
const srcY = (i: number) => 70 + i * 90;
const prodY = (i: number) => 110 + i * 110;
const inPath = (i: number) => `M 190 ${srcY(i)} C 230 ${srcY(i)}, 230 ${H / 2}, ${ENGINE.x} ${H / 2}`;
const outPath = (i: number) => `M ${ENGINE.x + ENGINE.w} ${H / 2} C 530 ${H / 2}, 530 ${prodY(i)}, 570 ${prodY(i)}`;

export const EngineSchematic = () => (
  <svg
    viewBox={`0 0 ${W} ${H}`}
    className="h-auto w-full"
    role="img"
    aria-label="Tariff changes from USITC, the White House, the Federal Register and CBP flow through HTS Hero's engine (base rate, Chapter 99 stacking, exemptions and preferences, fees) to the products they affect"
  >
    {SOURCES.map((_, i) => (
      <path key={`i${i}`} d={inPath(i)} fill="none" stroke="color-mix(in oklab, var(--color-primary) 40%, transparent)" strokeWidth="1.5" strokeDasharray="4 4" />
    ))}
    {PRODUCTS.map((p, i) => (
      <path key={`o${i}`} d={outPath(i)} fill="none" stroke={p.color} strokeOpacity="0.45" strokeWidth="2" />
    ))}
    <g className="motion-reduce:hidden">
      {SOURCES.map((_, i) => (
        <circle key={`di${i}`} r="4" fill="var(--color-primary)">
          <animateMotion dur="2.6s" begin={`${i * 0.65}s`} repeatCount="indefinite" path={inPath(i)} />
        </circle>
      ))}
      {PRODUCTS.map((p, i) => (
        <circle key={`do${i}`} r="5" fill={p.color}>
          <animateMotion dur="2.6s" begin={`${1.3 + i * 0.8}s`} repeatCount="indefinite" path={outPath(i)} />
        </circle>
      ))}
    </g>
    {SOURCES.map((s, i) => (
      <g key={s}>
        <rect x="0" y={srcY(i) - 20} width="190" height="40" rx="8" fill="var(--color-base-100)" stroke="var(--color-base-300)" />
        <text x="14" y={srcY(i) + 5} fontSize="13" fontWeight="600" fill="var(--color-base-content)">
          {s}
        </text>
      </g>
    ))}
    <rect x={ENGINE.x} y={ENGINE.y} width={ENGINE.w} height={ENGINE.h} rx="12" fill="var(--color-base-100)" stroke="var(--color-base-content)" strokeWidth="2" />
    <text x={ENGINE.x + 18} y={ENGINE.y + 32} fontSize="12" fontWeight="700" letterSpacing="2" fill="var(--color-primary)">
      HTS HERO ENGINE
    </text>
    {STAGES.map((s, i) => (
      <g key={s}>
        <rect x={ENGINE.x + 18} y={ENGINE.y + 54 + i * 58} width={ENGINE.w - 36} height="42" rx="8" fill="color-mix(in oklab, var(--color-primary) 8%, transparent)" stroke="color-mix(in oklab, var(--color-primary) 40%, transparent)" />
        <text x={ENGINE.x + 32} y={ENGINE.y + 80 + i * 58} fontSize="12.5" fontWeight="600" fill="var(--color-base-content)">
          {i + 1}. {s}
        </text>
      </g>
    ))}
    {PRODUCTS.map((p, i) => (
      <g key={p.name}>
        <rect x="570" y={prodY(i) - 28} width="190" height="56" rx="10" fill="var(--color-base-100)" stroke={p.color} strokeWidth="1.75" />
        <text x="584" y={prodY(i) - 6} fontSize="13" fontWeight="600" fill="var(--color-base-content)">
          {p.name}
        </text>
        <text x="584" y={prodY(i) + 15} fontSize="12" fontWeight="700" fill={p.color}>
          {p.tag}
        </text>
      </g>
    ))}
  </svg>
);
