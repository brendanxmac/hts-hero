"use client";

import { useEffect, useRef, useState } from "react";
import { CalculationResult, DutyLine } from "@/tariffs/engine-v2/types";
import { RowChange } from "../results/rowTypes";

// What the last answer or trade program changed in the duty lines: which were added, which moved
// and by how much, and which were switched off, plus the total before. Only answers and trade
// programs count: a new code, origin, value, date or transport (the `inputsKey`) starts over.
export interface LineChanges {
  byCode: Record<string, RowChange>;
  removed: DutyLine[];
  totalDutyBefore: number;
}

const appliedByCode = (result: CalculationResult) => {
  const map = new Map<string, DutyLine>();
  map.set("Base", result.base);
  result.lines.filter((l) => l.status === "applies").forEach((l) => map.set(l.code, l));
  return map;
};

export const useLineChanges = (result: CalculationResult | null, inputsKey: string) => {
  const previous = useRef<{ key: string; result: CalculationResult } | null>(null);
  const [changes, setChanges] = useState<LineChanges | null>(null);

  useEffect(() => {
    if (!result) return;
    const prev = previous.current;
    previous.current = { key: inputsKey, result };
    if (!prev || prev.key !== inputsKey) {
      setChanges(null);
      return;
    }
    if (prev.result === result) return;
    const before = appliedByCode(prev.result);
    const now = appliedByCode(result);
    const byCode: Record<string, RowChange> = {};
    now.forEach((line, code) => {
      const was = before.get(code);
      if (!was) byCode[code] = { kind: "added" };
      else if (Math.abs(was.amount - line.amount) >= 0.005) byCode[code] = { kind: "changed", before: was.amount };
    });
    const removed = Array.from(before.entries())
      .filter(([code]) => !now.has(code))
      .map(([, line]) => line);
    const moved = Object.keys(byCode).length > 0 || removed.length > 0 || Math.abs(prev.result.totalDuty - result.totalDuty) >= 0.005;
    setChanges(moved ? { byCode, removed, totalDutyBefore: prev.result.totalDuty } : null);
  }, [result, inputsKey]);

  return { changes, clear: () => setChanges(null) };
};
