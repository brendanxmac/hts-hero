"use client";

import { useEffect, useMemo, useRef } from "react";
import { ExploreModal } from "@/components/duty-calculator/calculator";
import { CountryField, HtsCodeField } from "@/components/duty-calculator/fields";
import { EXAMPLES, useTariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import { RateHistoryCard } from "@/components/duty-calculator/rate-history";
import { slices } from "@/components/duty-calculator/results";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";
import { TrackProductButton } from "./TrackProductButton";

// The hero's hands-on demo: pick a product and see every change to its duty across the verified
// HTS revisions, then start tracking it. Opens on an example so the chart is never empty.
export const TryItCard = () => {
  const f = useTariffFinder({ path: "/tariff-monitor", syncAddress: false, track: false });
  const seeded = useRef(false);

  // Retried until the HTS data is in and the example is selected; after that the visitor's
  // choices stand, even an empty field
  useEffect(() => {
    if (seeded.current) return;
    if (f.selectedElement) {
      seeded.current = true;
      return;
    }
    if (!f.loading) f.selectExample(EXAMPLES[0]);
  }, [f]);

  // Count each product the visitor checks after the example
  const checked = useRef<string | null>(null);
  const productKey = f.selectedElement && f.country ? `${f.selectedElement.htsno}-${f.country.code}` : null;
  useEffect(() => {
    if (!productKey || !seeded.current) return;
    if (checked.current !== null && checked.current !== productKey) {
      trackEvent(MixpanelEvent.TARIFF_MONITOR_PRODUCT_CHECKED, {
        hts_code: f.selectedElement?.htsno,
        country_code: f.country?.code,
      });
    }
    checked.current = productKey;
  }, [productKey, f.selectedElement, f.country]);

  const sliceColors = useMemo(
    () =>
      f.result
        ? slices(f.result)
            .filter((s) => s.amount > 0)
            .reduce<Record<string, string>>((colors, s) => ({ ...colors, [s.label]: s.color }), {})
        : {},
    [f.result]
  );

  const changes = Math.max(0, f.history.length - 1);
  const ready = Boolean(f.result && f.selectedElement && f.country && !f.loading);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className={ui.cardOverflowVisible}>
        <div className="flex flex-col gap-4 p-5">
          <div>
            <h2 className={ui.cardTitle}>Try it on one of your products</h2>
            <p className={`${ui.caption} mt-0.5`}>See every change to its US duty, then track it.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <label className="flex min-w-0 flex-col gap-1.5" htmlFor="tm-hts">
              <span className={ui.fieldLabel}>HTS code</span>
              <HtsCodeField
                id="tm-hts"
                selectedElement={f.selectedElement}
                onSelect={(el) => f.selectElement(el, "hts_selector")}
                hidePath
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5" htmlFor="tm-country">
              <span className={ui.fieldLabel}>Country of origin</span>
              <CountryField id="tm-country" selected={f.countries} onChange={f.changeCountries} max={1} />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-b-lg border-t border-base-300 bg-base-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className={ui.bodySm} aria-live="polite">
            {!ready ? (
              "Loading the duty history…"
            ) : changes > 0 ? (
              <>
                <span className="font-semibold text-base-content">
                  {changes} {changes === 1 ? "change" : "changes"}
                </span>{" "}
                to this duty so far. The Tracker alerts you to the next one.
              </>
            ) : (
              "No changes to this duty so far. The Tracker alerts you if one comes."
            )}
          </p>
          <TrackProductButton f={f} />
        </div>
      </div>

      {ready ? (
        <RateHistoryCard f={f} sliceColors={sliceColors} />
      ) : (
        <div className={`${ui.card} h-96 p-5`} aria-hidden>
          <div className={`${ui.skeleton} h-full`} />
        </div>
      )}

      <ExploreModal f={f} />
    </div>
  );
};
