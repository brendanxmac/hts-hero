"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Countries, Country } from "../../../constants/countries";
import { HtsElement } from "../../../interfaces/hts";
import { useHts } from "../../../contexts/HtsContext";
import { useHtsSections } from "../../../contexts/HtsSectionsContext";
import { useBreadcrumbs } from "../../../contexts/BreadcrumbsContext";
import {
  generateBreadcrumbsForHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../../../libs/hts";
import { htsCodeDigitsOnly, htsCodesEqual, normalizeHtsCode } from "../../../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../../../libs/mixpanel";
import { copyToClipboard } from "../../../utilities/data";
import { calculate } from "../../../tariffs/engine-v2/calculate";
import { AllRules } from "../../../tariffs/engine-v2/data";
import { addDays, calculateHistory } from "../../../tariffs/engine-v2/history";
import {
  getLatestVerifiedRevision,
  getRevisionForDate,
  getVerifiedRevisions,
  isVerifiedDate,
} from "../../../tariffs/engine-v2/revisions";
import { Answers, CalculationResult, TransportMode } from "../../../tariffs/engine-v2/types";
import { CompareEntry } from "../results";
import {
  buildEstimateInput,
  CALCULATOR_PATH,
  calculatorUrl,
  estimateSummaryText,
  findTariffElement,
  parseAnswers,
} from "./estimate";
import { countOpenQuestions, preferenceImpacts, questionImpacts } from "./questions";
import { formatDate, formatMoney, todayIso, TRANSPORT_MODES } from "./format";

// Everything the Tariff Finder knows and can do; the page only lays it out.

export type View = "detailed" | "simple" | "compare";

// Countries shown side by side, including the main one
export const MAX_COMPARE = 3;

export const EXAMPLES = [
  { code: "7326.90.86.88", country: "CN", label: "Steel hardware", origin: "China" },
  { code: "8703.23.01.90", country: "DE", label: "Passenger car", origin: "Germany" },
  { code: "6109.10.00.12", country: "VN", label: "Cotton T-shirts", origin: "Vietnam" },
  { code: "9504.50.00.00", country: "JP", label: "Video game consoles", origin: "Japan" },
  { code: "9506.62.40.80", country: "PK", label: "Soccer balls", origin: "Pakistan" },
];
export type Example = (typeof EXAMPLES)[number];

const VIEW_STORAGE_KEY = "hts-hero-duty-calculator-view";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const countryByCode = (code: string | null) =>
  code ? Countries.find((c) => c.code === code.toUpperCase()) ?? null : null;

const positiveNumber = (raw: string | null, fallback: number) => {
  const parsed = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const isTariffLevel = (element: HtsElement) => htsCodeDigitsOnly(element.htsno).length >= 8;

// Inputs to start from instead of the address, e.g. a Tariff Tracker product and its adjustments
export interface FinderStart {
  element: HtsElement;
  country: Country;
  customsValue: number;
  quantity: number;
  entryDate: string;
  transportMode: TransportMode;
  claimedPreference?: string;
  answers?: Answers;
}

// path: the page the calculator is on, with any extra params its address needs. The address
// follows the inputs while syncAddress is on (off while the calculator is hidden on its page), and
// share links open it. initial starts it from given inputs rather than the address. track: false
// keeps its analytics quiet, for hosts that count their own (the tracker's product view).
export const useTariffFinder = ({
  path = CALCULATOR_PATH,
  extraParams,
  syncAddress = true,
  initial,
  track: trackAnalytics = true,
}: {
  path?: string;
  extraParams?: Record<string, string>;
  syncAddress?: boolean;
  initial?: FinderStart;
  track?: boolean;
} = {}) => {
  const searchParams = useSearchParams();
  const track = (event: MixpanelEvent, props?: Record<string, unknown>) => {
    if (trackAnalytics) trackEvent(event, props);
  };
  const { htsElements, fetchElements, revision: htsRevisionName } = useHts();
  const { sections, getSections } = useHtsSections();
  const { setBreadcrumbs } = useBreadcrumbs();

  // ── Inputs ──
  const [loading, setLoading] = useState(htsElements.length === 0);
  const [selectedElement, setSelectedElement] = useState<HtsElement | null>(initial?.element ?? null);
  // Countries of origin; the first is the main one (Detailed and Simple views), the rest are compared
  const [countries, setCountries] = useState<Country[]>(() => {
    if (initial) return [initial.country];
    const main = countryByCode(searchParams.get("country")) ?? countryByCode("CN");
    const others = (searchParams.get("compare") ?? "").split(",").map(countryByCode);
    return [main, ...others]
      .filter((c, i, all): c is Country => Boolean(c) && all.findIndex((x) => x?.code === c.code) === i)
      .slice(0, MAX_COMPARE);
  });
  const country = countries[0] ?? null;
  const [customsValue, setCustomsValueState] = useState(() => initial?.customsValue ?? positiveNumber(searchParams.get("value"), 10000));
  const [quantity, setQuantityState] = useState(() => initial?.quantity ?? positiveNumber(searchParams.get("units"), 1000));
  const [entryDate, setEntryDateState] = useState(() => {
    if (initial) return initial.entryDate;
    const date = searchParams.get("date");
    return date && ISO_DATE.test(date) ? date : todayIso();
  });
  const [transportMode, setTransportModeState] = useState<TransportMode>(() => {
    if (initial) return initial.transportMode;
    const mode = searchParams.get("mode");
    return TRANSPORT_MODES.some((m) => m.id === mode) ? (mode as TransportMode) : "ocean";
  });
  // Trade preference claimed per country code
  const [preferences, setPreferences] = useState<Record<string, string>>(() => {
    if (initial) return initial.claimedPreference ? { [initial.country.code]: initial.claimedPreference } : {};
    const pref = searchParams.get("pref");
    const main = countryByCode(searchParams.get("country")) ?? countryByCode("CN");
    return pref && main ? { [main.code]: pref } : {};
  });
  const claimedPreference = (country && preferences[country.code]) || "";
  const [answers, setAnswers] = useState<Answers>(() => initial?.answers ?? parseAnswers(searchParams.get("answers")));
  const [view, setView] = useState<View>(() => {
    const param = searchParams.get("view");
    return param === "simple" || param === "compare" ? param : "detailed";
  });
  const [showExplore, setShowExplore] = useState(false);
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);

  // Remember the preferred view on this device, unless the link specified one
  useEffect(() => {
    try {
      const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (!searchParams.get("view") && (storedView === "simple" || storedView === "detailed")) setView(storedView);
    } catch {
      // Storage can be unavailable (private mode); the defaults are fine
    }
    // Once, on arrival; later address changes mustn't reset the view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      track(MixpanelEvent.DUTY_CALCULATOR_EXPLORE_MODAL_OPENED, { source: "sub_tariff_code_selected" });
    },
    [sections, htsElements, setBreadcrumbs]
  );

  const selectElement = useCallback(
    (element: HtsElement | null, source: string) => {
      if (!element) {
        if (selectedElement) track(MixpanelEvent.DUTY_CALCULATOR_HTS_CODE_CLEARED);
        setSelectedElement(null);
        return;
      }
      if (!isTariffLevel(element)) {
        openExplorerAt(element);
        return;
      }
      setSelectedElement(element);
      track(MixpanelEvent.DUTY_CALCULATOR_HTS_CODE_SELECTED, {
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
    // The address bar follows the inputs (see below), so ?code= often names the code that's
    // already selected: nothing to do, and not a deep link
    if (match && selectedElement && htsCodesEqual(selectedElement.htsno, match.htsno)) return;
    if (match) {
      setShowExplore(false);
      selectElement(match, "url");
    }
    track(MixpanelEvent.DUTY_CALCULATOR_DEEP_LINK_OPENED, {
      had_country_param: Boolean(searchParams.get("country")),
      had_code_param: true,
      code_matched_element: Boolean(match),
    });
    // Only when the code param or data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam, htsElements.length]);

  // Answers and trade preference claims belong to one HTS code. They're shared across the
  // countries being compared, since heading confirmations only affect countries with that heading.
  const codeKey = selectedElement?.htsno ?? "";
  const previousCodeKey = useRef(codeKey);
  useEffect(() => {
    if (previousCodeKey.current === codeKey) return;
    // The first code (from a link, say) keeps the preference the link claimed
    const hadCode = previousCodeKey.current !== "";
    previousCodeKey.current = codeKey;
    if (!hadCode) return;
    setAnswers({});
    setPreferences({});
  }, [codeKey]);

  // ── Calculation ──
  const tariffElement = useMemo(
    () => (selectedElement ? findTariffElement(selectedElement, htsElements) : null),
    [selectedElement, htsElements]
  );

  const baseInput = useMemo(
    () =>
      selectedElement && country && tariffElement
        ? buildEstimateInput({
            element: selectedElement,
            tariffElement,
            country,
            asOf: ISO_DATE.test(entryDate) ? entryDate : todayIso(),
            customsValue,
            quantity,
            transportMode,
            claimedPreference,
          })
        : null,
    [selectedElement, country, tariffElement, entryDate, customsValue, quantity, claimedPreference, transportMode]
  );

  const result: CalculationResult | null = useMemo(
    () => (baseInput ? calculate(AllRules, { ...baseInput, answers }) : null),
    [baseInput, answers]
  );

  // The same entry on every verified date, to show how its duty has changed
  const historyRange = useMemo(() => {
    const verified = getVerifiedRevisions();
    const last = verified[verified.length - 1];
    return { from: verified[0].from, to: last.to ?? addDays(todayIso(), 1) };
  }, []);
  const history = useMemo(
    () =>
      baseInput && historyRange.from < historyRange.to
        ? calculateHistory(AllRules, { ...baseInput, answers }, historyRange.from, historyRange.to)
        : [],
    [baseInput, answers, historyRange]
  );

  // What each unanswered yes/no question would change, so users know which ones matter
  const impacts = useMemo(
    () => (baseInput && result ? questionImpacts(baseInput, result, answers) : {}),
    [baseInput, result, answers]
  );
  // And what claiming each trade preference would change
  const preferenceChanges = useMemo(
    () => (baseInput && result ? preferenceImpacts(baseInput, result, answers) : {}),
    [baseInput, result, answers]
  );

  // ── Comparison ──
  const compareCountries = useMemo(() => countries.slice(1), [countries]);

  const compareEntries: CompareEntry[] = useMemo(() => {
    if (!baseInput || !result || !country) return [];
    const primary: CompareEntry = {
      country,
      result,
      claimedPreference,
      openQuestions: countOpenQuestions(result, impacts),
    };
    return [
      primary,
      ...compareCountries.map((c) => {
        const input = { ...baseInput, country: c.code, claimedPreference: preferences[c.code] || undefined };
        const r = calculate(AllRules, { ...input, answers });
        return {
          country: c,
          result: r,
          claimedPreference: preferences[c.code] ?? "",
          openQuestions: countOpenQuestions(r, questionImpacts(input, r, answers)),
        };
      }),
    ];
  }, [baseInput, result, country, compareCountries, preferences, claimedPreference, answers, impacts]);

  // Show the comparison when a country is first added (including from a shared link, so this
  // starts at 0). Removing them all stays in Compare, which then offers to add one.
  const previousCompareCount = useRef(0);
  useEffect(() => {
    const count = compareCountries.length;
    if (previousCompareCount.current === 0 && count > 0) setView("compare");
    previousCompareCount.current = count;
    // Only when the number of compared countries changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareCountries.length]);

  // ── Analytics ──
  const lastViewedKey = useRef<string | null>(null);
  useEffect(() => {
    if (!result || !selectedElement || !country || !tariffElement) return;
    const key = `${selectedElement.htsno}-${country.code}`;
    if (lastViewedKey.current === key) return;
    lastViewedKey.current = key;
    track(MixpanelEvent.DUTY_CALCULATOR_RESULTS_VIEWED, {
      hts_code: selectedElement.htsno,
      country_code: country.code,
      tariff_basis_hts_code: tariffElement.htsno,
    });
  }, [result, selectedElement, country, tariffElement]);

  const trackLater = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const trackDebounced = (key: string, event: MixpanelEvent, props: Record<string, unknown>) => {
    clearTimeout(trackLater.current[key]);
    trackLater.current[key] = setTimeout(() => track(event, props), 1000);
  };

  // ── Actions ──
  const setCustomsValue = (value: number) => {
    setCustomsValueState(value);
    trackDebounced("value", MixpanelEvent.DUTY_CALCULATOR_CUSTOMS_VALUE_SET, { customs_value_usd: value });
  };

  const setQuantity = (value: number) => {
    setQuantityState(value);
    trackDebounced("units", MixpanelEvent.DUTY_CALCULATOR_UNITS_SET, { units: value });
  };

  const setEntryDate = (date: string, source?: string) => {
    setEntryDateState(date);
    if (source) track(MixpanelEvent.DUTY_CALCULATOR_ENTRY_DATE_SET, { entry_date: date, source });
    else trackDebounced("date", MixpanelEvent.DUTY_CALCULATOR_ENTRY_DATE_SET, { entry_date: date });
  };

  const setTransportMode = (mode: TransportMode) => {
    setTransportModeState(mode);
    track(MixpanelEvent.DUTY_CALCULATOR_TRANSPORT_MODE_SET, { mode });
  };

  const setPreference = (code: string, symbol: string) => {
    setPreferences((prev) => ({ ...prev, [code]: symbol }));
    track(MixpanelEvent.DUTY_CALCULATOR_PREFERENCE_CLAIMED, { symbol: symbol || "none", country_code: code });
  };

  const answer = (id: string, value: unknown) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "") delete next[id];
      else next[id] = value as Answers[string];
      return next;
    });
    track(MixpanelEvent.DUTY_CALCULATOR_QUESTION_ANSWERED, { input: id, answered: value !== undefined });
  };

  const changeView = (next: View) => {
    setView(next);
    track(MixpanelEvent.DUTY_CALCULATOR_VIEW_CHANGED, { view: next });
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // Not critical
    }
  };

  const shareUrl = () =>
    calculatorUrl({
      path,
      extra: extraParams,
      code: selectedElement?.htsno,
      country: country?.code,
      value: customsValue,
      units: result?.requiresQuantity ? quantity : undefined,
      date: entryDate,
      mode: transportMode,
      pref: claimedPreference,
      answers,
      compare: compareCountries.map((c) => c.code),
      view: view === "compare" ? "compare" : undefined,
    });

  // Keep the address bar in step with the inputs, so the URL always matches what's on screen
  // (and a copied address works like Share). replaceState changes the URL without navigating
  // or reloading; Next.js keeps useSearchParams in sync. Debounced for typing.
  useEffect(() => {
    if (loading || !syncAddress) return;
    // Don't drop a linked code from the address before it has loaded
    if (codeParam && !selectedElement) return;
    const timer = setTimeout(() => {
      const next = new URL(shareUrl());
      const current = new URL(window.location.href);
      if (next.pathname !== current.pathname) return;
      const target = `${next.pathname}?${next.searchParams.toString()}${current.hash}`;
      if (target !== `${current.pathname}${current.search}${current.hash}`) {
        window.history.replaceState(window.history.state, "", target);
      }
    }, 300);
    return () => clearTimeout(timer);
    // Every input that goes into the URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncAddress, loading, selectedElement, countries, customsValue, quantity, entryDate, transportMode, claimedPreference, answers, view, result?.requiresQuantity]);

  const comparing = view === "compare" && compareEntries.length > 0;
  const transportLabel = TRANSPORT_MODES.find((m) => m.id === transportMode)?.label ?? "";

  const summaryText = () => {
    if (!result || !selectedElement || !country) return "";
    if (comparing) {
      return [
        `Duty comparison · HTS ${selectedElement.htsno}`,
        `Entry ${formatDate(result.asOf)} · ${transportLabel} · Customs value ${formatMoney(customsValue)}`,
        "",
        "Country".padEnd(28) + "Total duty".padStart(16) + "Fees".padStart(12) + "Landed cost".padStart(16),
        ...compareEntries.map(
          (e) =>
            e.country.name.slice(0, 26).padEnd(28) +
            formatMoney(e.result.totalDuty).padStart(16) +
            formatMoney(e.result.totalFees).padStart(12) +
            formatMoney(customsValue + e.result.totalDuty + e.result.totalFees).padStart(16)
        ),
        "",
        shareUrl(),
      ].join("\n");
    }
    return estimateSummaryText({
      result,
      htsno: selectedElement.htsno,
      country,
      customsValue,
      transportLabel,
      link: shareUrl(),
    });
  };

  const copy = async (kind: "link" | "summary") => {
    const ok = await copyToClipboard(kind === "link" ? shareUrl() : summaryText());
    if (!ok) return;
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
    track(
      kind === "link" ? MixpanelEvent.DUTY_CALCULATOR_SHARE_RESULTS_COPIED : MixpanelEvent.DUTY_CALCULATOR_RESULTS_COPIED,
      { hts_code: selectedElement?.htsno, country_code: country?.code, is_modal: false }
    );
  };

  const selectExample = (example: Example) => {
    const element = htsElements.find((el) => htsCodesEqual(el.htsno, example.code));
    if (!element) return;
    setCountries([countryByCode(example.country)]);
    selectElement(element, "example");
    track(MixpanelEvent.DUTY_CALCULATOR_EXAMPLE_SELECTED, { hts_code: example.code, country_code: example.country });
  };

  const changeCountries = (next: Country[]) => {
    if (next[0]?.code !== country?.code) {
      track(MixpanelEvent.DUTY_CALCULATOR_COUNTRY_CHANGED, { country_code: next[0]?.code ?? null });
    }
    if (next.length !== countries.length) {
      track(MixpanelEvent.DUTY_CALCULATOR_COMPARE_CHANGED, { countries: next.map((c) => c.code).join(",") });
    }
    setCountries(next);
  };

  const removeCountry = (code: string) => changeCountries(countries.filter((c) => c.code !== code));

  // "View details" on a compared country makes it the main one; the others stay compared
  const viewCountryDetails = (target: Country) => {
    if (target.code !== country?.code) {
      changeCountries([target, ...countries.filter((c) => c.code !== target.code)]);
    }
    changeView("detailed");
  };

  const openExplore = (source = "description_search_button") => {
    setShowExplore(true);
    track(MixpanelEvent.DUTY_CALCULATOR_EXPLORE_MODAL_OPENED, { source });
  };

  const closeExplore = () => {
    setShowExplore(false);
    track(MixpanelEvent.DUTY_CALCULATOR_EXPLORE_MODAL_CLOSED);
  };

  useEffect(() => {
    if (!showExplore) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeExplore();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExplore]);

  // ── Derived display state ──

  // The first unit is the one duty is charged in; later ones are statistical reporting units
  const units = [...(selectedElement?.units ?? []), ...(tariffElement?.units ?? [])].filter(
    (u, i, all) => u && all.indexOf(u) === i
  );

  return {
    // Inputs
    loading,
    codeParam,
    selectedElement,
    selectElement,
    countries,
    country,
    changeCountries,
    removeCountry,
    customsValue,
    setCustomsValue,
    quantity,
    setQuantity,
    unitLabel: units[0] ?? "units",
    entryDate,
    setEntryDate,
    transportMode,
    setTransportMode,
    transportLabel,
    claimedPreference,
    preferences,
    setPreference,
    answers,
    answer,
    // Results
    result,
    impacts,
    preferenceChanges,
    history,
    historyRange,
    openQuestions: result ? countOpenQuestions(result, impacts) : 0,
    compareCountries,
    compareEntries,
    comparing,
    htsRevisionName,
    latestVerified: getLatestVerifiedRevision(),
    verified: isVerifiedDate(entryDate),
    revisionForDate: getRevisionForDate(entryDate),
    // Presentation
    view,
    changeView,
    viewCountryDetails,
    copied,
    copy,
    selectExample,
    showExplore,
    openExplore,
    closeExplore,
  };
};

export type TariffFinder = ReturnType<typeof useTariffFinder>;
