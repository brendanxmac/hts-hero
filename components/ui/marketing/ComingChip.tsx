import { SAVINGS_AUDITS_LABEL } from "@/libs/tariff-tracker/features";

// The small amber "Coming Oct 2026" pill on every mention of savings detection and auditing
export const comingChip =
  "inline-flex items-center whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 skin:bg-warning/10 skin:text-warning";

export const ComingChip = ({ className = "" }: { className?: string }) => (
  <span className={`${comingChip} ${className}`.trim()}>{SAVINGS_AUDITS_LABEL}</span>
);
