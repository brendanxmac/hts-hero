"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Country } from "@/constants/countries";
import { HtsElement } from "@/interfaces/hts";
import { useHts } from "@/contexts/HtsContext";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { copyToClipboard } from "@/utilities/data";
import { calculate } from "@/tariffs/engine-v2/calculate";
import { AllRules } from "@/tariffs/engine-v2/data";
import { Answers, TransportMode } from "@/tariffs/engine-v2/types";
import {
  buildEstimateInput,
  calculatorUrl,
  estimateSummaryText,
  findTariffElement,
} from "../lib/estimate";
import { estimateSurface, markCalculatorHandoff } from "../lib/analytics";
import { todayIso, TRANSPORT_MODES } from "../lib/format";
import { countOpenQuestions, preferenceImpacts, questionImpacts } from "../lib/questions";

// The state and results behind a DutyEstimateEmbed: the inputs, the engine's result for them,
// what each question could change, and copying or linking to the estimate

// The page the embed is on, for analytics and element ids
export type Surface = "explorer" | "classification";

export const useDutyEstimate = ({
  element,
  tariffElementOverride,
  initialCountry,
  surface,
}: {
  element: HtsElement;
  tariffElementOverride?: HtsElement;
  initialCountry: Country | null;
  surface: Surface;
}) => {
  const { htsElements } = useHts();
  const [country, setCountryState] = useState<Country | null>(initialCountry);
  // Whether the country shown is one the user chose, rather than the page's starting one
  const countryChosen = useRef(false);
  const setCountry = (next: Country | null) => {
    countryChosen.current = true;
    setCountryState(next);
  };
  const [customsValue, setCustomsValue] = useState(10000);
  const [quantity, setQuantity] = useState(1000);
  const [entryDate, setEntryDate] = useState(todayIso);
  const [transportMode, setTransportMode] = useState<TransportMode>("ocean");
  const [preference, setPreference] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [copied, setCopied] = useState(false);

  // The classification's country can arrive after the first render
  useEffect(() => {
    if (initialCountry) setCountryState(initialCountry);
  }, [initialCountry]);

  // Answers and preference claims belong to one code and country
  useEffect(() => {
    setAnswers({});
    setPreference("");
  }, [element.htsno, country?.code]);

  const tariffElement = useMemo(
    () =>
      tariffElementOverride ??
      (htsElements.length ? findTariffElement(element, htsElements) : element),
    [tariffElementOverride, element, htsElements],
  );

  const input = useMemo(
    () =>
      country
        ? buildEstimateInput({
            element,
            tariffElement,
            country,
            asOf: entryDate || todayIso(),
            customsValue,
            quantity,
            transportMode,
            claimedPreference: preference,
          })
        : null,
    [
      element,
      tariffElement,
      country,
      entryDate,
      customsValue,
      quantity,
      transportMode,
      preference,
    ],
  );
  const result = useMemo(
    () => (input ? calculate(AllRules, { ...input, answers }) : null),
    [input, answers],
  );
  const impacts = useMemo(
    () => (input && result ? questionImpacts(input, result, answers) : {}),
    [input, result, answers],
  );
  const preferenceChanges = useMemo(
    () => (input && result ? preferenceImpacts(input, result, answers) : {}),
    [input, result, answers]
  );

  // One lookup for each code and country shown, like the calculator's own
  const lastViewedKey = useRef<string | null>(null);
  useEffect(() => {
    if (!result || !country) return;
    const key = `${element.htsno}-${country.code}`;
    if (lastViewedKey.current === key) return;
    lastViewedKey.current = key;
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_RESULTS_VIEWED, {
      hts_code: element.htsno,
      country_code: country.code,
      tariff_basis_hts_code: tariffElement.htsno,
      surface: estimateSurface(surface),
      country_source: countryChosen.current ? "user" : "default",
    });
  }, [result, element.htsno, country, tariffElement.htsno, surface]);

  const openQuestions = result ? countOpenQuestions(result, impacts) : 0;
  // The most one answer could save; savings don't always add up, so this isn't a sum
  const bestSaving = Math.max(
    0,
    ...Object.keys(impacts)
      .filter((id) => answers[id] !== true)
      .map((id) => -impacts[id]),
  );

  // The first unit is the one duty is charged in
  const unitLabel =
    [...element.units, ...tariffElement.units].filter(
      (u, i, all) => u && all.indexOf(u) === i,
    )[0] ?? "units";
  const transportLabel =
    TRANSPORT_MODES.find((m) => m.id === transportMode)?.label ?? "";

  const link = () =>
    calculatorUrl({
      code: element.htsno,
      country: country?.code,
      value: customsValue,
      units: result?.requiresQuantity ? quantity : undefined,
      date: entryDate,
      mode: transportMode,
      pref: preference,
      answers,
    });

  // Before following link() to the calculator
  const trackOpen = (properties: Record<string, unknown> = {}) => {
    const from = estimateSurface(surface);
    markCalculatorHandoff(element.htsno, from);
    trackEvent(MixpanelEvent.DUTY_ESTIMATE_OPENED_IN_CALCULATOR, {
      hts_code: element.htsno,
      country_code: country?.code,
      surface: from,
      ...properties,
    });
  };

  const copy = async () => {
    if (!result || !country) return;
    const ok = await copyToClipboard(
      estimateSummaryText({
        result,
        htsno: element.htsno,
        country,
        customsValue,
        transportLabel,
        link: link(),
      }),
    );
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_RESULTS_COPIED, {
      hts_code: element.htsno,
      country_code: country.code,
      surface: estimateSurface(surface),
    });
  };

  const answer = (id: string, value: unknown) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "") delete next[id];
      else next[id] = value as Answers[string];
      return next;
    });
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_QUESTION_ANSWERED, {
      input: id,
      answered: value !== undefined,
      surface: estimateSurface(surface),
    });
  };

  return {
    country,
    setCountry,
    customsValue,
    setCustomsValue,
    quantity,
    setQuantity,
    entryDate,
    setEntryDate,
    transportMode,
    setTransportMode,
    preference,
    setPreference,
    answers,
    answer,
    result,
    impacts,
    preferenceChanges,
    openQuestions,
    bestSaving,
    unitLabel,
    link,
    trackOpen,
    copy,
    copied,
  };
};

export type DutyEstimate = ReturnType<typeof useDutyEstimate>;
