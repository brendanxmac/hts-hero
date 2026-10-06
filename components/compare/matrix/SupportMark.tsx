import {
  CheckCircleIcon,
  LockClosedIcon,
  MinusCircleIcon,
  MinusIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { SUPPORT_LABELS } from "@/libs/compare/features";
import type { FeatureValue, Support } from "@/libs/compare/types";
import * as ui from "@/components/ui/styles";

const MARKS: Record<Support, { Icon: typeof CheckCircleIcon; color: string }> = {
  yes: { Icon: CheckCircleIcon, color: "text-success" },
  paid: { Icon: CheckCircleIcon, color: "text-primary" },
  partial: { Icon: MinusCircleIcon, color: "text-warning" },
  gated: { Icon: LockClosedIcon, color: "text-warning" },
  no: { Icon: XMarkIcon, color: "text-base-content/60" },
  unknown: { Icon: MinusIcon, color: "text-base-content/60" },
};

// One cell of a comparison table: an icon and a word, then the note that qualifies it
export function SupportMark({ value }: { value: FeatureValue }) {
  const { Icon, color } = MARKS[value.support];
  const quiet = value.support === "no" || value.support === "unknown";
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`flex items-center gap-1.5 font-medium ${quiet ? "text-base-content/60" : "text-base-content"}`}>
        <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden />
        {SUPPORT_LABELS[value.support]}
      </span>
      {value.note && <span className={ui.caption}>{value.note}</span>}
    </div>
  );
}
