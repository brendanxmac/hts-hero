"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Countries, Country } from "../constants/countries";
import { HtsElement } from "../interfaces/hts";
import { useHts } from "../contexts/HtsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import {
  generateBreadcrumbsForHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { htsCodeDigitsOnly, htsCodesEqual, normalizeHtsCode } from "../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../libs/mixpanel";
import { copyToClipboard } from "../utilities/data";
import { findTariffElement } from "../tariffs/tariff-calculations";
import { calculate } from "../tariffs/engine-v2/calculate";
import { AllRules } from "../tariffs/engine-v2/data";
import {
  getLatestVerifiedRevision,
  getRevisionForDate,
  isVerifiedDate,
} from "../tariffs/engine-v2/revisions";
import { Answers, CalculationResult, TransportMode } from "../tariffs/engine-v2/types";
import { Explore } from "./Explore";
import { HtsCodeField } from "./duty-calculator/HtsCodeField";
import { CountryField } from "./duty-calculator/CountryField";
import { Field, NumberField, Segmented } from "./duty-calculator/controls";
import {
  BasisPanel,
  NotAppliedPanel,
  QuestionsPanel,
  SimpleSummary,
  Statement,
  SummaryStats,
} from "./duty-calculator/Results";
import {
  formatDate,
  formatMoney,
  formatPct,
  mono,
  todayIso,
  TRANSPORT_MODES,
} from "./duty-calculator/format";
import styles from "./duty-calculator/theme.module.css";

type View = "detailed" | "simple";

const VIEWS = [
  { id: "detailed", label: "Detailed" },
  { id: "simple", label: "Simple" },
] as const;

const VIEW_STORAGE_KEY = "hts-hero-duty-calculator-view";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const EXAMPLES = [
  { code: "7326.90.86.88", country: "CN", label: "Steel hardware", origin: "China" },
  { code: "8703.23.01.90", country: "DE", label: "Passenger car", origin: "Germany" },
  { code: "6109.10.00.12", country: "VN", label: "Cotton T-shirts", origin: "Vietnam" },
];

const countryByCode = (code: string | null) =>
  code ? Countries.find((c) => c.code === code.toUpperCase()) ?? null : null;

