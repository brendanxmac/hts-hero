"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Countries, Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { useHts } from "../../contexts/HtsContext";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import { useBreadcrumbs } from "../../contexts/BreadcrumbsContext";
import {
  generateBreadcrumbsForHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../../libs/hts";
import { htsCodeDigitsOnly, htsCodesEqual, normalizeHtsCode } from "../../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { copyToClipboard } from "../../utilities/data";
import { findTariffElement } from "../../tariffs/tariff-calculations";
import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { getLatestVerifiedRevision, getRevisionForDate, isVerifiedDate } from "../../tariffs/engine-v2/revisions";
import { Answers, CalculationInput, CalculationResult, TransportMode } from "../../tariffs/engine-v2/types";
import { CompareEntry } from "./Compare";
import { formatDate, formatMoney, formatPct, todayIso, TRANSPORT_MODES } from "./format";

// Everything the Tariff Finder knows and can do, shared by every design. Designs only lay it out.

export type View = "detailed" | "simple" | "compare";

export type Design = "classic" | "receipt" | "workbench" | "dashboard";

export const DESIGNS: { id: Design; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "receipt", label: "Receipt" },
  { id: "workbench", label: "Workbench" },
  { id: "dashboard", label: "Dashboard" },
];

// Countries shown side by side, including the main one
export const MAX_COMPARE = 3;

export const EXAMPLES = [
  { code: "7326.90.86.88", country: "CN", label: "Steel hardware", origin: "China" },
  { code: "8703.23.01.90", country: "DE", label: "Passenger car", origin: "Germany" },
  { code: "6109.10.00.12", country: "VN", label: "Cotton T-shirts", origin: "Vietnam" },
];
export type Example = (typeof EXAMPLES)[number];

const VIEW_STORAGE_KEY = "hts-hero-duty-calculator-view";
const DESIGN_STORAGE_KEY = "hts-hero-duty-calculator-design";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const countryByCode = (code: string | null) =>
  code ? Countries.find((c) => c.code === code.toUpperCase()) ?? null : null;

