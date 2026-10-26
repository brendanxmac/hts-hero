"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Countries, Country } from "@/constants/countries";
// Types only: the engine and its tariff data load on demand, below
import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { CountryField } from "@/components/duty-calculator/fields";
import { estimateSurface, markCalculatorHandoff } from "@/components/duty-calculator/lib/analytics";
import { formatDate, formatMoney } from "@/components/duty-calculator/lib/format";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CostBar } from "./CostBar";
import { EstimateLines } from "./EstimateLines";
import { EstimateStats } from "./EstimateStats";

// A quick duty estimate on the /hts/[code] page: pick a country, see the calculator's
// headline figures, then open the calculator for the rest. The first estimate is
// server-rendered; the tariff engine downloads only once the visitor reaches for another
// country, so the page stays light for everyone who doesn't.

const CUSTOMS_VALUE = 10000;

let engine: Promise<typeof import("@/libs/hts-micro-estimate")> | null = null;
const loadEngine = () => (engine ??= import("@/libs/hts-micro-estimate"));

export const MicroCalculator = ({
  htsno,
  baseRates,
  initial,
  inExplorer = false,
  inClassification = false,
  onUseCode,
  useCodeLabel = "Use this code",
  showLines = false,
}: {
  htsno: string;
  baseRates: { general: string | null; special: string | null; other: string | null };
  initial: MicroEstimate;
  // Shown in the HTS explorer rather than on the code's own page, for analytics
  inExplorer?: boolean;
  // A classification's Overview, for analytics
  inClassification?: boolean;
  // Over a calculator: the way on is putting this code in it, rather than opening another one
  // (a classification's: opening its Duty & Tariffs tab)
  onUseCode?: () => void;
  useCodeLabel?: string;
  // The Chapter 99 line behind each tariff, linked (the /hts/[code] pages)
  showLines?: boolean;
}) => {
  const surface = () =>
    inClassification ? estimateSurface("classification") : inExplorer ? estimateSurface("explorer") : "hts_code_page";
  const [country, setCountry] = useState<Country | null>(
    Countries.find((c) => c.code === initial.country) ?? null,
  );
  const [estimate, setEstimate] = useState<MicroEstimate | null>(initial);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const latest = useRef(0);

  const pick = async (next: Country | null) => {
    setCountry(next);
    setFailed(false);
    if (!next) return;
    const request = ++latest.current;
    setLoading(true);
    try {
      const { microEstimate } = await loadEngine();
      const result = microEstimate({ htsCode: htsno, baseRates, country: next.code, asOf: initial.asOf });
      if (request === latest.current) setEstimate(result);
    } catch (error) {
      console.error("Duty estimate failed:", error);
      if (request === latest.current) setFailed(true);
    } finally {
      if (request === latest.current) setLoading(false);
    }
  };

  const shown = country && estimate?.country === country.code ? estimate : null;

  // One lookup for each country the visitor picks. The page's own estimate shows on load without
  // them doing anything, so it isn't counted.
  const lastViewed = useRef<string | null>(null);
  useEffect(() => {
    if (!shown || lastViewed.current === shown.country) return;
    const first = lastViewed.current === null;
    lastViewed.current = shown.country;
    if (first && shown === initial) return;
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_RESULTS_VIEWED, {
      hts_code: htsno,
      country_code: shown.country,
      surface: surface(),
      country_source: "user",
      trigger: "user",
    });
    // surface() only reads where the page is
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, htsno, initial]);

  const openInCalculator = () => {
    markCalculatorHandoff(htsno, surface());
    trackEvent(MixpanelEvent.DUTY_ESTIMATE_OPENED_IN_CALCULATOR, {
      hts_code: htsno,
      country_code: country?.code,
      surface: surface(),
    });
  };
  const calculatorHref =
    `/duty-calculator?code=${htsno}` +
    (country ? `&country=${country.code}&value=${CUSTOMS_VALUE}&date=${initial.asOf}&mode=ocean` : "");

  // The way on: what could lower the duty, and the calculator that checks it
  const exemptions = shown?.openQuestions ?? 0;
  const preference = shown?.preferences[0];
  const plural = (n: number) => `${n} exemption${n === 1 ? "" : "s"}`;
  const headline =
    exemptions > 0
      ? `${plural(exemptions)} could lower this`
      : preference
        ? `${preference} could lower this`
        : shown && shown.totalDuty > 0
          ? "Make sure this is your best rate"
          : "Make sure this shipment really enters duty-free";
  const detail =
    exemptions > 0 && preference
      ? `So could ${preference}. Check them against your real shipment details.`
      : exemptions > 0 || preference
        ? "Check them against your real shipment details."
        : "Tariffs stack and change often. Check your exact shipment, line by line.";

  return (
    <section
      id="estimate"
      aria-labelledby="estimate-title"
      className={`${tt.panel} scroll-mt-6`}
    >
      <div className="flex flex-col gap-3 border-b border-base-300 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id="estimate-title" className={tt.title}>
            Estimated Duty on {htsno}
          </h2>
          <p className={ui.caption}>
            {formatMoney(CUSTOMS_VALUE)} by ocean, entered {formatDate(initial.asOf)}
            {shown?.requiresQuantity && " · 1,000 units"}
          </p>
        </div>
        {/* Start fetching the engine as soon as the visitor reaches for the field */}
        <div className="flex w-full items-center gap-3 sm:w-auto shrink-0" onPointerEnter={loadEngine} onFocusCapture={loadEngine}>
          <label htmlFor="estimate-country" className={`${ui.fieldLabel} whitespace-nowrap`}>
            Country of origin
          </label>
          <div className="w-full sm:w-72">
            <CountryField
              id="estimate-country"
              selected={country ? [country] : []}
              onChange={(next) => pick(next[0] ?? null)}
              max={1}
            />
          </div>
        </div>
      </div>

      {shown ? (
        <div className={`transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading} aria-live="polite">
          <EstimateStats estimate={shown} customsValue={CUSTOMS_VALUE} />
          <CostBar slices={shown.slices} customsValue={CUSTOMS_VALUE} />
          {showLines && <EstimateLines lines={shown.lines} />}
        </div>
      ) : (
        <div className="flex min-h-36 items-center justify-center px-6 py-8 text-center text-base text-base-content/70" aria-live="polite">
          {failed
            ? "Couldn't calculate this estimate. Try again, or open the full calculator."
            : loading
              ? "Calculating…"
              : "Choose a country of origin to see the duty."}
        </div>
      )}

      {/* The way on: what this quick estimate leaves out, and the calculator that doesn't */}
      <div className="flex flex-col gap-3 rounded-b-[1.25rem] border-t border-base-300 bg-base-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className={`${tt.title} leading-snug`}>{headline}</p>
          <p className="mt-0.5 text-sm text-base-content/70">{detail}</p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch sm:items-center gap-1">
          {onUseCode ? (
            <button type="button" onClick={onUseCode} className={ui.button({ variant: "primary" })}>
              {useCodeLabel}
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <>
              {/* nofollow: calculator links with parameters all canonicalize to /duty-calculator */}
              <Link
                href={calculatorHref}
                onClick={openInCalculator}
                rel="nofollow"
                className={ui.button({ variant: "primary" })}
              >
                Open Tariff Calculator
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <span className={`${ui.caption} text-center`}>Free · No sign-up</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
