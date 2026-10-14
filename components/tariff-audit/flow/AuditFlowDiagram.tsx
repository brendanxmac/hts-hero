// How an audit runs: your entry data flows through the engine's checks to flagged lines, then to
// your broker's filing routes. Dots move with SVG animation (no script) and are hidden for reduced
// motion.

const W = 900;
const H = 360;
const ENGINE = { x: 250, y: 40, w: 230, h: 280 };
const INPUTS = ["ACE entry summary (ES-003)", "CBP Form 7501 data"];
const CHECKS = ["Rules on the entry date", "Stacking and exemptions", "Trade preferences", "Refund status"];
const FLAGS = [
  { label: "Overpaid", color: "oklch(var(--su))" },
  { label: "Refundable", color: "oklch(var(--p))" },
  { label: "Underpaid", color: "oklch(var(--er))" },
];
const BROKER = { x: 720, y: 120, w: 180, h: 120 };
const inY = (i: number) => 130 + i * 100;
const flagY = (i: number) => 90 + i * 90;
const inPath = (i: number) => `M 200 ${inY(i)} C 225 ${inY(i)}, 225 ${H / 2}, ${ENGINE.x} ${H / 2}`;
const outPath = (i: number) => `M ${ENGINE.x + ENGINE.w} ${H / 2} C 505 ${H / 2}, 505 ${flagY(i)}, 530 ${flagY(i)}`;
const toBroker = (i: number) => `M 670 ${flagY(i)} C 695 ${flagY(i)}, 695 ${H / 2}, ${BROKER.x} ${H / 2}`;

export const AuditFlowDiagram = () => (
  <svg
    viewBox={`0 0 ${W} ${H}`}
    className="h-auto w-full"
    role="img"
    aria-label="Your entry data flows through HTS Hero's checks (rules on the entry date, stacking and exemptions, trade preferences, refund status) to overpaid, refundable and underpaid lines, then to your customs broker to file"
  >
    {INPUTS.map((_, i) => (
      <path key={`i${i}`} d={inPath(i)} fill="none" stroke="oklch(var(--p)/0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
    ))}
    {FLAGS.map((f, i) => (
      <g key={`o${i}`}>
        <path d={outPath(i)} fill="none" stroke={f.color} strokeOpacity="0.45" strokeWidth="2" />
        <path d={toBroker(i)} fill="none" stroke={f.color} strokeOpacity="0.3" strokeWidth="2" />
      </g>
    ))}
    <g className="motion-reduce:hidden">
      {INPUTS.map((_, i) => (
        <circle key={`di${i}`} r="4" fill="oklch(var(--p))">
          <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={inPath(i)} />
        </circle>
      ))}
      {FLAGS.map((f, i) => (
        <circle key={`do${i}`} r="5" fill={f.color}>
          <animateMotion dur="2.4s" begin={`${1.2 + i * 0.7}s`} repeatCount="indefinite" path={outPath(i)} />
        </circle>
      ))}
    </g>
    {INPUTS.map((label, i) => (
      <g key={label}>
        <rect x="0" y={inY(i) - 22} width="200" height="44" rx="8" fill="oklch(var(--b1))" stroke="oklch(var(--b3))" />
        <text x="14" y={inY(i) + 5} fontSize="12.5" fontWeight="600" fill="oklch(var(--bc))">
          {label}
        </text>
      </g>
    ))}
    <rect x={ENGINE.x} y={ENGINE.y} width={ENGINE.w} height={ENGINE.h} rx="12" fill="oklch(var(--b1))" stroke="oklch(var(--bc))" strokeWidth="2" />
    <text x={ENGINE.x + 18} y={ENGINE.y + 32} fontSize="12" fontWeight="700" letterSpacing="2" fill="oklch(var(--p))">
      HTS HERO AUDIT
    </text>
    {CHECKS.map((c, i) => (
      <g key={c}>
        <rect x={ENGINE.x + 18} y={ENGINE.y + 50 + i * 54} width={ENGINE.w - 36} height="40" rx="8" fill="oklch(var(--p)/0.08)" stroke="oklch(var(--p)/0.4)" />
        <text x={ENGINE.x + 32} y={ENGINE.y + 75 + i * 54} fontSize="12.5" fontWeight="600" fill="oklch(var(--bc))">
          {c}
        </text>
      </g>
    ))}
    {FLAGS.map((f, i) => (
      <g key={f.label}>
        <rect x="530" y={flagY(i) - 22} width="140" height="44" rx="10" fill="oklch(var(--b1))" stroke={f.color} strokeWidth="1.75" />
        <circle cx="548" cy={flagY(i)} r="5" fill={f.color} />
        <text x="562" y={flagY(i) + 5} fontSize="13" fontWeight="700" fill={f.color}>
          {f.label}
        </text>
      </g>
    ))}
    <rect x={BROKER.x} y={BROKER.y} width={BROKER.w} height={BROKER.h} rx="12" fill="oklch(var(--bc))" />
    <text x={BROKER.x + 16} y={BROKER.y + 34} fontSize="13" fontWeight="700" fill="oklch(var(--b1))">
      Your broker
    </text>
    {["Post-summary correction", "Protest", "CAPE refund"].map((t, i) => (
      <text key={t} x={BROKER.x + 16} y={BROKER.y + 60 + i * 18} fontSize="11" fill="oklch(var(--b1)/0.75)">
        {t}
      </text>
    ))}
  </svg>
);
