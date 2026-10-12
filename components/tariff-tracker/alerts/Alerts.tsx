"use client";

import * as tt from "@/components/ui/styles/tracker";
import { TableStandIn } from "@/components/ui/stand-ins";
import { AccountGate } from "../access/AccountGate";
import { AlertSettingsPanel } from "./AlertSettingsPanel";

// The Alerts section: where alerts go, and what sets one off. Alerts come with every account
// (PRICING.md: the free plan includes monitoring and alerts for its tracked products).
const TRIGGERS = [
  { title: "A new HTS revision", body: "When a revision changes the rate on one of your products", tone: "primary" as const },
  { title: "An announced tariff", body: "Proclamations, executive orders and Federal Register notices, before they reach the HTS", tone: "warning" as const },
  { title: "Customs guidance", body: "CSMS messages that change how a tariff applies to your products", tone: "success" as const },
];

export const Alerts = () => (
  <AccountGate
    feature="alerts"
    page="tracker_alerts"
    title="Get alerts when tariffs change on your products"
    teaser="Alerts come free with your account, for every product you track."
    preview={<TableStandIn columns={["Alert", "Products", "Change", "Date"]} />}
  >
    <div className="flex flex-col gap-4">
      <AlertSettingsPanel />
      <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-alert-triggers">
        <h2 id="tt-alert-triggers" className={tt.title}>
          What sets off an alert
        </h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {TRIGGERS.map((t) => (
            <div key={t.title} className={`${tt.tile} flex flex-col gap-1.5 p-4`}>
              <span className={tt.eyebrow(t.tone)}>{t.title}</span>
              <span className="text-sm text-base-content/70">{t.body}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  </AccountGate>
);
