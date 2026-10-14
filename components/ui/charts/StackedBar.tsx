"use client";

// Parts of one whole as a single stacked bar, with a legend of each part's value and share: the
// one stacked bar on every page (the calculator's Cost Breakdown, an import's duty, the catalog
// list, comparisons). Colors come from the caller (partColors in ./partColors, or the theme's
// chart colors). Pass highlight and onHighlight to bring one part forward and fade the rest.
//
// Segments share the bar by flex-grow, not percentage widths, so each keeps a sliver of at least
// 4px and the 2px gaps between them never push the total past the bar and clip the last part.
// `fill` draws the whole bar shorter (on a shared scale with others: a lower rate, a shorter bar).
export type StackedBarPart = { label: string; amount: number; color: string };

const HEIGHTS = { xs: "h-2.5", sm: "h-3.5", md: "h-5" };

export function StackedBar({
  parts,
  formatValue,
  size = "md",
  shape = "rounded",
  fill = 1,
  legend = true,
  highlight,
  onHighlight,
  className = "",
}: {
  parts: StackedBarPart[];
  formatValue: (amount: number) => string;
  size?: "xs" | "sm" | "md";
  // rounded: slightly rounded ends (the calculator); pill: fully round (the Tracker)
  shape?: "rounded" | "pill";
  // How much of the track the bar fills, from 0 to 1 (bars on a shared scale)
  fill?: number;
  // The list of parts under the bar; off where the host lists them itself
  legend?: boolean;
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
  className?: string;
}) {
  const shown = parts.filter((p) => p.amount > 0);
  const total = shown.reduce((sum, p) => sum + p.amount, 0);
  const round = shape === "pill" ? "rounded-full" : "rounded-md";
  // Nothing to stack (duty free): the empty track, so rows of bars stay in line
  if (total <= 0) return legend ? null : <div className={`${HEIGHTS[size]} w-full ${round} bg-base-300 ${className}`} aria-hidden />;
  const share = (amount: number) => `${Math.round((amount / total) * 1000) / 10}%`;
  // Opacity is a runtime value, so it's set inline
  const fade = (label: string) => ({ opacity: highlight && highlight !== label ? 0.22 : 1 });
  const interactive = onHighlight ? "cursor-pointer transition-opacity" : "";

  return (
    <div className={`flex flex-col ${size === "md" ? "gap-2.5" : "gap-2"} ${className}`} onMouseLeave={() => onHighlight?.(null)}>
      <div className={`flex ${HEIGHTS[size]} w-full overflow-hidden ${round} bg-base-300`} aria-hidden>
        {/* Runtime widths and series colors (DESIGN_SYSTEM §10) */}
        <div className={`flex h-full gap-0.5 overflow-hidden ${round}`} style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }}>
          {shown.map((p) => (
            <div
              key={p.label}
              className={`h-full min-w-1 ${interactive}`}
              style={{ flexGrow: p.amount, flexBasis: 0, background: p.color, ...fade(p.label) }}
              title={`${p.label}: ${formatValue(p.amount)}`}
              onMouseEnter={() => onHighlight?.(p.label)}
            />
          ))}
        </div>
      </div>
      {legend && (
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm tabular-nums">
          {shown.map((p) => (
            <li
              key={p.label}
              className={`flex items-center gap-1.5 ${interactive}`}
              style={fade(p.label)}
              onMouseEnter={() => onHighlight?.(p.label)}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: p.color }} aria-hidden />
              <span className="text-base-content/70">{p.label}</span>
              <span className="font-semibold text-base-content">{formatValue(p.amount)}</span>
              <span className="text-base-content/60">{share(p.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
