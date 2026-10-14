"use client";

import { ReactNode } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { formatImportValue, UsImports } from "../../../duty-calculator/lib/usImportsData";
import { formatRate } from "../../formatRate";
import { SavingKind, SUPPLY_NOTES, SUPPLY_REASONS } from "../../insights/savings";
import { formatSaving, Measure } from "../../opportunities/measure";
import { Opportunity } from "../../opportunities/OpportunitiesContext";
import { SavingOption } from "../../opportunities/options";
import { StatusChip } from "../../opportunities/StatusChip";

// A product's ways to save, in three groups: keep the supplier (trade programs), exemptions to
// check, and making it somewhere else. Each says what it could save, how far down it takes the rate
// (a bar on today's scale) and where the user has got to with it. Savings tracked earlier whose
// option is no longer open (the product has it now) are listed after them. Picking one opens it
// beside the list.

const GROUPS: { kind: SavingKind; title: string; note: string }[] = [
  { kind: "program", title: "Keep your supplier", note: "Trade programs this origin can claim" },
  { kind: "exemption", title: "Exemptions to check", note: "Only if the condition is true of your goods. Not counted in totals." },
  {
    kind: "origin",
    title: "Source it somewhere else",
    note: "Longer term: a new supplier, with the goods made there. A big, risky change, so it isn't needed to finish your review. Countries that already make it for the US first (Census).",
  },
];

export type ListItem = { option?: SavingOption; opportunity?: Opportunity; id: string };

// What's under an option's title: its condition and headings, its agreement and how sure it is
// the country can make it, or that it's applied
const subline = (option: SavingOption | undefined, imports: UsImports | null) => {
  if (!option) return "Applied to your catalog";
  if (option.kind === "exemption") {
    return [option.detail, ...(option.headings ?? []).map((h) => (h.name ? `${h.code} · ${h.name}` : h.code))].join(" · ");
  }
  if (option.kind === "program") return "Same supplier";
  const agreement = option.agreement ? `With ${option.agreement}` : "Standard rate";
  if (option.supply && option.supply !== "proven") return `${agreement} · ${SUPPLY_REASONS[option.supply]}`;
  return option.importsValue && imports ? `${agreement} · US imported ${formatImportValue(option.importsValue)} from here in ${imports.year}` : agreement;
};

const Row = ({
  item,
  selected,
  imports,
  customsValue,
  todayPct,
  measure,
  onSelect,
}: {
  item: ListItem;
  selected: boolean;
  imports: UsImports | null;
  customsValue: number;
  todayPct: number;
  measure: Measure;
  onSelect: () => void;
}) => {
  const { option, opportunity } = item;
  const title = option?.title ?? opportunity?.title ?? "";
  const saved = opportunity ? ((opportunity.rateBefore - opportunity.rateAfter) / 100) * customsValue : 0;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`flex w-full flex-col gap-2 rounded-2xl bg-base-100 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          selected ? "border-2 border-primary" : "border border-base-300 hover:bg-tt-soft"
        }`}
      >
        <div className="flex w-full items-start justify-between gap-3">
          <span className="min-w-0 text-sm font-semibold text-base-content">
            {option?.kind === "origin" ? `${option.setup.country.flag} ` : ""}
            {title}
          </span>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-success">
            −{option ? formatSaving(option.usd, customsValue, measure) : opportunity && formatSaving(measure === "pct" ? saved : opportunity.usdPerShipment, customsValue, measure)}
          </span>
        </div>
        <p className="m-0 line-clamp-3 text-xs text-base-content/60">{subline(option, imports)}</p>
        {/* How far down it takes the rate, on today's scale */}
        {option && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-300" aria-hidden>
              {/* Runtime width (DESIGN_SYSTEM §10) */}
              <div className={`h-full rounded-full ${option.counted ? "bg-success" : "bg-warning"}`} style={{ width: `${Math.max(2, (option.ratePct / Math.max(todayPct, 0.01)) * 100)}%` }} />
            </div>
            <span className="text-xs tabular-nums text-base-content/60">to {formatRate(option.ratePct)}</span>
          </div>
        )}
        {(opportunity || (option?.supply && option.supply !== "proven")) && (
          <div className="flex flex-wrap gap-1.5">
            {opportunity && <StatusChip status={opportunity.status} />}
            {option?.supply && option.supply !== "proven" && (
              <span className={tt.chip("warning")} title={SUPPLY_NOTES[option.supply]}>
                Capacity unverified
              </span>
            )}
          </div>
        )}
      </button>
    </li>
  );
};

export const OptionList = ({
  items,
  selectedId,
  imports,
  customsValue,
  todayPct,
  measure,
  onSelect,
  afterQuickWins,
  afterSourcing,
}: {
  // Under the quick wins (trade programs and exemptions), and under the sourcing options: the way
  // to rule each group out
  afterQuickWins?: ReactNode;
  afterSourcing?: ReactNode;
  items: ListItem[];
  selectedId: string | null;
  imports: UsImports | null;
  customsValue: number;
  // Today's rate, the scale each option's bar is drawn on
  todayPct: number;
  measure: Measure;
  onSelect: (id: string) => void;
}) => {
  const past = items.filter((i) => !i.option);
  return (
    <div className="flex flex-col gap-5">
      {GROUPS.map((group) => {
        const rows = items.filter((i) => i.option?.kind === group.kind);
        if (!rows.length) return null;
        const sourcing = group.kind === "origin";
        // The quick wins' heading goes over the first of them, and their footer under the last
        const firstQuick = !sourcing && !GROUPS.some((g) => g.kind !== "origin" && GROUPS.indexOf(g) < GROUPS.indexOf(group) && items.some((i) => i.option?.kind === g.kind));
        const lastQuick = !sourcing && !GROUPS.some((g) => g.kind !== "origin" && GROUPS.indexOf(g) > GROUPS.indexOf(group) && items.some((i) => i.option?.kind === g.kind));
        return (
          <section
            key={group.kind}
            className={`flex flex-col gap-2 ${sourcing && items.some((i) => i.option && i.option.kind !== "origin") ? "border-t border-dashed border-base-300 pt-5" : ""}`}
            aria-label={group.title}
          >
            {firstQuick && (
              <div className="mb-1 rounded-2xl bg-tt-soft px-4 py-3">
                <p className="m-0 text-sm font-semibold text-base-content">Quick wins</p>
                <p className="m-0 mt-0.5 text-xs text-base-content/70">
                  No change of supplier. Secure or rule out each of these to finish this import&apos;s review.
                </p>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className={tt.eyebrow(group.kind === "exemption" ? "warning" : sourcing ? "primary" : "success")}>{group.title}</h3>
                {sourcing && <span className={tt.chip("neutral")}>Longer term</span>}
              </div>
              <p className="m-0 mt-0.5 text-xs text-base-content/60">{group.note}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {rows.map((item) => (
                <Row key={item.id} item={item} selected={item.id === selectedId} imports={imports} customsValue={customsValue} todayPct={todayPct} measure={measure} onSelect={() => onSelect(item.id)} />
              ))}
            </ul>
            {lastQuick && afterQuickWins}
            {sourcing && afterSourcing}
          </section>
        );
      })}
      {past.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Tracked earlier">
          <h3 className={tt.eyebrow()}>Tracked earlier</h3>
          <ul className="flex flex-col gap-2">
            {past.map((item) => (
              <Row key={item.id} item={item} selected={item.id === selectedId} imports={imports} customsValue={customsValue} todayPct={todayPct} measure={measure} onSelect={() => onSelect(item.id)} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
