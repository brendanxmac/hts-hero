"use client";

import { useState } from "react";
import type { CrossRulingDetail } from "../../interfaces/cross-rulings";
import { fetchCrossRulingByNumber, normalizeRulingNumber } from "../../libs/cross-rulings";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import * as ui from "../ui/styles";

interface Props {
  surface: string;
  onFound: (ruling: CrossRulingDetail) => void;
  compact?: boolean;
}

// Paste a ruling number found on CROSS (N310000, NY N310000, HQ 960001, or its rulings.cbp.gov link)
// and read it here, to quote it or add it as evidence
export function RulingLookup({ surface, onFound, compact = false }: Props) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookUp = async () => {
    const rulingNumber = normalizeRulingNumber(value);
    if (!rulingNumber) {
      setError("That isn't a ruling number. They look like N310000, H290000 or 960001.");
      trackEvent(MixpanelEvent.CROSS_RULING_LOOKED_UP, { surface, result: "invalid" });
      return;
    }
    setLoading(true);
    setError(null);
    const result = await fetchCrossRulingByNumber(rulingNumber);
    setLoading(false);
    trackEvent(MixpanelEvent.CROSS_RULING_LOOKED_UP, { surface, result: result.status, ruling_number: rulingNumber });
    if (result.status === "found") {
      setValue("");
      onFound(result.ruling);
    } else if (result.status === "not_found") {
      setError(`CBP has no ruling numbered ${rulingNumber}. Check the number on CROSS and try again.`);
    } else {
      setError("CBP couldn't return that ruling right now. Try again in a minute.");
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          void lookUp();
        }}
      >
        <input
          type="text"
          aria-label="Ruling number"
          className={compact ? ui.inputSm : ui.input}
          placeholder="Paste a ruling number, e.g. NY N310000"
          value={value}
          disabled={loading}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
        />
        <button
          type="submit"
          className={ui.button({ variant: "primary", size: "sm" })}
          disabled={loading || !value.trim()}
        >
          {loading ? "Looking Up…" : "Look Up Ruling"}
        </button>
      </form>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
