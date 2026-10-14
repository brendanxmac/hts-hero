"use client";

import { useEffect, useState } from "react";
import { useTracker } from "../../TrackerContext";

// How many shipments of a product a year, for yearly savings. Saved to the catalog item as it's
// typed (1 when left empty).
export const ShipmentsPerYearField = ({ productKey }: { productKey: string }) => {
  const { itemFor, setProductMeta } = useTracker();
  const saved = itemFor(productKey)?.shipmentsPerYear;
  const [text, setText] = useState(saved ? String(saved) : "");
  useEffect(() => setText(saved ? String(saved) : ""), [saved]);

  const change = (value: string) => {
    setText(value);
    const n = Math.round(Number(value));
    setProductMeta(productKey, { shipmentsPerYear: value.trim() && n > 1 ? Math.min(n, 100000) : undefined });
  };

  return (
    <label className="flex items-center gap-2 text-sm text-base-content/70">
      <input
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        className="h-8 w-20 rounded-full border border-base-300 bg-base-100 px-3 text-right text-sm tabular-nums text-base-content focus:outline-none focus:ring-2 focus:ring-primary/40"
        value={text}
        placeholder="1"
        onChange={(e) => change(e.target.value)}
      />
      shipments a year
    </label>
  );
};
