"use client";

import { ReactNode } from "react";

// One choice in a radio group of cards: a title, its price and a line on what it includes
export const OptionCard = ({
  title,
  price,
  detail,
  badge,
  selected,
  disabled = false,
  onSelect,
}: {
  title: string;
  price: ReactNode;
  detail: ReactNode;
  badge?: ReactNode;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    disabled={disabled}
    onClick={onSelect}
    className={`flex h-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-tt-soft disabled:opacity-60 sm:p-5 ${
      selected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-base-300 bg-base-100 hover:border-base-300 hover:bg-tt-soft"
    }`}
  >
    <span className="flex w-full flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={`flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-primary bg-base-100" : "border-base-300 bg-base-100"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
        </span>
        <span className="text-base font-semibold text-base-content">{title}</span>
      </span>
      {badge}
    </span>
    <span className="pl-7 text-lg font-bold tabular-nums text-base-content">{price}</span>
    <span className="pl-7 text-sm leading-relaxed text-base-content/70">{detail}</span>
  </button>
);
