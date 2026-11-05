"use client";

import { useMemo } from "react";
import type { HtsElement } from "@/interfaces/hts";
import { trimHtsTo8Digits } from "@/libs/cross-rulings";
import { CrossRulingsPanel } from "@/components/cross-rulings/CrossRulingsPanel";

export interface VerticalCandidateCrossRulingsTabProps {
  candidates: HtsElement[];
  /** Prefills the CROSS search box (e.g. product description). */
  articleDescription?: string;
  /** Callback to append text to classification notes. */
  onAddToNotes?: (text: string) => void;
  /** Evidence can be added and edited (the user's own classification, not final or read-only) */
  canEdit: boolean;
}

// The research panel's CROSS Rulings tab: a CROSS search for each candidate's code (8 digits, how
// rulings cite codes), a box for any other search, the ruling lookup and the saved evidence
export function VerticalCandidateCrossRulingsTab({
  candidates,
  articleDescription = "",
  onAddToNotes,
  canEdit,
}: VerticalCandidateCrossRulingsTabProps) {
  const searchTerms = useMemo(() => {
    const terms = new Set<string>();
    for (const c of candidates) {
      const raw = c.htsno?.trim() ?? "";
      if (raw.replace(/\D/g, "").length >= 4) terms.add(trimHtsTo8Digits(raw));
    }
    return Array.from(terms).sort();
  }, [candidates]);

  return (
    <CrossRulingsPanel
      // Back to the product description when the candidates change
      key={searchTerms.join("|")}
      searchTerms={searchTerms}
      defaultSearchText={articleDescription}
      surface="classify_step"
      canEdit={canEdit}
      onAddToNotes={onAddToNotes}
      compact
    />
  );
}
