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
import { useConversion } from "./ConversionDialog";
import { OverviewPanel } from "../overview/OverviewPanel";
import { insightsPitch } from "../overview/insightsPitch";
import { useOverview } from "../overview/useOverview";
import { ShareButtons, ViewInHtsButton } from "./ShareButtons";
import { useCanSeeWhy, WhyLocked, WhyUnlockContext } from "./WhyGate";
import { ArrowLink } from "./ArrowLink";
import { RefundCheckCard } from "./RefundCheckCard";
import { useTrackImport } from "../landing/TrackImportButton";
import { ResultsSkeleton } from "./ResultsSkeleton";
import { useStickyColumn } from "./useStickyColumn";

// The Tariff Calculator, as on /duty-calculator, the country pages and the Tariff Tracker's
// Calculator tab. The entry details run across the top; the results below have three tabs (an
// import's page in the Tracker adds the Overview first: everything about this tariff at a high
// level, ../overview; on /duty-calculator, "Get Alerts, Insights & News" sells it with the alerts):
// - Duty (where the results open): the totals full width, then the duty breakdown (with the headings checked but not
//   applied at its foot) beside the possible adjustments (and the Tracker's qualification check,
//   teased), which move with the page. What the
//   last answer changed is marked in the breakdown. Then the AD/CVD check: antidumping and
//   countervailing duties are duty too, so they're part of this tab (a line under the totals says
//   whether a case may apply, and takes the user to it)
// - Compare: other origins side by side, then the Analysis: this import's duty from every origin
//   (a free account)
// - Changes: the rate history and every change in it (free; the tab counts the changes), then every
//   tariff action that may touch it (a free account); then the Tracker's refund check, teased

// The tabs, and the names of the ones folded into them (AD/CVD into Duty; History and News into
// Changes), which links and other pages still use
type ResultsView = "overview" | "duty" | "compare" | "changes";
export type ResultsTab = ResultsView | "adcvd" | "history" | "news";

const viewOf = (tab: ResultsTab): ResultsView => (tab === "adcvd" ? "duty" : tab === "history" || tab === "news" ? "changes" : tab);

const LOCAL_VIEWS = ["changes", "history", "adcvd", "news"] as const;

// Scroll to the AD/CVD check on the Duty tab, once it's there (the tab may still be coming in)
export const showAdcvd = () => {
  let tries = 0;
  const go = () => {
    const el = document.getElementById("adcvd-check");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (tries++ < 20) window.setTimeout(go, 100);
  };
  window.setTimeout(go, 60);
};

