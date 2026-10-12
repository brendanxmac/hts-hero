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
    className={`flex h-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 sm:p-5 ${
      selected ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    <span className="flex w-full flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={`flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-teal-600 bg-white" : "border-slate-300 bg-white"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-teal-600" />}
        </span>
        <span className="text-base font-semibold text-slate-900">{title}</span>
      </span>
      {badge}
    </span>
    <span className="pl-7 text-lg font-bold tabular-nums text-slate-900">{price}</span>
    <span className="pl-7 text-sm leading-relaxed text-slate-600">{detail}</span>
  </button>
);
