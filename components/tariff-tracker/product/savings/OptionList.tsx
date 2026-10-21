"use client";

import { ComponentType, ReactNode, SVGProps } from "react";
import { CheckCircleIcon, DocumentMagnifyingGlassIcon, ReceiptPercentIcon, XCircleIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { formatImportValue, UsImports } from "../../../duty-calculator/lib/usImportsData";
import { SavingKind, SUPPLY_NOTES } from "../../insights/savings";
import { formatSaving, Measure } from "../../opportunities/measure";
import { Opportunity } from "../../opportunities/OpportunitiesContext";
import { SavingOption } from "../../opportunities/options";
import { statusInfo, StatusTone } from "../../opportunities/statuses";

// The rail of a product's Savings box: every way to save, one compact row each, in two tracks.
// Quick wins (trade programs, then exemptions: no change of supplier, and the ones that finish the
// import's review) and, apart, sourcing it somewhere else (longer term). Each row has an icon for its
// kind (a flag for an origin), its name and one line on it, what it could save, and where it stands.
// Savings tracked earlier whose option is no longer open (the product has it now) come last. Picking
// one opens it beside the rail.

export type ListItem = { option?: SavingOption; opportunity?: Opportunity; id: string };

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const KIND: Record<SavingKind, { label: string; icon: Icon; tint: string }> = {
  program: { label: "Trade programs", icon: ReceiptPercentIcon, tint: "bg-success/10 text-success" },
  exemption: { label: "Exemptions to check", icon: DocumentMagnifyingGlassIcon, tint: "bg-warning/10 text-warning" },
  origin: { label: "Other countries", icon: ReceiptPercentIcon, tint: "bg-primary/10 text-primary" },
};

const DOTS: Record<StatusTone, string> = {
  neutral: "bg-base-content/30",
  primary: "bg-primary",
  warning: "bg-warning",
  success: "bg-success",
  error: "bg-error",
};

// An exemption's name in the rail: what its first heading covers ("Donations", from "Section 301
// Brazil Exemption: Donations"), or its title
export const exemptionName = (option: SavingOption) => {
  const name = option.headings?.find((h) => h.name)?.name ?? "";
  return name.split(": ").slice(1).join(": ") || name || option.title;
};

// One line under the name: the condition, the supplier, or the agreement and US imports from there
const subline = (option: SavingOption | undefined, imports: UsImports | null) => {
  if (!option) return "Applied to your imports";
  if (option.kind === "exemption") return (option.headings ?? []).map((h) => h.code).join(", ") || option.detail;
  if (option.kind === "program") return "Same supplier, same country";
  const agreement = option.agreement ? `With ${option.agreement}` : "Standard rate";
  return option.importsValue && imports ? `${agreement} · US imported ${formatImportValue(option.importsValue)} in ${imports.year}` : agreement;
};

const Row = ({
  item,
  selected,
  imports,
  customsValue,
  measure,
  onSelect,
}: {
  item: ListItem;
  selected: boolean;
  imports: UsImports | null;
  customsValue: number;
  measure: Measure;
  onSelect: () => void;
}) => {
  const { option, opportunity } = item;
  const kind = option?.kind ?? opportunity?.kind ?? "program";
  const title = option?.title ?? opportunity?.title ?? "";
  const usd = option ? option.usd : opportunity ? (measure === "pct" ? ((opportunity.rateBefore - opportunity.rateAfter) / 100) * customsValue : opportunity.usdPerShipment) : 0;
  const status = opportunity && opportunity.status !== "found" ? statusInfo(opportunity.status) : undefined;
  const closed = opportunity?.status === "not_eligible";
  const Icon = KIND[kind].icon;
  const unverified = option?.supply && option.supply !== "proven";

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        title={title}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${
          selected ? "bg-primary/[0.06] shadow-[inset_0_0_0_1.5px_var(--color-primary)]" : "hover:bg-tt-soft"
        }`}
      >
        {/* Its kind, or the country's flag */}
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${option?.kind === "origin" ? "bg-tt-soft text-lg" : KIND[kind].tint} ${closed ? "opacity-50" : ""}`} aria-hidden>
          {option?.kind === "origin" ? option.setup.country.flag : <Icon className="h-[18px] w-[18px]" />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={`truncate text-sm font-semibold ${closed ? "text-base-content/60 line-through decoration-base-content/30" : "text-base-content"}`}>
            {option?.kind === "origin" ? option.setup.country.name : option?.kind === "exemption" ? exemptionName(option) : title}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-base-content/60">
            {unverified && (
              <span className="shrink-0 font-semibold text-warning" title={SUPPLY_NOTES[option!.supply!]}>
                Unverified ·
              </span>
            )}
            <span className="truncate">{subline(option, imports)}</span>
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <span className={`text-sm font-semibold tabular-nums ${closed ? "text-base-content/50" : "text-success"}`}>−{formatSaving(usd, customsValue, measure)}</span>
          {status ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-base-content/70">
              {opportunity!.status === "secured" ? (
                <CheckCircleIcon className="h-3 w-3 text-success" aria-hidden />
              ) : closed ? (
                <XCircleIcon className="h-3 w-3 text-error" aria-hidden />
              ) : (
                <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status.tone]}`} aria-hidden />
              )}
              {status.label}
            </span>
          ) : (
            option && <span className="text-[11px] font-semibold text-primary">To review</span>
          )}
        </span>
      </button>
    </li>
  );
};

// A track's heading: what it is, and how many of its options are decided
const TrackHeading = ({ title, note, rows, badge }: { title: string; note: string; rows: ListItem[]; badge?: ReactNode }) => {
  const decided = rows.filter((r) => r.opportunity && r.opportunity.status !== "found").length;
  return (
    <div className="flex flex-col gap-0.5 px-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <h3 className={tt.sectionTitle}>{title}</h3>
          {badge}
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-base-content/60">
          {decided}/{rows.length} decided
        </span>
      </div>
      <p className="m-0 text-xs text-base-content/60">{note}</p>
    </div>
  );
};

export const OptionList = ({
  items,
  selectedId,
  imports,
  customsValue,
  measure,
  onSelect,
  afterQuickWins,
  afterSourcing,
}: {
  // Under the quick wins, and under the sourcing options: the way to rule each track out
  afterQuickWins?: ReactNode;
  afterSourcing?: ReactNode;
  items: ListItem[];
  selectedId: string | null;
  imports: UsImports | null;
  customsValue: number;
  measure: Measure;
  onSelect: (id: string) => void;
}) => {
  const of = (kind: SavingKind) => items.filter((i) => i.option?.kind === kind);
  const quick = [...of("program"), ...of("exemption")];
  const sourcing = of("origin");
  const past = items.filter((i) => !i.option);
  const rows = (list: ListItem[]) => (
    <ul className="flex flex-col gap-1">
      {list.map((item) => (
        <Row key={item.id} item={item} selected={item.id === selectedId} imports={imports} customsValue={customsValue} measure={measure} onSelect={() => onSelect(item.id)} />
      ))}
    </ul>
  );
  // Within the quick wins, a quiet label over each kind when there are both
  const sub = (kind: SavingKind) =>
    of(kind).length > 0 && (
      <div className="flex flex-col gap-1">
        {of("program").length > 0 && of("exemption").length > 0 && <span className="px-3 pt-1 text-[11px] font-semibold text-base-content/60">{KIND[kind].label}</span>}
        {rows(of(kind))}
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {quick.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Quick Wins">
          <TrackHeading title="Quick Wins" note="No change of supplier. Decide each one to finish this import's review." rows={quick} />
          {sub("program")}
          {sub("exemption")}
          <div className="px-1">{afterQuickWins}</div>
        </section>
      )}
      {sourcing.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Source it somewhere else">
          <TrackHeading
            title="Source It Elsewhere"
            badge={<span className={tt.chip("neutral")}>Longer term</span>}
            note="A new supplier, with the goods made there. Countries that already make it for the US first (Census)."
            rows={sourcing}
          />
          {rows(sourcing)}
          <div className="px-1">{afterSourcing}</div>
        </section>
      )}
      {past.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Tracked Earlier">
          <div className="px-3">
            <h3 className={tt.sectionTitle}>Tracked Earlier</h3>
          </div>
          {rows(past)}
        </section>
      )}
    </div>
  );
};
