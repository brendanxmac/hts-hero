"use client";

import * as ui from "@/components/ui/styles";

// Tabs within a view (a product's Duty / Analysis / Entries, the calculator's Duty / Analysis):
// an underlined row, lighter than the sidebar's sections
export function SubTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
}: {
  label: string;
  tabs: { id: T; label: string; soon?: boolean; disabled?: boolean }[];
  value: T;
  onChange: (tab: T) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 border-b border-base-300">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          disabled={t.disabled}
          className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${
            value === t.id
              ? "border-primary text-primary"
              : "border-transparent text-base-content/70 hover:text-base-content"
          }`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.soon && <span className={ui.badge()}>Soon</span>}
        </button>
      ))}
    </div>
  );
}