// The calculator's own tabs. The Overview is an import's page's first tab in the Tracker only:
// here Duty comes first and fast
const TABS: { id: ResultsView; label: string }[] = [
  { id: "duty", label: "Duty" },
  { id: "compare", label: "Compare" },
  { id: "changes", label: "Changes" },
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
  // In the Tracker: where "Check Possible Savings" goes (this import's savings); the Tracker's
  // Savings section when left out
  onCheckSavings?: () => void;
  // A host whose own menu holds the tabs (the Tracker's import page): which one is open (the
  // results then show no tab row of their own), and the way to change it
  tab?: ResultsTab;
  onTabChange?: (tab: ResultsView) => void;
  // In the Tracker: the page's title and line, in the Entry details card (the page's header)
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
    return view ? (viewOf(view) as Exclude<ResultsView, "compare">) : "duty";
  });
  const ownTab: ResultsView = f.view === "compare" ? "compare" : localTab;
  const tab: ResultsView = viewOf(hostTab ?? ownTab);
  useEffect(() => {
    if (searchParams.get("view") === "analysis") f.changeView("compare", true);
    if (searchParams.get("view") === "adcvd") showAdcvd();
    // Once, on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const changeTab = (asked: ResultsTab) => {
    if (asked === "adcvd") showAdcvd();
    const next = viewOf(asked);
    if (onTabChange) return onTabChange(next);
    if (next !== "compare") setLocalTab(next);
    // The address says Compare only while it's open
    f.changeView(next === "compare" ? "compare" : "detailed");
  };

  // Kept here, so they survive switching tabs
  const [highlight, setHighlight] = useState<string | null>(null);
  // The Overview tab's story, worked out while it's open
  // The Overview tab (an import's page in the Tracker); on /duty-calculator, its numbers for
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
  // change; the Tracker works out which ones the goods qualify for (CheckSavingsLink, QualifyLink).
  // The rest of the plain-English why takes a free account (WhyGate)
  const { canSee: canSeeWhy, loading: whyLoading } = useCanSeeWhy();
  // The way up from each tab (PremiumTeasers): its pitches, in one dialog
  const conversion = useConversion(page);
  const signedOut = !whyLoading && !canSeeWhy;
  // How often the duty on this import changed: counted in the Recent Changes tab
  const historyChanges = f.history.filter((x) => x.changes.length > 0).length;
  // What's waiting on the AD/CVD and News tabs. Signed out, AD/CVD isn't looked up (null): the Duty
  // tab only teases that it may apply
  const adcvdFlagged = useAdcvdFlagged(selectedElement?.htsno ?? "", country?.code ?? "");
  const adcvdTease = signedOut;
  const newsCount = useNewsCount(selectedElement?.htsno, country?.code);
  // The calculator's one main way up: track this import (a free account, and the import saved to
  // the Tracker, where it's watched for tariff changes; its savings and past entries are checked
  // there too once savings and audits are back, features.ts)
  const track = useTrackImport(f, "track-import");
  // Alerts, the Overview's insights and the import's news in one: signed out, the free account's
  // pitch, led by this import's most pressing real fact (insightsPitch); signed in, straight to the
  // import's page, on its Overview. A live dot when something is already moving on it
  const urgent = Boolean(overview?.scheduled || adcvdFlagged || (newsCount ?? 0) > 0);
  const trackButton = page === "calculator" && track && (
    <button
      type="button"
      className={`${ui.button({ variant: "primary", size: "sm" })} relative`}
      onClick={() => track.getStarted(insightsPitch)}
    >
      {urgent ? (
        <span className="relative flex h-2 w-2" aria-hidden>
          {/* The button's own text color, so it reads on the fill in light and dark */}
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-content opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-content" />
        </span>
      ) : (
        <BellAlertIcon className="h-4 w-4" aria-hidden />
      )}
      Get Tariff Alerts, Audits, & Savings
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </button>
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
                      {trackButton}
                    </>
                  }
                  tabs={
                    hostTab ? undefined : (
                      <TabBar
                        label="Results"
                        options={TABS.map((t) =>
                          t.id === "changes" && historyChanges + (newsCount ?? 0) > 0
                            ? { ...t, count: historyChanges + (newsCount ?? 0) }
                            : t.id === "duty" && (adcvdFlagged || adcvdTease)
                              ? { ...t, badge: "AD/CVD may apply", badgeTone: adcvdFlagged ? ("warning" as const) : ("neutral" as const) }
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
                  {/* AD/CVD is never in the estimate: one line says whether a case may apply, and
                      takes the user to the check further down this tab */}
                  <AdcvdDutyTeaser
                    code={selectedElement.htsno}
                    country={country.code}
                    onOpen={
                      signedOut
                        ? () =>
                          conversion.openAccount(
                            { title: "See if AD/CVD duties apply to this import, free", highlight: "adcvd", cta: "Create my free account" },
                            "adcvd-teaser",
                          )
                        : showAdcvd
                    }
                  />
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
                {/* AD/CVD: the rest of the duty, its check's own modules (each says what it found). The
                    anchor the line under the totals scrolls to: on the ground, taking no room */}
                {/* Signed out, there's no check here: the line under the totals offers the free account */}
                {!signedOut && (
                  <>
                    <div data-plain id="adcvd-check" className="-mb-module scroll-mt-4">
                      <span className="sr-only">AD/CVD check</span>
                    </div>
                    <AdcvdTab code={selectedElement.htsno} country={country.code} page={page} customsValue={f.customsValue} dutyUsd={result.totalDuty} />
                  </>
                )}
              </>
            )}

            {tab === "changes" && (
              // The history and every change in it are free. On /duty-calculator, alerts on this
              // import in the heading, and the Tracker's refund check (audit checks) as its own card
              // under it; in the Tracker, the refund check in the heading
              <>
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
                <NewsTab
                  code={selectedElement.htsno}
                  country={country.code}
                  page={page}
                  action={page === "calculator" && track ? <ArrowLink onClick={() => track.start("overview")}>Get alerts for this import</ArrowLink> : undefined}
                />
                {page === "calculator" && (
                  <RefundCheckCard
                    history={f.history}
                    customsValue={f.customsValue}
                    onCheck={() =>
                      conversion.openTrial("refunds", {
                        title: "Find out if you overpaid, or underpaid, on past entries",
                        subtitle:
                          "Check every past entry against the duty in force on its date, across your entire product catalog, with the Tariff Tracker.",
                        cta: "Check my entries free",
                      })
                    }
                  />
                )}
              </>
            )}

            {tab === "compare" &&
              (product ? (
                <ComparePanel
                  product={product}
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
