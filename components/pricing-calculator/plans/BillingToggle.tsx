"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ANNUAL_DISCOUNT, Billing } from "../lib/pricing";

const OPTIONS = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: `Annual · save ${ANNUAL_DISCOUNT * 100}%` },
] as const;

export const BillingToggle = ({
  billing,
  onChange,
  size = "md",
}: {
  billing: Billing;
  onChange: (billing: Billing) => void;
  size?: "sm" | "md";
}) => <SegmentedControl label="Billing period" options={OPTIONS} value={billing} onChange={onChange} size={size} />;
