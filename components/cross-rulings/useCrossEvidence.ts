"use client";

import { useCallback } from "react";
import { useClassification } from "../../contexts/ClassificationContext";
import type { CrossEvidence, CrossRulingDetail } from "../../interfaces/cross-rulings";
import { rulingToEvidence } from "../../libs/cross-rulings";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";

// The rulings saved as evidence on the open classification. Changes go through the classification,
// so they save with it (the context's debounced save), in its `crossEvidence` field.
export function useCrossEvidence(surface: string) {
  const { classification, classificationId, setClassification } = useClassification();
  const evidence: CrossEvidence[] = classification?.crossEvidence ?? [];

  const hasEvidence = useCallback(
    (rulingNumber: string) => evidence.some((e) => e.rulingNumber === rulingNumber),
    [evidence]
  );

  const addEvidence = useCallback(
    (ruling: CrossRulingDetail) => {
      setClassification((prev) => {
        const current = prev.crossEvidence ?? [];
        // One entry per ruling
        if (current.some((e) => e.rulingNumber === ruling.rulingNumber)) return prev;
        return { ...prev, crossEvidence: [...current, rulingToEvidence(ruling)] };
      });
      trackEvent(MixpanelEvent.CROSS_EVIDENCE_ADDED, {
        surface,
        ruling_number: ruling.rulingNumber,
        classification_id: classificationId,
      });
    },
    [setClassification, surface, classificationId]
  );

  const removeEvidence = useCallback(
    (rulingNumber: string) => {
      setClassification((prev) => ({
        ...prev,
        crossEvidence: (prev.crossEvidence ?? []).filter((e) => e.rulingNumber !== rulingNumber),
      }));
      trackEvent(MixpanelEvent.CROSS_EVIDENCE_REMOVED, {
        surface,
        ruling_number: rulingNumber,
        classification_id: classificationId,
      });
    },
    [setClassification, surface, classificationId]
  );

  const updateNote = useCallback(
    (rulingNumber: string, note: string) => {
      setClassification((prev) => ({
        ...prev,
        crossEvidence: (prev.crossEvidence ?? []).map((e) =>
          e.rulingNumber === rulingNumber ? { ...e, note } : e
        ),
      }));
    },
    [setClassification]
  );

  return { evidence, hasEvidence, addEvidence, removeEvidence, updateNote };
}
