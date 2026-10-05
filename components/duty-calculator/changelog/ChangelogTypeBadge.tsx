import { ChangelogType, ChangelogTypeLabels } from "@/libs/supabase/tariff-changelog";
import * as ui from "@/components/ui/styles";

const typeTones: Record<ChangelogType, Parameters<typeof ui.badge>[0]> = {
  revision: "primary",
  fix: "neutral",
  improvement: "success",
};

export const ChangelogTypeBadge = ({ type }: { type: ChangelogType }) => (
  <span className={ui.badge(typeTones[type])}>{ChangelogTypeLabels[type]}</span>
);
