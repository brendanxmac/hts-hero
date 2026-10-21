"use client";

import { CheckIcon, SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useTrackerAccess } from "../access/accessContext";
import { PremiumFeature } from "../access/features";
import { useInsights } from "../insights/InsightsContext";
import { changesTeaser, sourcingTeaser } from "../insights/teasers";
import { TrackerSection } from "../sections";
import { useTrackerNav } from "./TrackerNav";
import { ComingSoon } from "./ComingSoon";

// A section that isn't built yet: what it will do. A paid-only one leads with what it would have
// told the user about their own catalog, and the way to get it.
export const PlannedSection = ({ section, productKey }: { section: TrackerSection; productKey?: string }) => {
  // Savings and Audits before launch: the full pitch (ComingSoon)
  if (section.comingSoon && (section.slug === "savings" || section.slug === "entries"))
    return <ComingSoon kind={section.slug === "savings" ? "savings" : "audits"} productKey={productKey} />;
  return <Planned section={section} />;
};

const Planned = ({ section }: { section: TrackerSection }) => {
  const { openTab } = useTrackerNav();
  const insights = useInsights();
  const { paid, signedIn, unlock, unlockLabel, loading } = useTrackerAccess();
  const { Icon } = section;
  const headingId = `tt-planned-${section.slug}`;
  const teaser =
    section.slug === "alerts"
      ? changesTeaser(insights)
      : section.slug === "sourcing"
        ? sourcingTeaser(insights)
        : null;

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {section.paidOnly && !loading && (teaser || !paid) && (
        <div className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
          <SparklesIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p className={`${ui.bodySm} flex-1`}>
            {teaser && <span className="font-semibold text-base-content">{teaser} </span>}
            {paid
              ? `${section.label} is included in your plan and switches on as soon as it launches.`
              : `${section.label} comes with every paid plan, and switches on for you the day it launches.`}
          </p>
          {!paid && (
            <button
              type="button"
              className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`}
              onClick={() => unlock(section.slug as PremiumFeature)}
            >
              {unlockLabel}
            </button>
          )}
        </div>
      )}
      {/* Coming soon, signed out: an account now means it's on for their imports the day it opens */}
      {section.comingSoon && !section.paidOnly && !loading && !signedIn && (
        <div className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
          <SparklesIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p className={`${ui.bodySm} flex-1`}>
            <span className="font-semibold text-base-content">{section.label} switches on for every account the day it launches. </span>
            Create a free account now and it runs on your imports from day one.
          </p>
          <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`} onClick={() => unlock("tracking")}>
            {unlockLabel}
          </button>
        </div>
      )}
      <section className={ui.card} aria-labelledby={headingId}>
        <div className={ui.cardHeader}>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden>
              <Icon className="h-5 w-5" />
            </span>
            <h2 id={headingId} className={ui.cardTitle}>
              What&apos;s Coming
            </h2>
          </div>
          <span className={ui.badge("primary")}>{section.comingSoon ? "Coming soon" : "In development"}</span>
        </div>
        <ul className="flex flex-col gap-3 px-5 py-4">
          {section.planned.map((item) => (
            <li key={item} className={`${ui.bodySm} flex gap-2.5`}>
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <div className={`${ui.cardFooter} ${ui.bodySm}`}>
          It will work from your{" "}
          <button type="button" className={ui.link} onClick={() => openTab("catalog")}>
            imports
          </button>
          , so the products you add there now carry over.
        </div>
      </section>
    </div>
  );
};
