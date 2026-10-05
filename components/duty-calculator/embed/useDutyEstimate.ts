"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [country, setCountry] = useState<Country | null>(initialCountry);
  const [customsValue, setCustomsValue] = useState(10000);
  const [quantity, setQuantity] = useState(1000);
  const [entryDate, setEntryDate] = useState(todayIso);
  const [transportMode, setTransportMode] = useState<TransportMode>("ocean");
  const [preference, setPreference] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [copied, setCopied] = useState(false);

  // The classification's country can arrive after the first render
  useEffect(() => {
    if (initialCountry) setCountry(initialCountry);
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
      surface,
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
      surface,
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
    copy,
    copied,
  };
};

export type DutyEstimate = ReturnType<typeof useDutyEstimate>;
