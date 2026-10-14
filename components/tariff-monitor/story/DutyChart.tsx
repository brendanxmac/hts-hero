import { PROGRAM } from "@/components/ui/marketing";

// An annotated step chart of one real product's duty: steel hardware (HTS 7326.90.86.88) from
// China, per the engine's verified history. 47.9% from Nov 17, 2025; 37.9% from Feb 24, 2026, when
// the IEEPA duties ended and Section 122 began; 77.9% from Apr 6, 2026, when Section 232 metals
// duty of 50% replaced Section 122.

const W = 640;
const H = 320;
const PAD = { l: 44, r: 16, t: 28, b: 36 };
const X0 = Date.UTC(2025, 10, 17);
const X1 = Date.UTC(2026, 9, 10);
const x = (iso: string) => PAD.l + ((Date.parse(`${iso}T00:00:00Z`) - X0) / (X1 - X0)) * (W - PAD.l - PAD.r);
const y = (pct: number) => PAD.t + (1 - pct / 100) * (H - PAD.t - PAD.b);

const STEPS = [
  { from: "2025-11-17", pct: 47.9 },
  { from: "2026-02-24", pct: 37.9 },
  { from: "2026-04-06", pct: 77.9 },
];
const END = "2026-10-10";
const line = STEPS.map((s, i) => `${i ? "L" : "M"} ${x(s.from)} ${y(s.pct)} L ${x(STEPS[i + 1]?.from ?? END)} ${y(s.pct)}`).join(" ");
const area = `${line} L ${x(END)} ${y(0)} L ${x(STEPS[0].from)} ${y(0)} Z`;

const NOTES = [
  { at: "2026-02-24", pct: 37.9, lines: ["Feb 24: IEEPA ends,", "Section 122 begins"], dy: 30, color: PROGRAM["Section 122"] },
  { at: "2026-04-06", pct: 77.9, lines: ["Apr 6: Section 232 metals +50%"], dy: -14, color: PROGRAM["Section 232"] },
];
const TICKS = [
  ["2025-12-01", "Dec"],
  ["2026-02-01", "Feb"],
  ["2026-04-01", "Apr"],
  ["2026-06-01", "Jun"],
  ["2026-08-01", "Aug"],
  ["2026-10-01", "Oct"],
];

export const DutyChart = () => (
  <svg
    viewBox={`0 0 ${W} ${H}`}
    className="h-auto w-full"
    role="img"
    aria-label="Duty on steel hardware from China: 47.9% from Nov 17, 2025, 37.9% from Feb 24, 2026, and 77.9% from Apr 6, 2026"
  >
    <defs>
      <linearGradient id="duty-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="oklch(var(--p))" stopOpacity="0.22" />
        <stop offset="100%" stopColor="oklch(var(--p))" stopOpacity="0" />
      </linearGradient>
    </defs>
    {[0, 25, 50, 75, 100].map((p) => (
      <g key={p}>
        <line x1={PAD.l} x2={W - PAD.r} y1={y(p)} y2={y(p)} stroke="oklch(var(--b3))" strokeDasharray={p ? "3 5" : undefined} />
        <text x={PAD.l - 8} y={y(p) + 4} textAnchor="end" fontSize="11" fill="oklch(var(--bc)/0.6)">
          {p}%
        </text>
      </g>
    ))}
    {TICKS.map(([d, label]) => (
      <text key={d} x={x(d)} y={H - 12} textAnchor="middle" fontSize="11" fill="oklch(var(--bc)/0.6)">
        {label}
      </text>
    ))}
    <path d={area} fill="url(#duty-area)" />
    <path d={line} fill="none" stroke="oklch(var(--bc))" strokeWidth="3" strokeLinejoin="round" />
    {NOTES.map((n) => (
      <g key={n.at}>
        <circle cx={x(n.at)} cy={y(n.pct)} r="6" fill={n.color} stroke="white" strokeWidth="2" />
        {n.lines.map((t, i) => (
          <text key={t} x={x(n.at) + 12} y={y(n.pct) + n.dy + i * 16} fontSize="13" fontWeight="600" fill={n.color}>
            {t}
          </text>
        ))}
      </g>
    ))}
    <text x={x(STEPS[0].from) + 4} y={y(47.9) - 10} fontSize="13" fontWeight="700" fill="oklch(var(--bc))">
      47.9%
    </text>
    <text x={x(END) - 4} y={y(77.9) - 10} textAnchor="end" fontSize="13" fontWeight="700" fill="oklch(var(--bc))">
      77.9%
    </text>
  </svg>
);
