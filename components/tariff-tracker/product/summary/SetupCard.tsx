"use client";

import { ReactNode } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { Switch } from "@/components/ui/Switch";
import * as tt from "@/components/ui/styles/tracker";
import { formatMoney, TRANSPORT_MODES } from "../../../duty-calculator/lib/format";
import { useTrackerAccess } from "../../access/accessContext";
import { DEFAULT_MODE } from "../../adjustments";
import { TrackedProduct } from "../../report";
import { useTracker } from "../../TrackerContext";
import { ShipmentsPerYearField } from "../savings/ShipmentsPerYearField";
import { SummaryCard } from "./SummaryCard";

// How the product is set up: the shipment its duty is worked out for, its trade program and
// conditions, how often it ships, and whether it gets alerts (with the switch); and the way to
// reset what's been set on it

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-3 border-t border-base-300 py-2 text-sm first:border-t-0">
    <span className="text-base-content/70">{label}</span>
    <span className="min-w-0 truncate text-right font-medium text-base-content">{children}</span>
  </div>
);

export const SetupCard = ({
  product,
  onEdit,
  onReset,
  adjusted,
}: {
  product: TrackedProduct;
  onEdit: () => void;
  onReset: () => void;
  // Anything set on it to reset
  adjusted: boolean;
}) => {
  const { trackedKeys, setCovered } = useTracker();
  const { signedIn, openUpgrade } = useTrackerAccess();
  const a = product.adjustments;
  const mode = TRANSPORT_MODES.find((m) => m.id === (a.transportMode ?? DEFAULT_MODE))?.label;
  const program = a.claimedPreference
    ? (product.result.availablePreferences.find((p) => p.symbol === a.claimedPreference)?.name ?? a.claimedPreference)
    : "None claimed";
  const answered = Object.keys(a.answers ?? {}).length;
  const alerts = trackedKeys.has(product.key);

  return (
    <SummaryCard title="Setup" link={{ label: "Edit", onClick: onEdit }}>
      <div className="flex flex-col">
        <Row label="Entered value">
          {formatMoney(product.customsValue).replace(/\.00$/, "")}
          {a.customsValue === undefined && <span className="ml-1 font-normal text-base-content/50">(estimate)</span>}
        </Row>
        {product.result.requiresQuantity && <Row label="Quantity">{product.quantity.toLocaleString("en-US")}</Row>}
        <Row label="Mode of transport">{mode}</Row>
        <Row label="Trade program">{program}</Row>
        <Row label="Conditions answered">{answered ? answered : "None"}</Row>
        <Row label="Shipments a year">
          <ShipmentsPerYearField productKey={product.key} />
        </Row>
        {signedIn && (
          <Row label="Tariff alerts">
            <Switch
              checked={alerts}
              onChange={(on) => {
                if (!setCovered(product.key, on)) openUpgrade("tracking");
              }}
              label="Tariff alerts on this import"
            />
          </Row>
        )}
      </div>
      {adjusted && (
        <div className="border-t border-base-300 pt-3">
          <button type="button" className={tt.button("ghost", "sm")} onClick={onReset}>
            <ArrowPathIcon className="h-4 w-4" aria-hidden />
            Reset adjustments
          </button>
        </div>
      )}
    </SummaryCard>
  );
};
