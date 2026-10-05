"use client";

// Parts of one whole as a single stacked bar, with a legend of each part's value and share.
// Colors come from the caller (CHART_COLORS / FEES_COLOR in @/components/ui/theme). Pass
// highlight and onHighlight to bring one part forward and fade the rest.
export type StackedBarPart = { label: string; amount: number; color: string };

export function StackedBar({
  parts,
  formatValue,
  size = "md",
  highlight,
  onHighlight,
  className = "",
}: {
  parts: StackedBarPart[];
  formatValue: (amount: number) => string;
  size?: "sm" | "md";
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
  className?: string;
}) {
  const shown = parts.filter((p) => p.amount > 0);
  const total = shown.reduce((sum, p) => sum + p.amount, 0);
  if (total <= 0) return null;
  const share = (amount: number) => `${Math.round((amount / total) * 1000) / 10}%`;
  // Opacity is a runtime value, so it's set inline
  const fade = (label: string) => ({ opacity: highlight && highlight !== label ? 0.22 : 1 });
  const interactive = onHighlight ? "cursor-pointer transition-opacity" : "";

  return (
    <div className={`flex flex-col ${size === "sm" ? "gap-2" : "gap-2.5"} ${className}`} onMouseLeave={() => onHighlight?.(null)}>
      <div className={`flex ${size === "sm" ? "h-3.5" : "h-5"} w-full gap-0.5 overflow-hidden rounded-md bg-base-300`} aria-hidden>
        {shown.map((p) => (
          <div
            key={p.label}
            className={`h-full min-w-1 ${interactive}`}
            style={{ width: `${(p.amount / total) * 100}%`, background: p.color, ...fade(p.label) }}
            onMouseEnter={() => onHighlight?.(p.label)}
          />
        ))}
      </div>
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
    </div>
  );
}
