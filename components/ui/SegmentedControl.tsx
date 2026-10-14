"use client";

// A small set of mutually exclusive options on one track, like a toggle between views.
// The selected option is raised onto the surface; the others sit on the inset track. Radii are
// fixed (not rounded-lg/md), so themes that remap those (the Tracker's) keep track and option
// matching: a slightly rounded track around slightly rounded options.
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "md",
  fullWidth = false,
  tone = "inset",
}: {
  // Names the group for screen readers
  label: string;
  // count: a number in a small pill after the label (how many there are to see); badge: a short
  // word after it ("Beta")
  options: readonly { id: T; label: string; title?: string; count?: number; badge?: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  // inset: on a grey track, the selected option raised in white. accent: a white track that
  // stands off a grey page, the selected option filled with the brand color (the calculator's tabs)
  tone?: "inset" | "accent";
}) {
  const accent = tone === "accent";
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`${fullWidth ? "flex w-full" : "inline-flex"} shrink-0 gap-0.5 rounded-[8px] p-0.5 ring-1 ring-inset ring-base-300 ${accent ? "bg-base-100 shadow-sm" : "bg-base-200"}`}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => onChange(option.id)}
            className={`${fullWidth ? "flex-1" : ""} ${size === "sm" ? "h-7 px-3" : "h-9 px-4"} whitespace-nowrap rounded-[6px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              active
                ? accent
                  ? "bg-primary text-primary-content shadow-sm"
                  : "bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
                : accent
                  ? "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                  : "text-base-content/70 hover:text-base-content"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={`ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums ${
                  active ? (accent ? "bg-primary-content/20 text-primary-content" : "bg-primary/10 text-primary") : "bg-base-content/10 text-base-content/70"
                }`}
              >
                {option.count}
              </span>
            )}
            {option.badge && (
              <span
                className={`ml-1.5 inline-flex items-center rounded-full px-1.5 text-[11px] font-semibold leading-[18px] ${
                  active && accent ? "bg-primary-content/20 text-primary-content" : "bg-warning/15 text-warning"
                }`}
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