const positiveNumber = (raw: string | null, fallback: number) => {
  const parsed = raw ? parseFloat(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const isDesign = (value: string | null): value is Design => DESIGNS.some((d) => d.id === value);

const isTariffLevel = (element: HtsElement) => htsCodeDigitsOnly(element.htsno).length >= 8;

// How much answering "yes" instead of "no" changes duty and fees, for every yes/no question.
// Answered ones are measured the other way round, so a question keeps its sign (and its place
// in any grouping) after it's answered.
const questionImpacts = (input: CalculationInput, result: CalculationResult, answers: Answers) => {
  const current = result.totalDuty + result.totalFees;
  const out: Record<string, number> = {};
  result.questions
    .filter((q) => q.input.type === "boolean")
    .forEach((q) => {
      const id = q.input.id;
      const yes = answers[id] === true;
      const next = { ...answers };
      if (yes) delete next[id];
      else next[id] = true;
      const alt = calculate(AllRules, { ...input, answers: next });
      const delta = alt.totalDuty + alt.totalFees - current;
      out[id] = yes ? -delta : delta;
    });
  return out;
};

// Open questions whose answer would change the amount
const countOpenQuestions = (result: CalculationResult, impacts: Record<string, number>) =>
  result.questions.filter(
    (q) => !q.answered && (q.input.type !== "boolean" || Math.abs(impacts[q.input.id] ?? 0) >= 0.005)
  ).length;

export const useTariffFinder = () => {
  const searchParams = useSearchParams();
  const { htsElements, fetchElements, revision: htsRevisionName } = useHts();
  const { sections, getSections } = useHtsSections();
  const { setBreadcrumbs } = useBreadcrumbs();

  // ── Inputs ──
  const [loading, setLoading] = useState(htsElements.length === 0);
  const [selectedElement, setSelectedElement] = useState<HtsElement | null>(null);
  // Countries of origin; the first is the main one (Detailed and Simple views), the rest are compared
  const [countries, setCountries] = useState<Country[]>(() => {
    const main = countryByCode(searchParams.get("country")) ?? countryByCode("CN");
    const others = (searchParams.get("compare") ?? "").split(",").map(countryByCode);
    return [main, ...others]
      .filter((c, i, all): c is Country => Boolean(c) && all.findIndex((x) => x?.code === c.code) === i)
      .slice(0, MAX_COMPARE);
  });
  const country = countries[0] ?? null;
  const [customsValue, setCustomsValueState] = useState(() => positiveNumber(searchParams.get("value"), 10000));
  const [quantity, setQuantityState] = useState(() => positiveNumber(searchParams.get("units"), 1000));
  const [entryDate, setEntryDateState] = useState(() => {
    const date = searchParams.get("date");
    return date && ISO_DATE.test(date) ? date : todayIso();
  });
  const [transportMode, setTransportModeState] = useState<TransportMode>(() => {
    const mode = searchParams.get("mode");
    return TRANSPORT_MODES.some((m) => m.id === mode) ? (mode as TransportMode) : "ocean";
  });
  // Trade preference claimed per country code
  const [preferences, setPreferences] = useState<Record<string, string>>(() => {
    const pref = searchParams.get("pref");
    const main = countryByCode(searchParams.get("country")) ?? countryByCode("CN");
    return pref && main ? { [main.code]: pref } : {};
  });
  const claimedPreference = (country && preferences[country.code]) || "";
  const [answers, setAnswers] = useState<Answers>({});
  const [view, setView] = useState<View>(() => {
    const param = searchParams.get("view");
    return param === "simple" || param === "compare" ? param : "detailed";
  });
  const [design, setDesign] = useState<Design>(() => {
    const param = searchParams.get("design");
    return isDesign(param) ? param : "classic";
  });
  const [showExplore, setShowExplore] = useState(false);
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);

  // Remember the preferred view and design on this device, unless the link specified them
  useEffect(() => {
    try {
      const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (!searchParams.get("view") && (storedView === "simple" || storedView === "detailed")) setView(storedView);
      const storedDesign = window.localStorage.getItem(DESIGN_STORAGE_KEY);
      if (!searchParams.get("design") && isDesign(storedDesign)) setDesign(storedDesign);
    } catch {
      // Storage can be unavailable (private mode); the defaults are fine
    }
    // Once, on arrival; later address changes (like switching designs) mustn't reset the view
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

  // Answers and trade preference claims belong to one HTS code. They're shared across the
  // countries being compared, since heading confirmations only affect countries with that heading.
  const codeKey = selectedElement?.htsno ?? "";
  const previousCodeKey = useRef(codeKey);
  useEffect(() => {
    if (previousCodeKey.current === codeKey) return;
    previousCodeKey.current = codeKey;
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
  const impacts = useMemo(
    () => (baseInput && result ? questionImpacts(baseInput, result, answers) : {}),
    [baseInput, result, answers]
  );

  // ── Comparison ──
  const compareCountries = useMemo(() => countries.slice(1), [countries]);

  const compareEntries: CompareEntry[] = useMemo(() => {
    if (!baseInput || !result || !country || compareCountries.length === 0) return [];
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
  // starts at 0); leave it when none are left
  const previousCompareCount = useRef(0);
  useEffect(() => {
    const count = compareCountries.length;
    if (previousCompareCount.current === 0 && count > 0) setView("compare");
    if (count === 0 && view === "compare") setView("detailed");
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
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_RESULTS_VIEWED, {
      hts_code: selectedElement.htsno,
      country_code: country.code,
      tariff_basis_hts_code: tariffElement.htsno,
      design,
    });
  }, [result, selectedElement, country, tariffElement, design]);

  const trackLater = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const trackDebounced = (key: string, event: MixpanelEvent, props: Record<string, unknown>) => {
    clearTimeout(trackLater.current[key]);
    trackLater.current[key] = setTimeout(() => trackEvent(event, props), 1000);
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
    if (source) trackEvent(MixpanelEvent.DUTY_CALCULATOR_ENTRY_DATE_SET, { entry_date: date, source });
    else trackDebounced("date", MixpanelEvent.DUTY_CALCULATOR_ENTRY_DATE_SET, { entry_date: date });
  };

  const setTransportMode = (mode: TransportMode) => {
    setTransportModeState(mode);
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_TRANSPORT_MODE_SET, { mode });
  };

  const setPreference = (code: string, symbol: string) => {
    setPreferences((prev) => ({ ...prev, [code]: symbol }));
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_PREFERENCE_CLAIMED, { symbol: symbol || "none", country_code: code });
  };

  const answer = (id: string, value: unknown) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "") delete next[id];
      else next[id] = value as Answers[string];
      return next;
    });
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_QUESTION_ANSWERED, { input: id, answered: value !== undefined });
  };

  const changeView = (next: View) => {
    setView(next);
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_VIEW_CHANGED, { view: next });
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // Not critical
    }
  };

  const changeDesign = (next: Design) => {
    setDesign(next);
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_DESIGN_CHANGED, { design: next });
    try {
      window.localStorage.setItem(DESIGN_STORAGE_KEY, next);
    } catch {
      // Not critical
    }
    // Keep the address shareable without reloading or re-reading the other params
    const url = new URL(window.location.href);
    if (next === "classic") url.searchParams.delete("design");
    else url.searchParams.set("design", next);
    // null state: Next.js then keeps its router (and useSearchParams) in sync with the new address
    window.history.replaceState(null, "", url.toString());
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
    if (compareCountries.length) params.set("compare", compareCountries.map((c) => c.code).join(","));
    if (view === "compare" && compareCountries.length) params.set("view", "compare");
    if (design !== "classic") params.set("design", design);
    return `${window.location.origin}/duty-calculator?${params.toString()}`;
  };

  const comparing = view === "compare" && compareEntries.length > 1;
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
    return [
      `Duty estimate · HTS ${selectedElement.htsno} from ${country.name}`,
      `Entry ${formatDate(result.asOf)} · ${transportLabel} · Customs value ${formatMoney(customsValue)}`,
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
    ].join("\n");
  };

  const copy = async (kind: "link" | "summary") => {
    const ok = await copyToClipboard(kind === "link" ? shareUrl() : summaryText());
    if (!ok) return;
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
    trackEvent(
      kind === "link" ? MixpanelEvent.DUTY_CALCULATOR_SHARE_RESULTS_COPIED : MixpanelEvent.DUTY_CALCULATOR_RESULTS_COPIED,
      { hts_code: selectedElement?.htsno, country_code: country?.code, is_modal: false, design }
    );
  };

  const selectExample = (example: Example) => {
    const element = htsElements.find((el) => htsCodesEqual(el.htsno, example.code));
    if (!element) return;
    setCountries([countryByCode(example.country)]);
    selectElement(element, "example");
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_EXAMPLE_SELECTED, { hts_code: example.code, country_code: example.country });
  };

  const changeCountries = (next: Country[]) => {
    if (next[0]?.code !== country?.code) {
      trackEvent(MixpanelEvent.DUTY_CALCULATOR_COUNTRY_CHANGED, { country_code: next[0]?.code ?? null });
    }
    if (next.length !== countries.length) {
      trackEvent(MixpanelEvent.DUTY_CALCULATOR_COMPARE_CHANGED, { countries: next.map((c) => c.code).join(",") });
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
    trackEvent(MixpanelEvent.DUTY_CALCULATOR_EXPLORE_MODAL_OPENED, { source });
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
  // The last few description levels, e.g. "Other articles of iron or steel › Other › Other"
  const codeDescription = useMemo(
    () =>
      selectedElement
        ? [...getHtsElementParents(selectedElement, htsElements), selectedElement]
            .map((el) => el.description.replace(/<[^>]+>/g, "").replace(/:\s*$/, "").trim())
            .filter(Boolean)
            .slice(-3)
            .join(" › ")
        : "",
    [selectedElement, htsElements]
  );

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
    codeDescription,
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
    design,
    changeDesign,
    copied,
    copy,
    selectExample,
    showExplore,
    openExplore,
    closeExplore,
  };
};

export type TariffFinder = ReturnType<typeof useTariffFinder>;
