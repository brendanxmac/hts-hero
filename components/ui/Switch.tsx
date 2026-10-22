"use client";

import { useId } from "react";

// An on/off setting with its label beside it: the whole row toggles. For a setting that's either
// on or off (not a choice between views, which is a SegmentedControl).
export const Switch = ({
  label,
  checked,
  onChange,
  title,
  className = "",
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  // What turning it on does, on hover
  title?: string;
  className?: string;
}) => {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={id}
      onClick={() => onChange(!checked)}
      title={title}
      className={`group inline-flex h-8 cursor-pointer items-center gap-2.5 rounded-full pl-1 pr-1.5 text-sm font-medium text-base-content/80 outline-hidden transition-colors hover:text-base-content focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
    >
      <span id={id} className="whitespace-nowrap">
        {label}
      </span>
      <span
        aria-hidden
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-base-300 group-hover:bg-base-content/20"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-base-100 shadow-xs ring-1 ring-base-content/5 transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"
            }`}
        />
      </span>
    </button>
  );
};