const positiveNumber = (raw: string | null, fallback: number) => {
  const parsed = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const isTariffLevel = (element: HtsElement) => htsCodeDigitsOnly(element.htsno).length >= 8;

export const TariffFinderPage = () => {
  const searchParams = useSearchParams();
  const { htsElements, fetchElements, revision: htsRevisionName } = useHts();
  const { sections, getSections } = useHtsSections();
  const { setBreadcrumbs } = useBreadcrumbs();

  // ── Inputs ──
  const [loading, setLoading] = useState(htsElements.length === 0);
  const [selectedElement, setSelectedElement] = useState<HtsElement | null>(null);
  const [country, setCountry] = useState<Country | null>(
    () => countryByCode(searchParams.get("country")) ?? countryByCode("CN")
  );
  const [customsValue, setCustomsValue] = useState(() => positiveNumber(searchParams.get("value"), 10000));
  const [quantity, setQuantity] = useState(() => positiveNumber(searchParams.get("units"), 1000));
  const [entryDate, setEntryDate] = useState(() => {
    const date = searchParams.get("date");
    return date && ISO_DATE.test(date) ? date : todayIso();
  });
  const [transportMode, setTransportMode] = useState<TransportMode>(() => {
    const mode = searchParams.get("mode");
    return TRANSPORT_MODES.some((m) => m.id === mode) ? (mode as TransportMode) : "ocean";
  });
  const [claimedPreference, setClaimedPreference] = useState(searchParams.get("pref") ?? "");
  const [answers, setAnswers] = useState<Answers>({});
  const [view, setView] = useState<View>(() => (searchParams.get("view") === "simple" ? "simple" : "detailed"));
  const [showExplore, setShowExplore] = useState(false);
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);

  // Remember the preferred view on this device, unless the link specified one
  useEffect(() => {
    if (searchParams.get("view")) return;
    try {
      const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === "simple" || stored === "detailed") setView(stored);
    } catch {
      // Storage can be unavailable (private mode); the default view is fine
    }
  }, [searchParams]);

  // ── Data ──
  useEffect(() => {
    if (htsElements.length > 0 && sections.length > 0) {
      setLoading(false);
      return;
    }
    Promise.all([htsElements.length ? null : fetchElements("latest"), sections.length ? null : getSections()])
      .catch((e) => console.error("Error loading HTS data:", e))
      .finally(() => setLoading(false));
    // Load once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Selecting a code (from the field, the URL, an example, or the explorer) ──
  const openExplorerAt = useCallback(
    (element: HtsElement) => {
      const sectionAndChapter = getSectionAndChapterFromChapterNumber(sections, Number(element.chapter));
      if (sectionAndChapter) {
        setBreadcrumbs(
          generateBreadcrumbsForHtsElement(sections, sectionAndChapter.chapter, [
            ...getHtsElementParents(element, htsElements),
            element,
          ])
        );
      }
      setShowExplore(true);
      trackEvent(MixpanelEvent.DUTY_CALCULATOR_EXPLORE_MODAL_OPENED, { source: "sub_tariff_code_selected" });
    },
    [sections, htsElements, setBreadcrumbs]
  );

  const selectElement = useCallback(
    (element: HtsElement | null, source: string) => {
      if (!element) {
        if (selectedElement) trackEvent(MixpanelEvent.DUTY_CALCULATOR_HTS_CODE_CLEARED);
        setSelectedElement(null);
        return;
      }
      if (!isTariffLevel(element)) {
        openExplorerAt(element);
        return;
      }
      setSelectedElement(element);
      trackEvent(MixpanelEvent.DUTY_CALCULATOR_HTS_CODE_SELECTED, {
        hts_code: element.htsno,
        digit_count: htsCodeDigitsOnly(element.htsno).length,
        source,
      });
    },
    [selectedElement, openExplorerAt]
  );

  // React to ?code= whenever it changes, including links clicked inside the explorer
  const codeParam = searchParams.get("code");
  useEffect(() => {
    if (!codeParam || htsElements.length === 0) return;
    const normalized = normalizeHtsCode(codeParam.trim());
    const match = htsElements.find((el) => htsCodesEqual(el.htsno, normalized));
    if (match) {
      setShowExplore(false);
      selectElement(match, "url");
    }
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_DEEP_LINK_OPENED, {
      had_country_param: Boolean(searchParams.get("country")),
      had_code_param: true,
      code_matched_element: Boolean(match),
    });
    // Only when the code param or data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam, htsElements.length]);

  // Answers and trade preference claims belong to one code/country pair
  const entryKey = `${selectedElement?.htsno ?? ""}|${country?.code ?? ""}`;
  const previousEntryKey = useRef(entryKey);
  useEffect(() => {
    if (previousEntryKey.current === entryKey) return;
    previousEntryKey.current = entryKey;
    setAnswers({});
    setClaimedPreference("");
  }, [entryKey]);

  // ── Calculation ──
  const tariffElement = useMemo(
    () => (selectedElement ? findTariffElement(selectedElement, htsElements) : null),
    [selectedElement, htsElements]
  );

  const baseInput = useMemo(
    () =>
      selectedElement && country && tariffElement
        ? {
            htsCode: selectedElement.htsno,
            country: country.code,
            asOf: ISO_DATE.test(entryDate) ? entryDate : todayIso(),
            customsValue,
            quantity,
            baseRates: {
              general: tariffElement.general,
              special: tariffElement.special,
              other: tariffElement.other,
            },
            claimedPreference: claimedPreference || undefined,
            transportMode,
          }
        : null,
    [selectedElement, country, tariffElement, entryDate, customsValue, quantity, claimedPreference, transportMode]
  );

  const result: CalculationResult | null = useMemo(
    () => (baseInput ? calculate(AllRules, { ...baseInput, answers }) : null),
    [baseInput, answers]
  );

  // What each unanswered yes/no question would change, so users know which ones matter
  const impacts = useMemo(() => {
    if (!baseInput || !result) return {};
    const current = result.totalDuty + result.totalFees;
    const out: Record<string, number> = {};
    result.questions
      .filter((q) => q.input.type === "boolean" && answers[q.input.id] !== true)
      .forEach((q) => {
        const alt = calculate(AllRules, { ...baseInput, answers: { ...answers, [q.input.id]: true } });
        out[q.input.id] = alt.totalDuty + alt.totalFees - current;
      });
    return out;
  }, [baseInput, result, answers]);

  // ── Analytics ──
  const lastViewedKey = useRef<string | null>(null);
  useEffect(() => {
    if (!result || !selectedElement || !country || !tariffElement) return;
    const key = `${selectedElement.htsno}-${country.code}`;
    if (lastViewedKey.current === key) return;
    lastViewedKey.current = key;
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_RESULTS_VIEWED, {
      hts_code: selectedElement.htsno,
      country_code: country.code,
      tariff_basis_hts_code: tariffElement.htsno,
    });
  }, [result, selectedElement, country, tariffElement]);

  const trackLater = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const trackDebounced = (key: string, event: MixpanelEvent, props: Record<string, unknown>) => {
    clearTimeout(trackLater.current[key]);
    trackLater.current[key] = setTimeout(() => trackEvent(event, props), 1000);
  };

  // ── Actions ──
  const changeView = (next: View) => {
    setView(next);
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_VIEW_CHANGED, { view: next });
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // Not critical
    }
  };

  const shareUrl = () => {
    const params = new URLSearchParams();
    if (selectedElement) params.set("code", selectedElement.htsno);
    if (country) params.set("country", country.code);
    params.set("value", String(customsValue));
    if (result?.requiresQuantity) params.set("units", String(quantity));
    params.set("date", entryDate);
    params.set("mode", transportMode);
    if (claimedPreference) params.set("pref", claimedPreference);
    return `${window.location.origin}/duty-calculator?${params.toString()}`;
  };

  const summaryText = () => {
    if (!result || !selectedElement || !country) return "";
    const lines = [
      `Duty estimate · HTS ${selectedElement.htsno} from ${country.name}`,
      `Entry ${formatDate(result.asOf)} · ${TRANSPORT_MODES.find((m) => m.id === transportMode)?.label} · Customs value ${formatMoney(customsValue)}`,
      "",
      `Base duty (${result.base.reasons[0] ?? "Free"})`.padEnd(48) + formatMoney(result.base.amount),
      ...result.lines
        .filter((l) => l.status === "applies")
        .map((l) => `${l.code} ${l.name} (${formatPct(l.ratePct ?? 0)})`.slice(0, 46).padEnd(48) + formatMoney(l.amount)),
      "Total duty".padEnd(48) + formatMoney(result.totalDuty),
      ...result.fees.map((f) => `${f.name} (${formatPct(f.ratePct)})`.padEnd(48) + formatMoney(f.amount)),
      "Total duty and fees".padEnd(48) + formatMoney(result.totalDuty + result.totalFees),
      "Landed cost".padEnd(48) + formatMoney(customsValue + result.totalDuty + result.totalFees),
      "",
      shareUrl(),
    ];
    return lines.join("\n");
  };

  const copy = async (kind: "link" | "summary") => {
    const ok = await copyToClipboard(kind === "link" ? shareUrl() : summaryText());
    if (!ok) return;
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
    trackEvent(
      kind === "link" ? MixpanelEvent.DUTY_CALCULATOR_SHARE_RESULTS_COPIED : MixpanelEvent.DUTY_CALCULATOR_RESULTS_COPIED,
      { hts_code: selectedElement?.htsno, country_code: country?.code, is_modal: false }
    );
  };

  const selectExample = (example: (typeof EXAMPLES)[number]) => {
    const element = htsElements.find((el) => htsCodesEqual(el.htsno, example.code));
    if (!element) return;
    setCountry(countryByCode(example.country));
    selectElement(element, "example");
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_EXAMPLE_SELECTED, { hts_code: example.code, country_code: example.country });
  };

  const closeExplore = () => {
    setShowExplore(false);
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_EXPLORE_MODAL_CLOSED);
  };

  useEffect(() => {
    if (!showExplore) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeExplore();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExplore]);

  // ── Derived display state ──
  const latestVerified = getLatestVerifiedRevision();
  const verified = isVerifiedDate(entryDate);
  const revisionForDate = getRevisionForDate(entryDate);
  const openQuestions = result ? result.questions.filter((q) => !q.answered).length : 0;
  // The first unit is the one duty is charged in; later ones are statistical reporting units
  const units = [...(selectedElement?.units ?? []), ...(tariffElement?.units ?? [])].filter(
    (u, i, all) => u && all.indexOf(u) === i
  );

  return (
    <div className={`${styles.root} w-full pb-20`}>
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 flex flex-col gap-6">
        {/* Entry details */}
        <section className={`${styles.card} p-5 sm:p-7`} aria-labelledby="entry-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
            <h2 id="entry-heading" className="text-[17px] font-semibold tracking-tight">
              Entry details
            </h2>
            <span className="text-[13px] text-[var(--dc-text-3)]">Results update as you type</span>
          </div>

          {loading ? (
            <FormSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5 gap-y-6">
              <Field
                label="HTS code"
                htmlFor="dc-hts"
                className="md:col-span-5"
                action={
                  <button
                    type="button"
                    className={`${styles.link} inline-flex items-center gap-1 text-[13px]`}
                    onClick={() => {
                      setShowExplore(true);
                      trackEvent(MixpanelEvent.DUTY_CALCULATOR_EXPLORE_MODAL_OPENED, { source: "description_search_button" });
                    }}
                  >
                    <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                    Search by description
                  </button>
                }
              >
                <HtsCodeField
                  id="dc-hts"
                  selectedElement={selectedElement}
                  onSelect={(el) => selectElement(el, "hts_selector")}
                  autoFocus={!codeParam}
                />
              </Field>

              <Field label="Country of origin" htmlFor="dc-country" className="md:col-span-4">
                <CountryField
                  id="dc-country"
                  selectedCountry={country}
                  onSelect={(c) => {
                    setCountry(c);
                    trackEvent(MixpanelEvent.DUTY_CALCULATOR_COUNTRY_CHANGED, { country_code: c?.code ?? null });
                  }}
                />
              </Field>

              <Field label="Customs value" htmlFor="dc-value" className="md:col-span-3">
                <NumberField
                  id="dc-value"
                  prefix="$"
                  suffix="USD"
                  value={customsValue}
                  onChange={(v) => {
                    setCustomsValue(v);
                    trackDebounced("value", MixpanelEvent.DUTY_CALCULATOR_CUSTOMS_VALUE_SET, { customs_value_usd: v });
                  }}
                />
              </Field>

              <Field label="Entry date" htmlFor="dc-date" className="md:col-span-3">
                <input
                  id="dc-date"
                  type="date"
                  className={`${styles.input} ${styles.num}`}
                  value={entryDate}
                  onChange={(e) => {
                    setEntryDate(e.target.value);
                    trackDebounced("date", MixpanelEvent.DUTY_CALCULATOR_ENTRY_DATE_SET, { entry_date: e.target.value });
                  }}
                />
              </Field>

              <Field label="Mode of transport" className="md:col-span-5">
                <Segmented
                  label="Mode of transport"
                  options={TRANSPORT_MODES}
                  value={transportMode}
                  onChange={(mode) => {
                    setTransportMode(mode);
                    trackEvent(MixpanelEvent.DUTY_CALCULATOR_TRANSPORT_MODE_SET, { mode });
                  }}
                />
              </Field>

              {result?.requiresQuantity && (
                <Field
                  label="Quantity"
                  htmlFor="dc-quantity"
                  className="md:col-span-4"
                  hint={`The base rate (${result.base.reasons[0]}) is charged per unit`}
                >
                  <NumberField
                    id="dc-quantity"
                    suffix={units[0] ?? "units"}
                    value={quantity}
                    onChange={(v) => {
                      setQuantity(v);
                      trackDebounced("units", MixpanelEvent.DUTY_CALCULATOR_UNITS_SET, { units: v });
                    }}
                  />
                </Field>
              )}

              {result && result.availablePreferences.length > 0 && (
                <Field
                  label="Trade preference"
                  htmlFor="dc-preference"
                  className="md:col-span-4"
                  hint="Only if the goods qualify under the program's rules of origin"
                >
                  <select
                    id="dc-preference"
                    className={`${styles.input} appearance-none`}
                    value={claimedPreference}
                    onChange={(e) => {
                      setClaimedPreference(e.target.value);
                      trackEvent(MixpanelEvent.DUTY_CALCULATOR_PREFERENCE_CLAIMED, { symbol: e.target.value || "none" });
                    }}
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
          )}
        </section>

        {/* Results */}
        {!loading && (!result || !selectedElement || !country ? (
          <EmptyState onExample={selectExample} />
        ) : (
          <section className="flex flex-col gap-4" aria-labelledby="results-heading" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
              <div className="min-w-0">
                <h2 id="results-heading" className="text-[22px] font-semibold tracking-tight">
                  Duty estimate
                </h2>
                <p className="mt-1 text-[14px] text-[var(--dc-text-2)]">
                  <span className={`${mono.className} font-semibold text-[var(--dc-text)]`}>{selectedElement.htsno}</span>
                  {" · "}
                  {country.flag} {country.name}
                  {" · "}
                  {formatDate(result.asOf)}
                  {" · "}
                  {TRANSPORT_MODES.find((m) => m.id === transportMode)?.label}
                </p>
              </div>
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="flex-1 min-w-0 sm:flex-none sm:w-[200px]">
                  <Segmented label="View" options={VIEWS} value={view} onChange={changeView} compact />
                </div>
                <button type="button" className={styles.button} onClick={() => copy("summary")} aria-label="Copy summary">
                  {copied === "summary" ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied === "summary" ? "Copied" : "Copy"}</span>
                </button>
                <button type="button" className={styles.buttonPrimary} onClick={() => copy("link")} aria-label="Copy share link">
                  {copied === "link" ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied === "link" ? "Link copied" : "Share link"}</span>
                  <span className="sm:hidden">{copied === "link" ? "Copied" : "Share"}</span>
                </button>
              </div>
            </div>

            {!verified && (
              <div
                role="status"
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[var(--dc-warning-border)] bg-[var(--dc-warning-soft)] px-4 py-3.5"
              >
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-[var(--dc-warning)]" aria-hidden />
                <p className="flex-1 text-[14px] leading-snug text-[var(--dc-warning)]">
                  <span className="font-semibold">Tariff rules for {formatDate(entryDate)} aren&apos;t verified yet.</span>{" "}
                  Our data is verified for HTS {latestVerified.title} ({formatDate(latestVerified.from)} –{" "}
                  {latestVerified.to ? formatDate(latestVerified.to) : "present"}). Changes outside that window may be missing.
                </p>
                <button
                  type="button"
                  className={`${styles.button} shrink-0`}
                  onClick={() => {
                    setEntryDate(latestVerified.from);
                    trackEvent(MixpanelEvent.DUTY_CALCULATOR_ENTRY_DATE_SET, { entry_date: latestVerified.from, source: "verified_notice" });
                  }}
                >
                  Use {formatDate(latestVerified.from)}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {view === "simple" ? (
              <div className={styles.card}>
                <SimpleSummary
                  result={result}
                  customsValue={customsValue}
                  openQuestions={openQuestions}
                  onShowDetails={() => changeView("detailed")}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className={`${styles.card} lg:col-span-8 overflow-hidden`}>
                  <SummaryStats result={result} customsValue={customsValue} />
                  <Statement
                    result={result}
                    customsValue={customsValue}
                    quantity={quantity}
                    unitLabel={units[0] ?? "units"}
                  />
                </div>
                <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-4">
                  {result.questions.length > 0 && (
                    <QuestionsPanel
                      questions={result.questions}
                      answers={answers}
                      impacts={impacts}
                      lines={result.lines}
                      onAnswer={(id, value) => {
                        setAnswers((prev) => {
                          const next = { ...prev };
                          if (value === undefined || value === "") delete next[id];
                          else next[id] = value;
                          return next;
                        });
                        trackEvent(MixpanelEvent.DUTY_CALCULATOR_QUESTION_ANSWERED, { input: id, answered: value !== undefined });
                      }}
                    />
                  )}
                  <BasisPanel
                    result={result}
                    revision={revisionForDate}
                    verified={verified}
                    htsRevisionName={htsRevisionName}
                    transportMode={transportMode}
                  />
                  <NotAppliedPanel lines={result.lines} />
                </aside>
              </div>
            )}
          </section>
        ))}

        <p className="mt-4 text-center text-[12.5px] leading-relaxed text-[var(--dc-text-3)] max-w-2xl mx-auto">
          Estimates are based on the HTS and Chapter 99 rules in effect on the entry date and your answers. They don&apos;t
          include antidumping or countervailing duties. Spot something wrong?{" "}
          <a
            href="mailto:support@htshero.com"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent(MixpanelEvent.DUTY_CALCULATOR_SUPPORT_CLICKED)}
          >
            Tell us
          </a>{" "}
          and we&apos;ll fix it.
        </p>
      </div>

      {showExplore && (
        <dialog className="modal modal-open" aria-label="Search HTS by description">
          <div className="modal-box w-11/12 max-w-6xl h-[85vh] p-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-base-content/10">
              <span className="font-semibold">Find your HTS code</span>
              <button type="button" className="btn btn-sm btn-ghost" onClick={closeExplore}>
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Explore explorerSurface="duty_calculator_modal" />
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={closeExplore}>
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
};

const FormSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5 gap-y-6" aria-busy="true" aria-label="Loading HTS data">
    {["md:col-span-5", "md:col-span-4", "md:col-span-3", "md:col-span-3", "md:col-span-5"].map((span, i) => (
      <div key={i} className={`flex flex-col gap-2 ${span}`}>
        <div className={`${styles.skeleton} h-3.5 w-24`} />
        <div className={`${styles.skeleton} h-[46px] w-full`} />
      </div>
    ))}
  </div>
);

const EmptyState = ({ onExample }: { onExample: (example: (typeof EXAMPLES)[number]) => void }) => (
  <section className={`${styles.card} p-6 sm:p-10`}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight">Enter an HTS code to see your duty</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--dc-text-2)]">
          You&apos;ll get a line-by-line statement: the base rate, every Chapter 99 tariff and exemption in effect on your
          entry date, and customs fees, each with the reason it applies.
        </p>
        <ol className="mt-6 flex flex-col gap-3">
          {[
            "Enter the 8- or 10-digit HTS code, or search by description",
            "Choose the country of origin, value and entry date",
            "Answer any questions that could lower your duty",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-[14.5px] text-[var(--dc-text)]">
              <span className={`${styles.num} flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--dc-accent-soft)] border border-[var(--dc-accent-border)] text-[12px] font-semibold text-[var(--dc-accent)]`}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className={styles.eyebrow}>Try an example</div>
        {EXAMPLES.map((example) => (
          <button
            key={example.code}
            type="button"
            onClick={() => onExample(example)}
            className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--dc-border)] bg-[var(--dc-surface-2)] px-4 py-3.5 text-left transition-colors hover:border-[var(--dc-accent-border)] hover:bg-[var(--dc-accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)]"
          >
            <span className="flex flex-col">
              <span className="text-[14.5px] font-semibold text-[var(--dc-text)]">
                {example.label} from {example.origin}
              </span>
              <span className={`${mono.className} text-[13px] text-[var(--dc-text-2)]`}>{example.code}</span>
            </span>
            <ArrowRightIcon className="w-4 h-4 text-[var(--dc-text-3)] group-hover:text-[var(--dc-accent)]" />
          </button>
        ))}
      </div>
    </div>
  </section>
);
