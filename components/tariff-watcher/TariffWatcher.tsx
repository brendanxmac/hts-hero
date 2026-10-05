"use client";

import { useDeferredValue, useEffect, useMemo, useRef } from "react";
import { Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { useHts } from "../../contexts/HtsContext";
import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { TariffFinder } from "../duty-calculator/lib/useTariffFinder";
import * as ui from "@/components/ui/styles";
import { EmptyReport } from "./EmptyReport";
import { EXAMPLE_LIST } from "./exampleList";
import { parseWatchList } from "./parse";
import { watchProduct } from "./report";
import { TariffReport } from "./TariffReport";
import { WatchListRail } from "./WatchListRail";

// Tariff Watcher: the current duty rate for every product on a list, one after another.
// The list is "HTS code, country" per line; the report updates as it's edited.

export const TariffWatcher = ({
  f,
  text,
  onTextChange,
  onOpenInCalculator,
}: {
  f: TariffFinder;
  text: string;
  onTextChange: (text: string) => void;
  onOpenInCalculator: (element: HtsElement, country: Country) => void;
}) => {
  const { htsElements } = useHts();
  // Big lists stay responsive while typing; the report catches up
  const listText = useDeferredValue(text);

  const byDigits = useMemo(() => {
    const map = new Map<string, HtsElement>();
    htsElements.forEach((el) => {
      const digits = htsCodeDigitsOnly(el.htsno);
      if (digits.length === 8 || digits.length === 10) map.set(digits, el);
    });
    return map;
  }, [htsElements]);

  const parsed = useMemo(
    () => (byDigits.size ? parseWatchList(listText, (digits) => byDigits.get(digits)) : { entries: [], errors: [] }),
    [listText, byDigits]
  );

  const rows = useMemo(
    () => parsed.entries.map((entry) => watchProduct(entry, htsElements, f.entryDate)),
    [parsed, htsElements, f.entryDate]
  );

  // Counted once the list settles
  const lastTracked = useRef("");
  useEffect(() => {
    const key = `${parsed.entries.length}/${parsed.errors.length}`;
    if (!parsed.entries.length || lastTracked.current === key) return;
    const timeout = setTimeout(() => {
      lastTracked.current = key;
      trackEvent(MixpanelEvent.TARIFF_WATCHER_LIST_CHANGED, {
        products: parsed.entries.length,
        errors: parsed.errors.length,
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [parsed]);

  const loadExample = () => {
    onTextChange(EXAMPLE_LIST);
    trackEvent(MixpanelEvent.TARIFF_WATCHER_EXAMPLE_USED);
  };

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <WatchListRail
        f={f}
        text={text}
        onTextChange={onTextChange}
        onExample={loadExample}
        count={parsed.entries.length}
        errors={parsed.errors}
      />
      <div className="min-w-0">
        {f.loading ? (
          <div className={`${ui.card} flex flex-col gap-3 p-5`} aria-busy="true" aria-label="Loading HTS data">
            <div className={`${ui.skeleton} h-7 w-48`} />
            <div className={`${ui.skeleton} h-24 w-full`} />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={`${ui.skeleton} h-14 w-full`} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyReport hasText={Boolean(text.trim())} onExample={loadExample} />
        ) : (
          <TariffReport f={f} rows={rows} skipped={parsed.errors.length} onOpenInCalculator={onOpenInCalculator} />
        )}
      </div>
    </div>
  );
};
