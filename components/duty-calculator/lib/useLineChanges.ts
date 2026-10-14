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
  // What the user did, in plain English ("Claiming the United States-Chile Free Trade Agreement")
  cause?: string;
  // The adjustment they changed, for the summary to sit under: a question, or a trade program
  source?: ChangeSource;
  // What happened to the lines, in plain English ("Base duty: 2.9% ($290.00) → Free ($0.00)")
  details: string[];
}

export type ChangeSource = { kind: "question" | "preference"; id: string };

const rateText = (l: DutyLine) => (l.ratePct === undefined ? "" : l.ratePct === 0 ? "Free" : `${Math.round(l.ratePct * 100) / 100}%`);
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const answeredIds = (r: CalculationResult) => new Set(r.questions.filter((q) => q.answered).map((q) => q.input.id));

// What the user changed between two results: a trade program claimed or dropped, or a question
// answered or cleared
const causeOf = (prev: CalculationResult, now: CalculationResult): { cause?: string; source?: ChangeSource } => {
  const pref = (r: CalculationResult, symbol?: string) => r.availablePreferences.find((p) => p.symbol === symbol)?.name ?? symbol;
  if (now.claimedPreference && now.claimedPreference !== prev.claimedPreference)
    return { cause: `Claiming ${pref(now, now.claimedPreference)}`, source: { kind: "preference", id: now.claimedPreference } };
  if (prev.claimedPreference && !now.claimedPreference)
    return { cause: `Dropping ${pref(prev, prev.claimedPreference)}`, source: { kind: "preference", id: prev.claimedPreference } };
  const before = answeredIds(prev);
  const after = answeredIds(now);
  const label = (r: CalculationResult, id: string) => {
    if (id.startsWith("confirm:")) {
      const code = id.slice("confirm:".length);
      const name = [...r.lines, ...prev.lines].find((l) => l.code === code)?.name;
      return `${code}${name ? ` (${name})` : ""}`;
    }
    return `“${(r.questions.find((q) => q.input.id === id)?.input.label ?? id).replace(/\?$/, "")}”`;
  };
  const added = Array.from(after).find((id) => !before.has(id));
  if (added)
    return {
      cause: added.startsWith("confirm:") ? `Confirming ${label(now, added)}` : `Answering yes to ${label(now, added)}`,
      source: { kind: "question", id: added },
    };
  const cleared = Array.from(before).find((id) => !after.has(id));
  if (cleared)
    return {
      cause: cleared.startsWith("confirm:") ? `Unconfirming ${label(prev, cleared)}` : `Clearing ${label(prev, cleared)}`,
      source: { kind: "question", id: cleared },
    };
  return {};
};

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
    const details: string[] = [];
    const nameOf = (code: string, line: DutyLine) => (code === "Base" ? "Base duty" : `${code} (${line.name})`);
    now.forEach((line, code) => {
      const c = byCode[code];
      if (!c) return;
      if (c.kind === "added") details.push(`${nameOf(code, line)} now applies${line.amount > 0.005 ? `, adding ${usd(line.amount)}` : ""}`);
      else {
        const was = before.get(code)!;
        details.push(`${nameOf(code, line)}: ${rateText(was)} (${usd(was.amount)}) → ${rateText(line)} (${usd(line.amount)})`);
      }
    });
    removed.forEach((line) => details.push(`${nameOf(line.code, line)} is switched off${line.amount > 0.005 ? `, removing ${usd(line.amount)}` : ""}`));
    const moved = Object.keys(byCode).length > 0 || removed.length > 0 || Math.abs(prev.result.totalDuty - result.totalDuty) >= 0.005;
    setChanges(moved ? { byCode, removed, totalDutyBefore: prev.result.totalDuty, ...causeOf(prev.result, result), details } : null);
  }, [result, inputsKey]);

  return { changes, clear: () => setChanges(null) };
};
