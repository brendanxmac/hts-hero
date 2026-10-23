"use client";

import { ReactNode } from "react";
import { BellAlertIcon, ClipboardDocumentCheckIcon, ReceiptPercentIcon } from "@heroicons/react/20/solid";
import { CardRow, CardSections } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { ProductTab } from "../sections";
import { useTracker } from "../TrackerContext";
import { useTrackerNav } from "../shell/TrackerNav";

// The top of an import's Overview (DESIGN_SYSTEM.md §15): what the Tracker does for this import,
// its alerts, savings and audits, side by side in one module. Each says where it stands (a chip),
// what it means in one line, and has one button that moves it on (alerts turn on and off in the import's header, on every tab).
// Savings and Audits have no chip: their buttons open the tab.

const Pillar = ({ icon, title, status, body, action }: { icon: ReactNode; title: string; status?: ReactNode; body: string; action: ReactNode }) => (
  <section className={`${ui.cardSection} flex flex-col gap-2 py-5!`} aria-label={title}>
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <span className="text-base-content/60" aria-hidden>
          {icon}
        </span>
        <h4 className={tt.sectionTitle}>{title}</h4>
      </span>
      {status}
    </div>
    <p className={`${tt.body} m-0 flex-1`}>{body}</p>
    <div className="pt-1">{action}</div>
  </section>
);

export const ImportPromises = ({ productKey, onOpenTab }: { productKey: string; onOpenTab: (tab: ProductTab) => void }) => {
  const { trackedKeys } = useTracker();
  const nav = useTrackerNav();
  const alertsOn = trackedKeys.has(productKey);
  return (
    <CardSections>
      <div className={`${ui.cardSection} pb-0! pt-5!`}>
        <h3 className={`${tt.moduleTitle} m-0`}>Alerts, Savings and Audits</h3>
        <p className={`${tt.subtitle} m-0 mt-0.5`}>What the Tracker does for this import</p>
      </div>
      <CardRow className="border-t-0! lg:grid-cols-3">
        <Pillar
          icon={<BellAlertIcon className="h-4 w-4" />}
          title="Alerts"
          status={<span className={tt.chip(alertsOn ? "success" : "warning")}>{alertsOn ? "On" : "Off"}</span>}
          body={
            alertsOn
              ? "You'll hear the day a tariff change hits this import, with its rate before and after."
              : "Turn them on at the top to hear the day a tariff change hits this import, with its rate before and after."
          }
          action={
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => nav.openTab("alerts")}>
              Alert settings
            </button>
          }
        />
        <Pillar
          icon={<ReceiptPercentIcon className="h-4 w-4" />}
          title="Savings"
          body="Trade programs, exemptions and cheaper countries that could lower the duty on it, checked for you."
          action={
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => onOpenTab("savings")}>
              See savings
            </button>
          }
        />
        <Pillar
          icon={<ClipboardDocumentCheckIcon className="h-4 w-4" />}
          title="Audits"
          body="The duty on each of its past entries, checked against the rates in force on the entry date."
          action={
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => onOpenTab("audit")}>
              Audit entries
            </button>
          }
        />
      </CardRow>
    </CardSections>
  );
};
