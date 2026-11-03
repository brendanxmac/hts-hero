"use client";

import {
  ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { ExclamationTriangleIcon, ArrowRightIcon, BellAlertIcon } from "@heroicons/react/20/solid";
import { useHts } from "@/contexts/HtsContext";
import { Question } from "@/tariffs/engine-v2/types";
import * as ui from "@/components/ui/styles";
import { ComparePanel } from "../compare/ComparePanel";
import { productFromFinder } from "@/components/tariff-tracker/report";
import { provenPicks } from "@/components/tariff-tracker/product/analysis/analysis";
import { Countries } from "@/constants/countries";
import { CENSUS_NOTICE } from "../lib/census";
import { formatImportValue, useUsImports } from "../lib/usImports";
import { CardRow } from "@/components/ui/Card";
import { TabBar } from "@/components/ui/TabBar";
import { formatPct } from "../lib/format";
import { AccountGate, QUICK_ACCOUNT } from "@/components/tariff-tracker/access/AccountGate";
import { ONBOARDING_PATH } from "@/libs/signup-onboarding";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { whatClaimingDoes, whatItWouldDo } from "../lib/explain";
import { plainReasons } from "../lib/plainReason";
import { sortBySpecificity } from "../lib/questions";
import { MAX_COMPARE, TariffFinder } from "../lib/useTariffFinder";
import { ProhibitedNotice } from "../notices/ProhibitedNotice";
import { AdcvdTab } from "@/components/adcvd/AdcvdTab";
import { AdcvdDutyTeaser, useAdcvdFlagged } from "@/components/adcvd/AdcvdTeasers";
import { NewsTab, useNewsCount } from "../news/NewsTab";
import { VerifiedNotice } from "../notices/VerifiedNotice";
import { RateHistoryCard } from "../rate-history";
import {
  CostBar,
  NotAppliedPanel,
  PreferenceClaim,
  QuestionsPanel,
  sliceColorsFor,
  SummaryStats,
} from "../results";
import { DutyBreakdown, LinesDetail } from "./DutyBreakdown";
import { EmptyState } from "./EmptyState";
import { EntryDetails, ResultsBox, ResultsHeading } from "./CalculatorTop";
import {
  CheckSavingsLink,
  QUALIFY_TRIAL,
  QualifyHeaderLink,
  QualifyLink,
  RefundsButton,
} from "./PremiumTeasers";
import { AccountPitch, useConversion } from "./ConversionDialog";
import { OverviewPanel } from "../overview/OverviewPanel";
import { useOverview } from "../overview/useOverview";
import { ShareButtons, ViewInHtsButton } from "./ShareButtons";
import { useCanSeeWhy, WhyLocked, WhyUnlockContext } from "./WhyGate";
import { ArrowLink } from "./ArrowLink";
import { alertPitch, useTrackImport } from "../landing/TrackImportButton";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { useStickyColumn } from "./useStickyColumn";

// The Tariff Calculator, as on /duty-calculator, the country pages and Duty Guard's
// Calculator tab. The entry details run across the top; the results below have four tabs (an
// import's page in Duty Guard adds the Overview first: everything about this tariff at a high
// level, ../overview; on /duty-calculator, "Get Alerts, Insights & News" sells it with the alerts):
// - Duty (where the results open): the totals full width, then the duty breakdown (with the headings checked but not
//   applied at its foot) beside the possible adjustments (and Duty Guard's qualification check,
//   teased), which move with the page. What the
//   last answer changed is marked in the breakdown. Under the totals, the main way up: an alert on
//   this rate.
// - History: Duty Over Time, the rate history and every change in it (a free account; the tab counts
//   the changes)
// - Compare: other origins side by side, then the Analysis: this import's duty from every origin
//   (a free account)
// - AD/CVD Cases: the AD/CVD check, antidumping and countervailing duties that may cover it (a free
//   account; a line under the Duty tab's totals says whether a case may apply, and leads here)
// - News: every tariff action that may touch it (a free account; the tab counts them)
// An import's page in Duty Guard has the same tabs, held by its own header

type ResultsView = "overview" | "duty" | "history" | "compare" | "adcvd" | "news";
// Changes (History and News together) is gone; older links and hosts asking for it get History
export type ResultsTab = ResultsView | "changes";

const viewOf = (tab: ResultsTab): ResultsView => (tab === "changes" ? "history" : tab);

// Before the AD/CVD notice's sign-up. Never says whether a case was found
const ADCVD_PITCH: AccountPitch = {
  title: "See if AD/CVD cases cover this import",
  subtitle: "Antidumping and countervailing duties can be many times the regular rate, and aren't in this estimate.",
  points: [
    { icon: "shield", title: "Every case that may cover it", body: "Checked against antidumping and countervailing duty cases." },
    { icon: "money", title: "Their rates and named suppliers", body: "See what each case could add to your duty." },
    { icon: "bolt", title: "Free with any account", body: "The full check, on any import you look up." },
  ],
  cta: "Create My Free Account",
};

const LOCAL_VIEWS = ["changes", "history", "adcvd", "news"] as const;

// The calculator's own tabs. The Overview is an import's page's first tab in Duty Guard only:
// here Duty comes first and fast
const TABS: { id: ResultsView; label: string }[] = [
  { id: "duty", label: "Duty" },
  { id: "history", label: "History" },
  { id: "compare", label: "Compare" },
  { id: "adcvd", label: "AD/CVD Cases" },
  { id: "news", label: "News" },
];

export const CalculatorWorkspace = ({
  f,
  actions,
  empty,
  page,
  fixedProduct = false,
  onCheckSavings,
  tab: hostTab,
  onTabChange,
  pageTitle,
}: {
  f: TariffFinder;
  // In the results' heading, after Share: the host's main action (Add to catalog, Track this import)
  actions?: ReactNode;
  // In place of the results before there are any (the default prompt otherwise)
  empty?: ReactNode;
  // For analytics: where the account gates sit
  page: "calculator" | "tracker_calculator" | "tracker_product";
  // A catalog product's own page: its header says what it is and holds the fields that can change
  // (ImportInputs), so there's no Entry details and the results have no heading of their own
  fixedProduct?: boolean;
  // In Duty Guard: where "Check Possible Savings" goes (this import's savings); Duty Guard's
  // Savings section when left out
  onCheckSavings?: () => void;
  // A host whose own menu holds the tabs (Duty Guard's import page): which one is open (the
  // results then show no tab row of their own), and the way to change it
  tab?: ResultsTab;
  onTabChange?: (tab: ResultsView) => void;
  // In Duty Guard: the page's title and line, in the Entry details card (the page's header)
  pageTitle?: { title: string; summary: string };
}) => {
  const { htsElements } = useHts();
  const searchParams = useSearchParams();
  const { result, selectedElement, country } = f;

  // Compare is the finder's own view (so a shared link opens on it); Duty Over Time is this
  // page's. `view=analysis` (links from the MCP server) opens on Compare, where the Analysis is.
  // The results open on Duty, unless a link asks for History, AD/CVD or News
  const [localTab, setLocalTab] = useState<Exclude<ResultsView, "compare">>(() => {
    const view = LOCAL_VIEWS.find((v) => v === searchParams.get("view"));
    // Older links to Changes open on its first part
    return view ? (viewOf(view) as Exclude<ResultsView, "compare">) : "duty";
  });
  const ownTab: ResultsView = f.view === "compare" ? "compare" : localTab;
  const tab: ResultsView = hostTab ? viewOf(hostTab) : ownTab;
  useEffect(() => {
    if (searchParams.get("view") === "analysis") f.changeView("compare", true);
    // Once, on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const changeTab = (asked: ResultsTab, source: "tabs" | "adcvd_teaser" = "tabs") => {
    if (onTabChange) return onTabChange(viewOf(asked));
    const next = viewOf(asked);
    // The results' tabs (Duty, History, AD/CVD, News, Compare), by the user
    if (next !== tab)
      trackEvent(MixpanelEvent.DUTY_CALCULATOR_TAB_OPENED, { tab: next, from_tab: tab, source, hts_code: f.selectedElement ? htsCodeDigitsOnly(f.selectedElement.htsno) : null, country_code: f.country?.code ?? null });
    if (next !== "compare") setLocalTab(next);
    // The address says Compare only while it's open
    f.changeView(next === "compare" ? "compare" : "detailed");
  };

  // Kept here, so they survive switching tabs
  const [highlight, setHighlight] = useState<string | null>(null);
  // The Overview tab's story, worked out while it's open
  // The Overview tab (an import's page in Duty Guard); on /duty-calculator, its numbers for
  // Get Insights' pitch
  const overview = useOverview(f, tab === "overview" || page === "calculator");
  const [linesDetail, setLinesDetail] = useState<LinesDetail>("compact");
  const [adjustmentsRef, adjustmentsTop] = useStickyColumn();

  // The Analysis is worked out only while Compare is open, and only when an input changes (a beat
  // behind typing): the same product keeps the same identity, so it isn't redone needlessly
  const inputsKey = useDeferredValue(
    JSON.stringify([
      f.selectedElement?.htsno,
      f.country?.code,
      f.customsValue,
      f.quantity,
      f.entryDate,
      f.transportMode,
      f.claimedPreference,
      f.answers,
    ]),
  );
  const product = useMemo(
    () => (tab === "compare" ? productFromFinder(f, htsElements) : null),
    // The inputs, through their key
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, inputsKey, htsElements],
  );

  // Compare starts on two of the countries that already ship this to the US, the cheaper ones first
  // (Census), once per product and origin; after that the choice is the user's
  const imports = useUsImports(tab === "compare" ? selectedElement?.htsno : undefined);
  const autoPicked = useRef(new Map<string, string[]>());
  const pickKey = `${selectedElement?.htsno}|${country?.code}`;
  useEffect(() => {
    if (tab !== "compare" || !product || !imports || autoPicked.current.has(pickKey)) return;
    // Opened already comparing (a shared link): leave the choice as it is
    if (f.countries.length !== 1) {
      autoPicked.current.set(pickKey, []);
      return;
    }
    // Two, so yours plus two leaves room to add one: "Add a country" is always in view
    const picks = provenPicks(product, imports, 2);
    autoPicked.current.set(pickKey, picks);
    if (picks.length) {
      f.changeCountries(
        [
          ...f.countries,
          ...Countries.filter((c) => picks.includes(c.code)).sort((a, b) => picks.indexOf(a.code) - picks.indexOf(b.code)),
        ],
        true
      );
    }
    // When Compare opens on a product, or its figures arrive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, product, imports, pickKey]);
  // The picked countries still compared, to say why they're there
  const picked = (autoPicked.current.get(pickKey) ?? []).filter((code) => f.countries.some((c) => c.code === code));
  const dutyOf = (code: string | undefined) => f.compareEntries.find((e) => e.country.code === code)?.result.totalDuty;
  const pickedCheaper = picked.every((code) => (dutyOf(code) ?? Infinity) < (dutyOf(country?.code) ?? -Infinity) - 0.005);
  const pickedNote =
    imports && picked.length > 0
      ? `${picked
        .map((code) => {
          const name = Countries.find((c) => c.code === code)?.name ?? code;
          return `${name} (${formatImportValue(imports.byCountry.get(code)?.value ?? 0)})`;
        })
        .join(" and ")} ${picked.length === 1 ? "is" : "are"}${pickedCheaper ? ` cheaper than ${country?.name} and` : ""} among the largest suppliers of ${imports.level === 10 ? "this product" : "products like this"} to the US, by ${imports.year} imports.`
      : null;

  const ready = Boolean(result && selectedElement && country && !f.loading);
  // Each tariff's color, the same on every date (the chart, the cost bar, the breakdown)
  const sliceColors = useMemo(
    () => (result ? sliceColorsFor([...f.history.map((s) => s.result), result]) : {}),
    [f.history, result],
  );

  // The possible adjustments hold still while answering: every question the entry had before any
  // answer, plus any an answer brings up, in one order, each with what it would do in plain English
  const unadjusted = f.unadjustedResult;
  const stableQuestions = useMemo(() => {
    if (!result) return [];
    const byId = new Map<string, Question>();
    [...(unadjusted?.questions ?? []), ...result.questions].forEach((q) =>
      byId.set(
        q.input.id,
        result.questions.find((r) => r.input.id === q.input.id) ?? q,
      ),
    );
    return sortBySpecificity(Array.from(byId.values()), result.asOf);
  }, [result, unadjusted]);
  const questionNotes = useMemo(
    () =>
      result
        ? Object.fromEntries(
          stableQuestions.map((q) => [
            q.input.id,
            whatItWouldDo(q, result, unadjusted ?? null) ?? "",
          ]),
        )
        : {},
    [stableQuestions, result, unadjusted],
  );
  const preferences =
    (unadjusted?.availablePreferences.length ? unadjusted : result)
      ?.availablePreferences ?? [];
  // A claimed program has no live amount (the engine says what unclaimed ones would do): it keeps
  // showing what claiming it did
  const rememberedPrefs = useRef<Record<string, number>>({});
  Object.entries(f.preferenceChanges).forEach(([symbol, v]) => {
    if (Math.abs(v) >= 0.005) rememberedPrefs.current[symbol] = v;
  });
  const prefImpacts = f.claimedPreference
    ? {
      ...f.preferenceChanges,
      [f.claimedPreference]: rememberedPrefs.current[f.claimedPreference],
    }
    : f.preferenceChanges;
  // Possible Adjustments in two tiers: anyone sees each adjustment, its amount and what it would
  // change; Duty Guard works out which ones the goods qualify for (CheckSavingsLink, QualifyLink).
  // The rest of the plain-English why takes a free account (WhyGate)
  const { canSee: canSeeWhy, loading: whyLoading } = useCanSeeWhy();
  // The way up from each tab (PremiumTeasers): its pitches, in one dialog
  const conversion = useConversion(page);
  const signedOut = !whyLoading && !canSeeWhy;
  // How often the duty on this import changed: counted in the Recent Changes tab
  const historyChanges = f.history.filter((x) => x.changes.length > 0).length;
  // What's waiting on AD/CVD and the News tab. Signed out, AD/CVD isn't looked up (null): the Duty
  // tab only teases that it may apply
  const adcvdFlagged = useAdcvdFlagged(selectedElement?.htsno ?? "", country?.code ?? "");
  const newsCount = useNewsCount(selectedElement?.htsno, country?.code);
  // The calculator's one main way up: an alert on this import's rate, or all their searches (a free
  // account, and the imports saved to Duty Guard, which starts the trial). track: this import (a free account, and the import saved to
  // Duty Guard, where it's watched for tariff changes; its savings and past entries are checked
  // there too once savings and audits are back, features.ts)
  const track = useTrackImport(f, "track-import");
  const ratePct = result && f.customsValue > 0 ? Math.round((result.totalDuty / f.customsValue) * 1000) / 10 : null;
  // Under the totals, in the Duty tab, led by how this rate has behaved
  const moved = overview?.changes ?? historyChanges;
  const trackButton = page === "calculator" && track && (
    <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-primary/50 px-3.5 py-3 lg:flex-nowrap">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content" aria-hidden>
          <BellAlertIcon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-bold leading-snug text-base-content">
            {moved > 0 ? `This rate has changed ${moved === 1 ? "once" : `${moved} times`} recently.` : "Tariffs change fast."}
          </p>
          <p className="m-0 text-xs leading-snug text-base-content/70">
            {moved > 0 ? "Know before it moves again by setting up alerts" : "Know before this rate moves by setting up alerts"}
          </p>
        </div>
        <button
          type="button"
          className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-content transition-colors hover:bg-primary/90"
          onClick={() =>
            track.alertMe(
              alertPitch(
                ratePct !== null ? `Get alerted if ${formatPct(ratePct)} changes` : "Get alerted if this rate changes",
                "this import",
                moved > 0 ? `This rate has changed ${moved === 1 ? "once" : `${moved} times`} recently.` : undefined,
              ),
            )
          }
        >
          {ratePct !== null ? `Alert Me if ${formatPct(ratePct)} Changes` : "Alert Me if This Rate Changes"}
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
    </div>
  );
  // A locked "why" opens the free account's pitch, led by what was clicked
  const unlockWhy = (where: string) =>
    conversion.openAccount(
      where === "not_applied"
        ? {
          title: "See why the other tariffs don't apply, free",
          highlight: "ruled-out",
          cta: "Create my free account",
        }
        : {
          title: "See why each tariff applies, free",
          highlight: "why",
          cta: "Create my free account",
        },
      `why-${where}`,
    );
  // Shown while there's anything to adjust, before or after answering
  const hasAdjustments = stableQuestions.length > 0 || preferences.length > 0;
  const explainReason = useMemo(
    () =>
      result ? plainReasons(result, unadjusted?.questions) : (r: string) => r,
    [result, unadjusted],
  );

  // Signed out, History, Compare and News are behind a free account: the onboarding, then straight
  // back here, on this tab (the address holds the import and every input)
  const unlockRedirect = (view: "history" | "compare" | "adcvd" | "news") => () => {
    const here = new URL(window.location.href);
    here.searchParams.set("view", view);
    return `${ONBOARDING_PATH}?from=calculator_unlock&next=${encodeURIComponent(`${here.pathname}${here.search}`)}`;
  };
  // Their own numbers, for the teasers over those tabs
  const stepValues = overview?.steps.map((s) => s.value) ?? [];
  const low = stepValues.length ? Math.round(Math.min(...stepValues) * 10) / 10 : 0;
  const high = stepValues.length ? Math.round(Math.max(...stepValues) * 10) / 10 : 0;
  const historyTitle = low !== high ? `This Duty Swung From ${formatPct(low)} to ${formatPct(high)}` : "See What Moves This Duty";

  const rateHistory = (
    <RateHistoryCard
      f={f}
      sliceColors={sliceColors}
      highlight={highlight}
      onHighlight={setHighlight}
      headerAction={
        page === "calculator" ? (
          track && <ArrowLink onClick={() => track.start("history")}>Track this import</ArrowLink>
        ) : (
          <RefundsButton conversion={conversion} history={f.history} customsValue={f.customsValue} />
        )
      }
    />
  );

  const comparePanel = (compared: NonNullable<typeof product>) => (
    <ComparePanel
      product={compared}
      page={page}
      countries={f.countries}
      max={MAX_COMPARE}
      entryDate={f.entryDate}
      onTrack={() => track?.start("compare")}
      onCreateAccount={
        conversion.signedIn
          ? undefined
          : () =>
            conversion.openAccount(
              { title: "Unlock Advanced Sourcing Intelligence, 100% free", highlight: "analysis", cta: "Create my free account" },
              "compare-advanced",
            )
      }
      onAdd={(added) => f.changeCountries([...f.countries, added])}
      onRemove={f.removeCountry}
      onReplace={(code, next) => {
        if (f.countries.some((c) => c.code === next.code)) return;
        f.changeCountries(f.countries.map((c) => (c.code === code ? next : c)));
      }}
      onViewDetails={(c, preference) => {
        setLocalTab("duty");
        if (preference) f.setPreference(c.code, preference);
        f.viewCountryDetails(c);
      }}
      note={
        pickedNote && (
          <p className={ui.caption}>
            {pickedNote} Source: U.S. Census Bureau. {CENSUS_NOTICE}
          </p>
        )
      }
    />
  );

  return (
    // Two groups a page tier apart: the inputs, then the results (their heading and modules, close together)
    <div className="flex flex-col gap-page">
      {/* The inputs: their own card. On an import's own page, its header holds them */}
      {!fixedProduct && <EntryDetails f={f} description="Enter the details of your import to get a duty estimate" pageTitle={pageTitle} />}

      {f.loading ? (
        <ResultsSkeleton />
      ) : !ready || !result || !selectedElement || !country ? (
        (empty ?? <EmptyState f={f} />)
      ) : (
        <WhyUnlockContext.Provider value={unlockWhy}>
          <ResultsBox
            view={tab}
            heading={
              fixedProduct ? undefined : (
                <ResultsHeading
                  f={f}
                  actions={
                    <>
                      <ViewInHtsButton f={f} />
                      <ShareButtons f={f} />
                      {actions}
                    </>
                  }
                  tabs={
                    hostTab ? undefined : (
                      <TabBar
                        label="Results"
                        options={TABS.map((t) =>
                          t.id === "history" && historyChanges > 0
                            ? { ...t, count: historyChanges }
                            : t.id === "news" && (newsCount ?? 0) > 0
                              ? { ...t, count: newsCount ?? 0 }
                              : t.id === "adcvd" && (adcvdFlagged || signedOut)
                                ? { ...t, warn: true }
                                : t,
                        )}
                        value={tab}
                        onChange={changeTab}
                      />
                    )
                  }
                />
              )
            }
          >
            <div className={ui.cardSection}>
              <VerifiedNotice f={f} />
            </div>
            {/* A ban is about this country's goods; the comparison shows several countries */}
            {tab !== "compare" && (
              <div className={ui.cardSection}>
                <ProhibitedNotice prohibitions={result.prohibitions} />
              </div>
            )}
            {tab === "overview" && (
              <OverviewPanel
                o={overview}
                code={selectedElement.htsno}
                country={country.code}
                colors={sliceColors}
                canSee={canSeeWhy}
                onLocked={() => unlockWhy("overview")}
                onOpenTab={changeTab}
              />
            )}


            {tab === "duty" && (
              <>
                <div>
                  <SummaryStats
                    result={result}
                    customsValue={f.customsValue}
                  />
                  <CostBar
                    result={result}
                    colors={sliceColors}
                    highlight={highlight}
                    onHighlight={setHighlight}
                    className={`${ui.cardSection} border-t border-base-300`}
                  />
                  {/* Side by side: the alert on this rate, and whether an AD/CVD case may apply */}
                  <div className={`${ui.cardSection} flex flex-col gap-3 border-t border-base-300 py-3! lg:flex-row [&>*]:min-w-0 [&>*]:flex-1`}>
                    {trackButton}
                    <AdcvdDutyTeaser
                      code={selectedElement.htsno}
                      country={country.code}
                      onOpen={() => changeTab("adcvd", "adcvd_teaser")}
                      onSignUp={() => conversion.openAccount(ADCVD_PITCH, "adcvd-notice", unlockRedirect("adcvd"))}
                    />
                  </div>
                </div>
                {result.warnings.length > 0 && (
                  <div className={ui.cardSection}>
                    <ul
                      className={`${ui.notice("warning")} flex flex-col gap-1.5`}
                    >
                      {result.warnings.map((w) => (
                        <li key={w} className={`${ui.bodySm} flex gap-2`}>
                          <ExclamationTriangleIcon
                            className="mt-px h-4 w-4 shrink-0 text-warning"
                            aria-hidden
                          />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <CardRow className={hasAdjustments ? "lg:grid-cols-2" : ""}>
                  <div className="min-w-0">
                    <DutyBreakdown
                      result={result}
                      customsValue={f.customsValue}
                      unitLabel={f.unitLabel}
                      sliceColors={sliceColors}
                      highlight={highlight}
                      onHighlight={setHighlight}
                      linesDetail={signedOut ? "full" : linesDetail}
                      onLinesDetailChange={
                        signedOut ? undefined : setLinesDetail
                      }
                      footer={
                        <NotAppliedPanel
                          lines={result.lines}
                          bare
                          explain={explainReason}
                          lockedReason={
                            canSeeWhy
                              ? undefined
                              : () => (
                                <WhyLocked
                                  label="See why it doesn't apply, with full legal text"
                                  where="not_applied"
                                />
                              )
                          }
                        />
                      }
                      lockWhy={!canSeeWhy}
                    />
                  </div>
                  {hasAdjustments && (
                    // Beside the duty lines, so an answer's effect shows in them; it moves with the
                    // page while the breakdown is taller
                    <aside id="possible-adjustments" className="min-w-0" aria-label="Possible adjustments">
                      <div ref={adjustmentsRef} className="lg:sticky" style={{ top: adjustmentsTop }}>
                        <QuestionsPanel
                          questions={result.questions}
                          stableQuestions={stableQuestions}
                          notes={questionNotes}
                          qualifyLink={<QualifyLink conversion={conversion} />}
                          hideLegal={!canSeeWhy}
                          action={
                            page === "calculator" ? (
                              <QualifyHeaderLink conversion={conversion} />
                            ) : (
                              <CheckSavingsLink onClick={onCheckSavings ?? (() => conversion.openTrial("qualify", QUALIFY_TRIAL))} />
                            )
                          }
                          answers={f.answers}
                          impacts={f.impacts}
                          customsValue={f.customsValue}
                          lines={[...result.lines, ...(unadjusted?.lines ?? [])]}
                          onAnswer={f.answer}
                          asOf={result.asOf}
                          htsCode={result.htsCode}
                          preference={
                            preferences.length > 0 ? (
                              <PreferenceClaim
                                options={preferences}
                                value={f.preferences[country.code] ?? ""}
                                onChange={(symbol) =>
                                  f.setPreference(country.code, symbol)
                                }
                                impacts={prefImpacts}
                                stable
                                notes={Object.fromEntries(
                                  preferences.map((p) => [
                                    p.symbol,
                                    whatClaimingDoes(p.name),
                                  ]),
                                )}
                                qualifyLink={
                                  <QualifyLink conversion={conversion} />
                                }
                              />
                            ) : undefined
                          }
                        />
                      </div>
                    </aside>
                  )}
                </CardRow>
              </>
            )}

            {tab === "history" && (
              // The history and every change in it, with a free account. On /duty-calculator, alerts
              // on this import in the heading; in Duty Guard, the refund check in the heading
              <AccountGate
                feature="history"
                page={page}
                title={"See what you should have paid on this Import"}
                teaser="Find out what moved it before it moves again."
                cta="Create Free Account"
                note={QUICK_ACCOUNT}
                preview={rateHistory}
                redirect={unlockRedirect("history")}
                framed={false}
                minHeight="min-h-[34rem]"
              >
                {rateHistory}
              </AccountGate>
            )}

            {tab === "adcvd" && (
              <AdcvdTab code={selectedElement.htsno} country={country.code} page={page} customsValue={f.customsValue} dutyUsd={result.totalDuty} redirect={unlockRedirect("adcvd")} />
            )}

            {tab === "news" && (
              <NewsTab
                code={selectedElement.htsno}
                country={country.code}
                page={page}
                action={page === "calculator" && track ? <ArrowLink onClick={() => track.start("overview")}>Get alerts for this import</ArrowLink> : undefined}
                redirect={unlockRedirect("news")}
              />
            )}

            {tab === "compare" &&
              (product ? (
                <AccountGate
                  feature="sourcing"
                  page={page}
                  title="Find the Best Country to Import From"
                  teaser={`See which countries might be better than ${country.name}.`}
                  cta="Create Free Account"
                  note={QUICK_ACCOUNT}
                  preview={comparePanel(product)}
                  redirect={unlockRedirect("compare")}
                  framed={false}
                  minHeight="min-h-[34rem]"
                >
                  {comparePanel(product)}
                </AccountGate>
              ) : (
                <div className={`${ui.skeleton} h-96 w-full`} />
              ))}
            {/* Compare ends with its own way up (to Sourcing) */}
            {/* {tab !== "compare" && trackStrip} */}
          </ResultsBox>
        </WhyUnlockContext.Provider>
      )}
      {conversion.dialog}
      {track?.dialog}
    </div>
  );
};
