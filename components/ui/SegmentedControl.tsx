"use client";

// A small set of mutually exclusive options on one track, like a toggle between views.
// The selected option is raised onto the surface; the others sit on the inset track.
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "md",
  fullWidth = false,
}: {
  // Names the group for screen readers
  label: string;
  options: readonly { id: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`${fullWidth ? "flex w-full" : "inline-flex"} shrink-0 gap-0.5 rounded-lg bg-base-200 p-0.5 ring-1 ring-inset ring-base-300`}
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
            className={`${fullWidth ? "flex-1" : ""} ${size === "sm" ? "h-7 px-3" : "h-9 px-4"} whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              active
                ? "bg-base-100 text-base-content shadow-sm ring-1 ring-base-300"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
