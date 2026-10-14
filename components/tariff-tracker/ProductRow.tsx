"use client";

import { AdjustmentsHorizontalIcon, CheckCircleIcon, ChevronRightIcon, LockClosedIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { adjustmentTags } from "./adjustments";
import { formatRate } from "./formatRate";
import { BASE_PART, shortProgram, TrackedProduct } from "./report";
import { productUrl } from "./sections";

// Product, origin, tariffs, duty rate and the chevron. Shared with ProductList's headings.
export const ROW_GRID =
  "md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,1.7fr)_6rem_1.75rem] md:gap-5 md:items-center";

// One product on the report: its rate and the tariffs that make it up. A link to the product's
// own view: a plain click opens it in place, a modified click in a new browser tab.
export const ProductRow = ({
  row,
  colors,
  maxPct,
  untracked = false,
  savingsLocked = false,
  savingsReviewed = false,
  coverage,
  onOpen,
}: {
  row: TrackedProduct;
  colors: Record<string, string>;
  maxPct: number;
  // No alerts on it (past the trial's or the plan's limit): duty, history and sourcing still shown
  untracked?: boolean;
  // Its savings aren't checked (or covered by a plan) yet
  savingsLocked?: boolean;
  // Its quick wins are all secured or ruled out (opportunities/review.ts)
  savingsReviewed?: boolean;
  // Alert coverage, signed in: whether this product gets alerts (picked by the user, or filling a
  // spare slot), and the way to pick it or take it out
  coverage?: { covered: boolean; picked: boolean; onChange: (covered: boolean) => void };
  onOpen: () => void;
}) => {
  const { entry } = row;
  const tags = adjustmentTags(row.adjustments, row.result);
  // Scaled to the highest rate on the list, with a sliver for any rate above zero
  const barWidth = Math.max((row.totalPct / maxPct) * 100, row.totalPct > 0 ? 2 : 0);

  return (
    <li className="flex items-stretch">
      {coverage && (
        // Outside the row's link: a control can't sit inside one
        <label
          className="flex w-12 shrink-0 cursor-pointer items-start justify-center pt-[1.15rem]"
          title={
            coverage.covered
              ? coverage.picked
                ? "Alerts on (your pick). Uncheck to free the slot."
                : "Alerts on (picked for you: high duty). Uncheck to take it out."
              : "No alerts. Check to turn them on."
          }
        >
          <input
            type="checkbox"
            className={`${ui.checkbox} ${coverage.covered && !coverage.picked ? "opacity-60" : ""}`}
            checked={coverage.covered}
            onChange={(e) => coverage.onChange(e.target.checked)}
            aria-label={`Alerts on ${entry.element.htsno} from ${entry.country.name}`}
          />
        </label>
      )}
      <a
        href={productUrl(row.key)}
        className={`group grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 ${ROW_GRID} px-5 py-4 text-left text-base-content transition-colors hover:bg-base-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          onOpen();
        }}
      >
        {/* Product */}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={`${mono.className} text-sm font-semibold text-base-content`}>{entry.element.htsno}</span>
          <span className="line-clamp-2 text-xs leading-snug text-base-content/60" title={row.description}>
            {row.description}
          </span>
          {/* The key adjustments: what makes this product's rate its own */}
          {tags.length > 0 && (
            <span className="mt-1 flex flex-wrap items-center gap-1" aria-label="Adjustments">
              <AdjustmentsHorizontalIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
              {tags.map((t) => (
                <span key={t.id} className={`${ui.badge("primary")} max-w-48 truncate`} title={t.title}>
                  {t.label}
                </span>
              ))}
            </span>
          )}
        </span>

        {/* Duty rate, beside the product on phones */}
        <span className="flex flex-col items-end gap-1 md:order-4 md:self-center">
          <span className="text-xl font-semibold leading-none tracking-tight tabular-nums">
            {formatRate(row.totalPct)}
          </span>
          {untracked && (
            <span className={`${ui.badge()} whitespace-nowrap`} title="No alerts on this import: pick it in the Alerts column">
              No alerts
            </span>
          )}
          {/* What checking it would find, without saying what */}
          {savingsLocked && row.bestSavingPct > 0.005 && (
            <span className={`${ui.badge("success")} gap-1 whitespace-nowrap`} title="Check this import's savings to see how it could be lower">
              <LockClosedIcon className="h-3 w-3" aria-hidden />
              Savings found
            </span>
          )}
          {savingsReviewed && (
            <span className={`${ui.badge("success")} gap-1 whitespace-nowrap`} title="Every quick win on this import is secured or ruled out">
              <CheckCircleIcon className="h-3 w-3" aria-hidden />
              Savings reviewed
            </span>
          )}
          {!savingsLocked && !savingsReviewed && row.bestSavingPct > 0.005 && (
            <span className={`${ui.badge("success")} gap-1 whitespace-nowrap`}>
              <SparklesIcon className="h-3 w-3" aria-hidden />
              Could be lower
            </span>
          )}
        </span>

        {/* Origin */}
        <span className="col-span-2 flex min-w-0 items-center gap-2 text-sm md:order-2 md:col-span-1">
          <span className="text-lg leading-none" aria-hidden>
            {entry.country.flag}
          </span>
          <span className="truncate">{entry.country.name}</span>
        </span>

        {/* Tariffs: a bar scaled to the highest rate on the list, and the rate of each part */}
        <span className="col-span-2 flex min-w-0 flex-col gap-2 md:order-3 md:col-span-1">
          <span className="flex h-2.5 w-full overflow-hidden rounded-full bg-base-300" aria-hidden>
            <span className="flex h-full" style={{ width: `${barWidth}%` }}>
              {row.parts.map((p) => (
                <span
                  key={p.key}
                  className="h-full"
                  style={{ width: `${(p.pct / row.totalPct) * 100}%`, background: colors[p.key] }}
                />
              ))}
            </span>
          </span>
          <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/70">
            {row.parts.length === 0 ? (
              <span className="text-base-content/60">Duty free</span>
            ) : (
              row.parts.map((p) => (
                <span key={p.key} className="inline-flex items-center gap-1.5 whitespace-nowrap" title={p.key}>
                  <span className="h-2 w-2 rounded-sm" style={{ background: colors[p.key] }} aria-hidden />
                  {p.key === BASE_PART ? "Base" : shortProgram(p.key)}
                  <span className="font-semibold tabular-nums text-base-content">{formatRate(p.pct)}</span>
                </span>
              ))
            )}
          </span>
        </span>

        <ChevronRightIcon
          className="hidden h-5 w-5 justify-self-end text-base-content/40 transition-transform group-hover:translate-x-0.5 group-hover:text-base-content/70 md:order-5 md:block"
          aria-hidden
        />
      </a>
    </li>
  );
};
