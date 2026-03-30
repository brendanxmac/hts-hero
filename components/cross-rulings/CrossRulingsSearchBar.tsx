"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { classNames } from "../../utilities/style";

interface CrossRulingsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClear: () => void;
  /** Show Clear when a custom search is active (restores baseline / candidate groups). */
  canClear: boolean;
  disabled?: boolean;
  searching?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export function CrossRulingsSearchBar({
  value,
  onChange,
  onSubmitSearch,
  onClear,
  canClear,
  disabled = false,
  searching = false,
  placeholder = "Search CROSS…",
  compact = false,
}: CrossRulingsSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="relative flex-1 min-w-0">
        <MagnifyingGlassIcon
          className={classNames(
            "absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none",
            compact ? "w-3.5 h-3.5" : "w-4 h-4"
          )}
        />
        <input
          type="text"
          className={classNames(
            "w-full rounded-lg border border-base-300 bg-base-100 text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            compact ? "pl-8 pr-3 py-2 text-xs" : "pl-9 pr-3 py-2.5 text-sm"
          )}
          placeholder={placeholder}
          value={value}
          disabled={disabled || searching}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmitSearch();
            }
          }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 shrink-0">
        <button
          type="button"
          className={classNames(
            "btn btn-primary",
            compact ? "btn-xs" : "btn-sm"
          )}
          disabled={disabled || searching || !value.trim()}
          onClick={onSubmitSearch}
        >
          {searching ? "Searching…" : "Search"}
        </button>
        {canClear && (
          <button
            type="button"
            className={classNames(
              "btn btn-ghost gap-1",
              compact ? "btn-xs" : "btn-sm"
            )}
            disabled={searching}
            onClick={onClear}
          >
            <XMarkIcon className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
