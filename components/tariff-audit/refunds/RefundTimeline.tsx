import { PROGRAM } from "@/components/ui/marketing";

// The refundable tariffs on a timeline, Feb 2025 to Oct 2026: when IEEPA and Section 122 duties
// applied, the rulings and refund milestones, and the span HTS Hero has verified rates for.
// Dates are from the refund research (tariffs/engine-v2/REFUNDS.md, checked Oct 10, 2026).

const W = 1000;
const H = 230;
const PAD = { l: 20, r: 20 };
const X0 = Date.UTC(2025, 1, 1);
const X1 = Date.UTC(2026, 9, 31);
const x = (iso: string) => PAD.l + ((Date.parse(`${iso}T00:00:00Z`) - X0) / (X1 - X0)) * (W - PAD.l - PAD.r);

const BARS = [
  { label: "IEEPA tariffs", from: "2025-02-04", to: "2026-02-24", y: 60, color: PROGRAM.IEEPA },
  { label: "Section 122 surcharge", from: "2026-02-24", to: "2026-07-24", y: 104, color: PROGRAM["Section 122"] },
];

// Numbered on the chart; the legend under it (in RefundGroups) gives each one's date and meaning
export const TIMELINE_EVENTS = [
  { at: "2026-02-20", date: "Feb 20, 2026", label: "Supreme Court holds IEEPA doesn't authorize tariffs" },
  { at: "2026-04-20", date: "Apr 20, 2026", label: "CBP opens IEEPA refunds in ACE (CAPE)" },
  { at: "2026-05-07", date: "May 7, 2026", label: "Court of International Trade holds Section 122 invalid" },
  { at: "2026-06-11", date: "Jun 11, 2026", label: "Federal Circuit stays that ruling during the appeal" },
];

const TICKS = ["2025-04-01", "2025-07-01", "2025-10-01", "2026-01-01", "2026-04-01", "2026-07-01", "2026-10-01"];
const tickLabel = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

export const RefundTimeline = ({ verifiedFrom }: { verifiedFrom: string }) => (
  <svg
    viewBox={`0 0 ${W} ${H - 20}`}
    className="h-auto w-full"
    role="img"
    aria-label="IEEPA tariffs applied from Feb 4, 2025 to Feb 23, 2026 and are being refunded; the Section 122 surcharge applied from Feb 24 to Jul 24, 2026 and its refund is under appeal"
  >
    <rect x={x(verifiedFrom)} y={30} width={x("2026-10-31") - x(verifiedFrom)} height={110} rx={10} fill="oklch(var(--p)/0.12)" opacity={0.6} />
    <text x={x(verifiedFrom) + 10} y={24} fontSize="12" fontWeight="700" fill="oklch(var(--p))">
      Verified by HTS Hero from {new Date(`${verifiedFrom}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
    </text>
    {BARS.map((b) => (
      <g key={b.label}>
        <rect x={x(b.from)} y={b.y} width={x(b.to) - x(b.from)} height={28} rx={8} fill={b.color} />
        <text x={x(b.from) + 12} y={b.y + 19} fontSize="13" fontWeight="700" fill="oklch(var(--b1))">
          {b.label}
        </text>
      </g>
    ))}
    <line x1={PAD.l} x2={W - PAD.r} y1={160} y2={160} stroke="oklch(var(--b3))" />
    {TICKS.map((t) => (
      <g key={t}>
        <line x1={x(t)} x2={x(t)} y1={156} y2={164} stroke="oklch(var(--b3))" />
        <text x={x(t)} y={190} textAnchor="middle" fontSize="11" fill="oklch(var(--bc)/0.6)">
          {tickLabel(t)}
        </text>
      </g>
    ))}
    {TIMELINE_EVENTS.map((e, i) => (
      <g key={e.at}>
        <line x1={x(e.at)} x2={x(e.at)} y1={40} y2={150} stroke="oklch(var(--bc))" strokeDasharray="2 3" />
        <circle cx={x(e.at)} cy={160} r={10} fill="oklch(var(--bc))" />
        <text x={x(e.at)} y={164} textAnchor="middle" fontSize="11" fontWeight="700" fill="oklch(var(--b1))">
          {i + 1}
        </text>
      </g>
    ))}
  </svg>
);
