"use client";

// The views of one thing (an answer's Duty · AD/CVD · Compare…, an import's tabs), as a row of
// pills in its header card: the open one tinted in the brand color, the rest plain with a soft
// hover. Pills, not an underline, because the header is a card of its own with the views' modules
// below it on the ground, so there's no edge for a line to sit on. For a small toggle between views
// inside content, use SegmentedControl.
export function TabBar<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  // Names the tabs for screen readers
  label: string;
  // count: a number in a small pill after the label (how many there are to see); badge: a short
  // word or figure after it ("AD/CVD may apply" in amber, "Up to $3,750" in green, "Soon" in gray)
  options: readonly { id: T; label: string; title?: string; count?: number; badge?: string; badgeTone?: "warning" | "success" | "neutral" }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="-mx-1 flex gap-1 overflow-x-auto px-1 py-0.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={option.title}
            onClick={() => onChange(option.id)}
            className={`inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${
              active ? "bg-primary/10 font-semibold text-primary" : "text-base-content/70 hover:bg-tt-soft hover:text-base-content"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={`ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums ${
                  active ? "bg-primary/10 text-primary" : "bg-base-content/10 text-base-content/70"
                }`}
              >
                {option.count}
              </span>
            )}
            {option.badge && (
              <span
                className={`ml-1.5 inline-flex items-center rounded-full px-1.5 text-[11px] font-semibold leading-[18px] ${option.badgeTone === "success" ? "bg-success/10 text-success" : option.badgeTone === "neutral" ? "bg-base-content/10 text-base-content/60" : "bg-warning/15 text-warning"}`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
