"use client";

import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";

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
    className={`flex h-full flex-col gap-2 rounded-md border bg-base-100 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:bg-base-200 ${
      selected ? "border-primary ring-1 ring-primary" : "border-base-300 hover:border-primary/40"
    }`}
  >
    <span className="flex w-full items-start justify-between gap-3">
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-primary" : "border-base-content/30"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
        </span>
        <span className="text-sm font-semibold text-base-content">{title}</span>
      </span>
      {badge}
    </span>
    <span className="pl-6 text-base font-semibold tabular-nums text-base-content">{price}</span>
    <span className={`${ui.caption} pl-6`}>{detail}</span>
  </button>
);
