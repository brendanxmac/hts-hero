"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import { Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { useHts } from "../../contexts/HtsContext";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { copyToClipboard } from "../../utilities/data";
import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { Answers, TransportMode } from "../../tariffs/engine-v2/types";
import { Field, NumberField } from "./controls";
import { CountryField } from "./CountryField";
import { buildEstimateInput, calculatorUrl, estimateSummaryText, findTariffElement } from "./estimate";
import { todayIso, TRANSPORT_MODES } from "./format";
import { countOpenQuestions, questionImpacts } from "./questions";
import { NotAppliedPanel, QuestionsPanel, Statement, SummaryStats } from "./Results";
import { DateNotice } from "./shared";
import styles from "./theme.module.css";

// A duty estimate for one HTS code, embedded in another page (the HTS explorer, a
// classification's Duty & Tariffs tab). Same engine and pieces as the Tariff Calculator,
// with a link to open the estimate there in full.

type Surface = "explorer" | "classification";

export const DutyEstimateEmbed = ({
  element,
  tariffElement: tariffElementOverride,
  initialCountry = null,
  countryOfOrigin = null,
  surface,
}: {
  element: HtsElement;
  // The line with the base rates, when the page already knows it
  tariffElement?: HtsElement;
  initialCountry?: Country | null;
  // The classification's country of origin, to offer going back to it
  countryOfOrigin?: Country | null;
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
    () => tariffElementOverride ?? (htsElements.length ? findTariffElement(element, htsElements) : element),
    [tariffElementOverride, element, htsElements]
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
    [element, tariffElement, country, entryDate, customsValue, quantity, transportMode, preference]
  );
  const result = useMemo(() => (input ? calculate(AllRules, { ...input, answers }) : null), [input, answers]);
  const impacts = useMemo(
    () => (input && result ? questionImpacts(input, result, answers) : {}),
    [input, result, answers]
  );

  // The first unit is the one duty is charged in
  const unitLabel =
    [...element.units, ...tariffElement.units].filter((u, i, all) => u && all.indexOf(u) === i)[0] ?? "units";
  const transportLabel = TRANSPORT_MODES.find((m) => m.id === transportMode)?.label ?? "";

  const link = () =>
    calculatorUrl({
      code: element.htsno,
      country: country?.code,
      value: customsValue,
      units: result?.requiresQuantity ? quantity : undefined,
      date: entryDate,
      mode: transportMode,
      pref: preference,
    });

  const copy = async () => {
    if (!result || !country) return;
    const ok = await copyToClipboard(
      estimateSummaryText({ result, htsno: element.htsno, country, customsValue, transportLabel, link: link() })
    );
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_RESULTS_COPIED, { hts_code: element.htsno, country_code: country.code, surface });
  };

  const answer = (id: string, value: unknown) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "") delete next[id];
      else next[id] = value as Answers[string];
      return next;
    });
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_QUESTION_ANSWERED, { input: id, answered: value !== undefined, surface });
  };

  const ids = `de-${surface}`;

  return (
    <div className={`${styles.root} ${styles.embedded} flex flex-col gap-4`}>
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        <Field
          label="Country of origin"
          htmlFor={`${ids}-country`}
          className="lg:col-span-4"
          action={
            countryOfOrigin && country?.code !== countryOfOrigin.code ? (
              <button
                type="button"
                className={`${styles.link} inline-flex items-center gap-1 text-[12.5px]`}
                onClick={() => setCountry(countryOfOrigin)}
              >
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Back to {countryOfOrigin.name}
              </button>
            ) : undefined
          }
        >
          <CountryField
            id={`${ids}-country`}
            selected={country ? [country] : []}
            max={1}
            onChange={(next) => setCountry(next[next.length - 1] ?? null)}
          />
        </Field>
        <Field label="Customs value" htmlFor={`${ids}-value`} className="lg:col-span-3">
          <NumberField id={`${ids}-value`} prefix="$" suffix="USD" value={customsValue} onChange={setCustomsValue} />
        </Field>
        <Field label="Entry date" htmlFor={`${ids}-date`} className="lg:col-span-3">
          <input
            id={`${ids}-date`}
            type="date"
            className={`${styles.input} ${styles.num}`}
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </Field>
        <Field label="Transport" htmlFor={`${ids}-mode`} className="lg:col-span-2">
          <select
            id={`${ids}-mode`}
            className={`${styles.input} appearance-none`}
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value as TransportMode)}
          >
            {TRANSPORT_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        {result?.requiresQuantity && (
          <Field
            label="Quantity"
            htmlFor={`${ids}-quantity`}
            className="lg:col-span-4"
            hint={`The base rate (${result.base.reasons[0]}) is charged per unit`}
          >
            <NumberField id={`${ids}-quantity`} suffix={unitLabel} value={quantity} onChange={setQuantity} />
          </Field>
        )}
        {result && result.availablePreferences.length > 0 && (
          <Field
            label="Trade preference"
            htmlFor={`${ids}-pref`}
            className="lg:col-span-4"
            hint="Only if the goods qualify under the program's rules of origin"
          >
            <select
              id={`${ids}-pref`}
              className={`${styles.input} appearance-none`}
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
            >
              <option value="">None claimed</option>
              {result.availablePreferences.map((p) => (
                <option key={p.symbol} value={p.symbol}>
                  {p.symbol} · {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {!country || !result ? (
        <div className="rounded-xl border border-dashed border-[var(--dc-border-strong)] px-6 py-10 text-center">
          <div className="text-[15px] font-semibold">Choose a country of origin</div>
          <p className="mt-1 text-[13.5px] text-[var(--dc-text-2)]">
            You&apos;ll see every duty and tariff that applies, line by line, and why.
          </p>
        </div>
      ) : (
        <>
          <DateNotice entryDate={entryDate} onUseVerified={setEntryDate} />

          <div className={`${styles.card} overflow-hidden`}>
            <SummaryStats result={result} customsValue={customsValue} />
            <Statement result={result} customsValue={customsValue} unitLabel={unitLabel} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {result.questions.length > 0 && (
              <QuestionsPanel
                questions={result.questions}
                answers={answers}
                impacts={impacts}
                lines={result.lines}
                onAnswer={answer}
              />
            )}
            <NotAppliedPanel lines={result.lines} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[12.5px] text-[var(--dc-text-3)]">
              {countOpenQuestions(result, impacts) > 0
                ? "Answer the questions above to refine this estimate."
                : "Estimates don't include antidumping or countervailing duties."}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" className={styles.button} onClick={copy}>
                {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={link()}
                className={styles.buttonPrimary}
                onClick={() =>
                  trackEvent(MixpanelEvent.DUTY_ESTIMATE_OPENED_IN_CALCULATOR, {
                    hts_code: element.htsno,
                    country_code: country.code,
                    surface,
                  })
                }
              >
                Open in Tariff Calculator
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
