"use client";

import { AdjustmentsHorizontalIcon, BellAlertIcon, BellSlashIcon, CheckCircleIcon, LockClosedIcon, SparklesIcon } from "@heroicons/react/20/solid";
import type { TableColumnDef } from "@/components/ui/table/features";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { selectColumn } from "@/components/ui/table";
import { HtsSection } from "../../../interfaces/hts";
import { adjustmentTags } from "../adjustments";
import { formatRate } from "../formatRate";
import { REVIEW_LABELS, ReviewState } from "../opportunities/review";
import { BASE_PART, shortProgram, TrackedProduct } from "../report";
import { productUrl } from "../sections";
import { countryFacet, openColumn } from "../tableColumns";
import { SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";
import { AdcvdChipFor } from "@/components/adcvd/AdcvdChip";
import type { AdcvdMark } from "@/components/adcvd/useCatalogAdcvd";

// The columns of the user's imports (ImportsTable): what each shows, how it sorts, and the ones
// people filter by (origin, HTS chapter, tariff, savings, alerts), each with its values' labels

export interface ImportColumnContext {
  signedIn: boolean;
  // Chapter names, for the chapter filter
  sections: HtsSection[];
  // Tariff colors (partColors), and the highest rate on the list, the scale every bar is drawn on
  colors: Record<string, string>;
  maxPct: number;
  covered: (key: string) => boolean;
  picked: (key: string) => boolean;
  setCovered: (key: string, on: boolean) => void;
  review: (key: string) => ReviewState;
  unlocked: (key: string) => boolean;
  // An AD/CVD case may cover it (useCatalogAdcvd)
  adcvd: (key: string) => AdcvdMark | null;
}

export const chapterOf = (product: TrackedProduct) => String(Number(product.entry.element.chapter)).padStart(2, "0");

// The tariffs on an import, by name (base duty aside): what the Tariff filter picks from
const programsOf = (product: TrackedProduct) => product.parts.filter((p) => p.key !== BASE_PART).map((p) => shortProgram(p.key));

const REVIEW_ORDER: ReviewState[] = ["unchecked", "to_review", "in_progress", "reviewed"];

// The badges under an import's rate: alerts off, and where its savings stand
const Status = ({ row, ctx }: { row: TrackedProduct; ctx: ImportColumnContext }) => {
  const review = ctx.review(row.key);
  const locked = ctx.signedIn && !ctx.unlocked(row.key);
  const lower = row.bestSavingPct > 0.005;
  // Savings are off for the Tracker MVP (libs/tariff-tracker/features.ts): alerts only
  // (whether it's tracked shows in the Tracking column)
  if (!SAVINGS_ENABLED) return null;
  return (
    <span className="flex flex-wrap items-center justify-end gap-1">
      {ctx.signedIn && !ctx.covered(row.key) && <span className={tt.chip()}>No alerts</span>}
      {review === "reviewed" ? (
        <span className={`${tt.chip("success")} gap-1`} title="Every quick win on this import is secured or ruled out">
          <CheckCircleIcon className="h-3 w-3" aria-hidden />
          Savings reviewed
        </span>
      ) : locked && lower ? (
        <span className={`${tt.chip("success")} gap-1`} title="Check this import's savings to see how it could be lower">
          <LockClosedIcon className="h-3 w-3" aria-hidden />
          Savings found
        </span>
      ) : lower ? (
        <span className={`${tt.chip("success")} gap-1`}>
          <SparklesIcon className="h-3 w-3" aria-hidden />
          Could be lower
        </span>
      ) : null}
    </span>
  );
};

export const importColumns = (ctx: ImportColumnContext): TableColumnDef<TrackedProduct, any>[] => [
  ...(ctx.signedIn ? [selectColumn<TrackedProduct>((r) => `${r.entry.element.htsno} from ${r.entry.country.name}`)] : []),
  {
    id: "product",
    accessorFn: (r) => r.entry.element.htsno,
    header: "Product",
    meta: { rowHeader: true, width: "w-[34%]" },
    cell: ({ row: { original: r } }) => {
      const tags = adjustmentTags(r.adjustments, r.result);
      return (
        <span className="flex min-w-0 flex-col gap-0.5 text-left">
          {/* A real link: a modified click opens the import in a new tab */}
          <a href={productUrl(r.key)} className={`${mono.className} self-start text-sm font-semibold text-base-content hover:text-primary hover:underline`}>
            {r.entry.element.htsno}
          </a>
          <span className="line-clamp-2 text-xs leading-snug text-base-content/60" title={r.description}>
            {r.description}
          </span>
          {ctx.adcvd(r.key) && (
            <span className="mt-1 flex">
              <AdcvdChipFor level={ctx.adcvd(r.key)!.level} applies={ctx.adcvd(r.key)!.applies} />
            </span>
          )}
          {tags.length > 0 && (
            <span className="mt-1 flex flex-wrap items-center gap-1" aria-label="Adjustments">
              <AdjustmentsHorizontalIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
              {tags.map((t) => (
                <span key={t.id} className={`${tt.chip("primary")} max-w-48 truncate font-semibold`} title={t.title}>
                  {t.label}
                </span>
              ))}
            </span>
          )}
        </span>
      );
    },
  },
  {
    id: "country",
    accessorFn: (r) => r.entry.country.code,
    header: "Origin",
    sortFn: (a, b) => a.original.entry.country.name.localeCompare(b.original.entry.country.name),
    filterFn: "facet",
    meta: {
      width: "w-[16%]",
      facet: countryFacet(),
    },
    cell: ({ row: { original: r } }) => (
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-lg leading-none" aria-hidden>
          {r.entry.country.flag}
        </span>
        <span className="truncate">{r.entry.country.name}</span>
      </span>
    ),
  },
  {
    id: "chapter",
    accessorFn: chapterOf,
    header: "HTS chapter",
    enableSorting: false,
    filterFn: "facet",
    meta: {
      facet: {
        label: "HTS chapter",
        describe: (value) => ({
          label: `Chapter ${value}`,
          detail: ctx.sections.flatMap((s) => s.chapters).find((c) => c.number === Number(value))?.description,
        }),
        compare: (a, b) => a.value.localeCompare(b.value),
      },
    },
  },
  {
    id: "tariffs",
    accessorFn: programsOf,
    // Each tariff counts on its own in the filter, not the list as one value
    getUniqueValues: programsOf,
    header: "Tariffs",
    enableSorting: false,
    filterFn: "facet",
    meta: { width: "w-[30%]", facet: { label: "Tariff" } },
    cell: ({ row: { original: r } }) => (
      <span className="flex min-w-0 flex-col gap-2">
        <StackedBar
          parts={r.parts.map((p) => ({ label: p.key, amount: p.pct, color: ctx.colors[p.key] }))}
          formatValue={formatRate}
          size="xs"
          shape="pill"
          fill={ctx.maxPct > 0 ? Math.max(r.totalPct / ctx.maxPct, r.totalPct > 0 ? 0.02 : 0) : 0}
          legend={false}
        />
        <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/70">
          {r.parts.length === 0 ? (
            <span className="text-base-content/60">Duty free</span>
          ) : (
            r.parts.map((p) => (
              <span key={p.key} className="inline-flex items-center gap-1.5 whitespace-nowrap" title={p.key}>
                {/* Tariff color (DESIGN_SYSTEM §10) */}
                <span className="h-2 w-2 rounded-xs" style={{ background: ctx.colors[p.key] }} aria-hidden />
                {p.key === BASE_PART ? "Base" : shortProgram(p.key)}
                <span className="font-semibold tabular-nums text-base-content">{formatRate(p.pct)}</span>
              </span>
            ))
          )}
        </span>
      </span>
    ),
  },
  {
    id: "rate",
    accessorFn: (r) => r.totalPct,
    header: "Duty rate",
    sortDescFirst: true,
    meta: { align: "right", width: "w-36" },
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-col items-end gap-1">
        <span className={`${tt.display} text-xl font-semibold leading-none tabular-nums text-base-content`}>{formatRate(r.totalPct)}</span>
        <Status row={r} ctx={ctx} />
      </span>
    ),
  },
  ...(ctx.signedIn && SAVINGS_ENABLED
    ? [
        {
          id: "savings",
          accessorFn: (r: TrackedProduct) => ctx.review(r.key),
          header: "Savings",
          enableSorting: false,
          filterFn: "facet",
          meta: {
            facet: {
              label: "Savings",
              describe: (value: string) => ({ label: REVIEW_LABELS[value as ReviewState]?.label ?? value }),
              compare: (a: { value: string }, b: { value: string }) =>
                REVIEW_ORDER.indexOf(a.value as ReviewState) - REVIEW_ORDER.indexOf(b.value as ReviewState),
            },
          },
        } satisfies TableColumnDef<TrackedProduct, any>,
      ]
    : []),
  // Imports with alerts on are the tracked ones: alerts and impact checks (the plan's slots,
  // PRICING.md). One toggle per row: a green "Alerts On" pill, or a red "Alerts Off" one
  ...(ctx.signedIn
    ? [
        {
          id: "alerts",
          accessorFn: (r: TrackedProduct) => (ctx.covered(r.key) ? "on" : "off"),
          header: "Alerts",
          filterFn: "facet",
          meta: {
            align: "center",
            width: "w-36",
            facet: { label: "Alerts", describe: (value: string) => ({ label: value === "on" ? "Alerts On" : "Alerts Off" }) },
          },
          cell: ({ row: { original: r } }: { row: { original: TrackedProduct } }) => {
            const on = ctx.covered(r.key);
            const mine = ctx.picked(r.key);
            return (
              <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={(e) => {
                  e.stopPropagation();
                  ctx.setCovered(r.key, !on);
                }}
                title={
                  on
                    ? mine
                      ? "Alerts on (your pick): you get alerts and impact checks on it. Click to turn them off and free the slot."
                      : "Alerts on (picked for you: high duty): you get alerts and impact checks on it. Click to turn them off."
                    : "Alerts off: no alerts or impact checks. Click to turn them on."
                }
                aria-label={`Alerts on ${r.entry.element.htsno} from ${r.entry.country.name}`}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  on
                    ? "bg-success/10 text-success hover:bg-success/15"
                    : "bg-error/10 text-error hover:bg-error/15"
                }`}
              >
                {on ? <BellAlertIcon className="h-3.5 w-3.5" aria-hidden /> : <BellSlashIcon className="h-3.5 w-3.5" aria-hidden />}
                {on ? "Alerts On" : "Alerts Off"}
              </button>
            );
          },
        } satisfies TableColumnDef<TrackedProduct, any>,
      ]
    : []),
  openColumn<TrackedProduct>(),
];
