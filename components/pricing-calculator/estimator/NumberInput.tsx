"use client";

import { useEffect, useState } from "react";
import * as ui from "@/components/ui/styles";

// A whole-number input that lets the field be mid-edit (empty, or below the minimum while
// typing) and only reports values within [min, max]. It snaps back on blur.
export const NumberInput = ({
  id,
  value,
  onChange,
  min,
  max,
  className = "text-right",
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  className?: string;
}) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(e) => {
        const text = e.target.value.replace(/[^\d]/g, "");
        setDraft(text);
        const n = Number(text);
        if (text !== "" && n >= min) onChange(Math.min(max, n));
      }}
      onBlur={() => setDraft(String(value))}
      className={`${ui.input} tabular-nums ${className}`}
    />
  );
};
