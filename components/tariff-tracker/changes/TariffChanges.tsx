"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BellAlertIcon, BellSlashIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TabBar } from "@/components/ui/TabBar";
import { useTrackerAccess } from "../access/accessContext";
import { Alerts } from "../alerts/Alerts";
import { useAlertSettings } from "../alerts/AlertSettingsContext";
import { RateHistory } from "../history/RateHistory";
import { TariffImpact } from "../impact/TariffImpact";
import { rememberSection } from "../overview/seenSections";
import { sectionBySlug, TRACKER_PATH } from "../sections";
import { SectionHeader } from "../shell/SectionPage";

// Tariff Changes: everything about tariffs moving, in one place (it was four pages: Tariff News,
// Tariff Impacts, Rate History and Alerts). Three views of it, as pills under the header:
// - Actions: every US tariff action, those that hit the user's imports first, and the open
//   one with what it does to each import (?update=slug: where alert emails land)
// - Rate History: how the rates on the user's imports have moved, and why
// - Alert Settings: where alerts go and which changes send one
// The header says whether alerts are on, and opens their settings.

type View = "actions" | "history" | "alerts";

const VIEWS: { id: View; label: string }[] = [
  { id: "actions", label: "Actions" },
  { id: "history", label: "Rate History" },
  { id: "alerts", label: "Alert Settings" },
];

const viewOf = (v: string | null): View => (v === "history" || v === "alerts" ? v : "actions");

// The sections these views used to be, for the Home's setup steps (seenSections)
const WAS = { actions: "impact", history: "history", alerts: "alerts" } as const;

const AlertsStatus = ({ onOpen }: { onOpen: () => void }) => {
  const { signedIn } = useTrackerAccess();
  const alerts = useAlertSettings();
  if (signedIn && alerts.loading) return null;
  const on = signedIn && alerts.on;
  return (
    <button type="button" className={ui.button({ variant: on ? "secondary" : "primary" })} onClick={onOpen}>
      {on ? <BellAlertIcon className="h-4 w-4 text-success" aria-hidden /> : <BellSlashIcon className="h-4 w-4" aria-hidden />}
      {on ? "Alerts on" : "Turn on alerts"}
    </button>
  );
};

export const TariffChanges = () => {
  const params = useSearchParams();
  const view = viewOf(params.get("view"));
  useEffect(() => rememberSection(WAS[view]), [view]);

  const open = (next: View) => {
    if (next === view) return;
    window.history.pushState(null, "", `${TRACKER_PATH}?tab=changes${next === "actions" ? "" : `&view=${next}`}`);
  };

  return (
    <>
      <SectionHeader
        section={sectionBySlug("changes")!}
        actions={view !== "alerts" && <AlertsStatus onOpen={() => open("alerts")} />}
        tabs={<TabBar label="Tariff Changes" options={VIEWS} value={view} onChange={open} />}
      />
      <div key={view} className="tt-enter flex flex-col gap-group">
        {view === "actions" && <TariffImpact />}
        {view === "history" && <RateHistory />}
        {view === "alerts" && <Alerts />}
      </div>
    </>
  );
};
