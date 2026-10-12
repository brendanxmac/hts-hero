"use client";

import { useEffect, useRef, useState } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { formatMoney } from "../lib/format";

// How much the total just moved (after an answer, a preference or any input), shown for a few
// seconds; null when it hasn't changed lately
export const useTotalDelta = (totalDuty: number) => {
  const previous = useRef(totalDuty);
  const [delta, setDelta] = useState<{ amount: number; at: number } | null>(null);
  useEffect(() => {
    const amount = totalDuty - previous.current;
    previous.current = totalDuty;
    if (Math.abs(amount) < 0.005) return;
    const at = Date.now();
    setDelta({ amount, at });
    const timer = setTimeout(() => setDelta((d) => (d?.at === at ? null : d)), 6000);
    return () => clearTimeout(timer);
  }, [totalDuty]);
  return delta;
};

export const DeltaChip = ({ delta }: { delta: { amount: number; at: number } | null }) =>
  delta ? (
    <span
      key={delta.at}
      role="status"
      className={`${tt.chip(delta.amount < 0 ? "success" : "warning")} w-fit tabular-nums`}
    >
      {delta.amount < 0 ? "−" : "+"}
      {formatMoney(Math.abs(delta.amount))} {delta.amount < 0 ? "lower" : "higher"}
    </span>
  ) : null;
