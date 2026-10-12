import { ChangelogType, ChangelogTypeLabels } from "@/libs/supabase/tariff-changelog";

const typeTones: Record<ChangelogType, string> = {
  revision: "bg-teal-50 text-teal-800 ring-teal-200",
  fix: "bg-slate-100 text-slate-700 ring-slate-200",
  improvement: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

// On a dark surface
const darkTypeTones: Record<ChangelogType, string> = {
  revision: "bg-teal-400/10 text-teal-200 ring-teal-400/30",
  fix: "bg-white/5 text-slate-300 ring-white/15",
  improvement: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30",
};

export const ChangelogTypeBadge = ({ type, dark = false }: { type: ChangelogType; dark?: boolean }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${(dark ? darkTypeTones : typeTones)[type]}`}
  >
    {ChangelogTypeLabels[type]}
  </span>
);
