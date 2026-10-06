"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Countries, Country } from "@/constants/countries";
// Types only: the engine and its tariff data load on demand, below
import type { MicroEstimate } from "@/libs/hts-micro-estimate";
import { CountryField } from "@/components/duty-calculator/fields";
import { markCalculatorHandoff } from "@/components/duty-calculator/lib/analytics";
import { formatDate, formatMoney } from "@/components/duty-calculator/lib/format";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";
import { CostBar } from "./CostBar";
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
}: {
  htsno: string;
  baseRates: { general: string | null; special: string | null; other: string | null };
  initial: MicroEstimate;
}) => {
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

  // One lookup for each country shown, like the calculator's own. The first is the page's own
  // estimate; later ones are countries the visitor picked.
  const lastViewed = useRef<string | null>(null);
  useEffect(() => {
    if (!shown || lastViewed.current === shown.country) return;
    const first = lastViewed.current === null;
    lastViewed.current = shown.country;
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_RESULTS_VIEWED, {
      hts_code: htsno,
      country_code: shown.country,
      surface: "hts_code_page",
      country_source: first && shown === initial ? "default" : "user",
    });
  }, [shown, htsno, initial]);

  const openInCalculator = () => {
    markCalculatorHandoff(htsno, "hts_code_page");
    trackEvent(MixpanelEvent.DUTY_ESTIMATE_OPENED_IN_CALCULATOR, {
      hts_code: htsno,
      country_code: country?.code,
      surface: "hts_code_page",
    });
  };
  const calculatorHref =
    `/duty-calculator?code=${htsno}` +
    (country ? `&country=${country.code}&value=${CUSTOMS_VALUE}&date=${initial.asOf}&mode=ocean` : "");

  // The hook to open the calculator: what this quick estimate leaves out
  const exemptions = shown?.openQuestions ?? 0;
  const preference = shown?.preferences[0];
  const hook =
    exemptions > 0 && preference
      ? `${exemptions} exemption${exemptions === 1 ? "" : "s"} and ${preference} could lower it. Check them against your real shipment details.`
      : exemptions > 0
        ? `${exemptions} exemption${exemptions === 1 ? "" : "s"} could lower it. Check them against your real shipment details.`
        : preference
          ? `${preference} could lower it. Check whether your shipment qualifies.`
          : "Tariffs stack and change often. Check your exact shipment, line by line.";

  return (
    <section
      id="estimate"
      aria-labelledby="estimate-title"
      className={`${ui.cardOverflowVisible} scroll-mt-6`}
    >
      <div className="flex flex-col gap-3 border-b border-base-300 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id="estimate-title" className={ui.cardTitle}>
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
          <CostBar slices={shown.slices} />
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
      <div className="flex flex-col gap-3 rounded-b-lg border-t border-base-300 bg-base-200 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className={`${ui.cardTitle} leading-snug`}>
            {shown && shown.totalDuty > 0
              ? `Is ${formatMoney(shown.totalDuty)} really what you'll owe?`
              : "Make sure this shipment really enters duty-free."}
          </p>
          <p className="mt-0.5 text-sm text-base-content/70">{hook}</p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch sm:items-center gap-1">
          {/* nofollow: calculator links with parameters all canonicalize to /duty-calculator */}
          <Link
            href={calculatorHref}
            onClick={openInCalculator}
            rel="nofollow"
            className={ui.button({ variant: "primary", size: "lg" })}
          >
            Find my exact duty
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <span className={`${ui.caption} text-center`}>Free · No sign-up</span>
        </div>
      </div>
    </section>
  );
};
