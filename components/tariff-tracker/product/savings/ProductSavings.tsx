"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CENSUS_NOTICE } from "../../../duty-calculator/lib/census";
import { UsImports } from "../../../duty-calculator/lib/usImportsData";
import { formatRate } from "../../formatRate";
import { useInsights } from "../../insights/InsightsContext";
import { ReviewState } from "../../opportunities/review";
import { TrackedProduct } from "../../report";
import { FreeChecksNotice } from "../../access/FreeChecksNotice";
import { LockedSavings } from "./LockedSavings";
import { rateWith, SavingCard, SecuredRow } from "./SavingCard";
import { ReviewStart, SavingsReview } from "./SavingsReview";
import { KIND_ORDER, ListItem, undecided, useSavingsItems } from "./useSavingsItems";

// A product's Savings tab, by where its savings review stands (review.ts). Not started (not checked
// yet, or checked with nothing answered): what the review covers and the way in. Under way or
// done, only what's left to do: one line on where the review stands and the way back in, a card
// for each saving being pursued with its next move (SavingCard), the secured ones as rows, and one
// line for everything ruled out or not answered. The questions themselves are answered in the
// review (SavingsReview), the whole screen, one at a time, like the entry audit. Amounts show as
// percentages of the value.

const status = (i: ListItem) => i.opportunity?.status;
const pursued = (i: ListItem) => status(i) === "researching" || status(i) === "in_progress";

// Where the review stands, and the way back in
const ReviewLine = ({ product, state, items, onOpen }: { product: TrackedProduct; state: ReviewState; items: ListItem[]; onOpen: (open: ReviewStart) => void }) => {
  const reviewable = items.filter((i) => i.option);
  const left = reviewable.filter(undecided);
  const secured = items.filter((i) => status(i) === "secured");
  const best = Math.max(0, ...items.filter(pursued).map((i) => rateWith(product, i).off));
  const done = state === "reviewed";
  const firstLeft = left[0];
  const firstKind = KIND_ORDER.find((k) => reviewable.some((i) => i.option!.kind === k));

  return (
    <section className={`${tt.panel} flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4`} aria-label="Savings review">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span className={tt.chip(done ? "success" : "warning")}>
          {done ? "Review complete" : `In progress · ${reviewable.length - left.length} of ${reviewable.length} answered`}
        </span>
        <span className="text-sm text-base-content">
          {best > 0.005 ? (
            <>
              Pursuing up to <span className="font-semibold text-success">−{formatRate(best)}</span> off the duty rate
            </>
          ) : secured.length ? (
            "Your savings on this import are secured"
          ) : done ? (
            "Nothing to pursue right now. We'll keep checking as tariffs change."
          ) : (
            "Pick up where you left off"
          )}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {done ? (
          <>
            <button type="button" className={`${ui.link} text-sm font-semibold`} onClick={() => onOpen({ step: "summary" })}>
              See Summary
            </button>
            {firstKind && (
              <button type="button" className={`${ui.link} text-sm font-semibold`} onClick={() => onOpen({ step: firstKind, at: 0 })}>
                Change Answers
              </button>
            )}
          </>
        ) : (
          <>
            <button type="button" className={`${ui.link} text-sm font-semibold`} onClick={() => onOpen({ step: "summary" })}>
              Summary So Far
            </button>
            <button
              type="button"
              className={ui.button({ variant: "primary", size: "sm" })}
              onClick={() => onOpen(firstLeft ? { step: firstLeft.option!.kind, id: firstLeft.id } : { step: "summary" })}
            >
              Continue Savings Review
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
          </>
        )}
      </div>
    </section>
  );
};

// Under way or done: what's left to do
const YourSavings = ({
  product,
  state,
  items,
  imports,
  onOpen,
}: {
  product: TrackedProduct;
  state: ReviewState;
  items: ListItem[];
  imports: UsImports | null;
  onOpen: (open: ReviewStart) => void;
}) => {
  const byOff = (a: ListItem, b: ListItem) => rateWith(product, b).off - rateWith(product, a).off;
  const pursuing = items.filter(pursued).sort(byOff);
  const secured = items.filter((i) => status(i) === "secured");
  const ruledOut = items.filter((i) => status(i) === "not_eligible").length;
  const left = items.filter(undecided);

  return (
    <>
      <ReviewLine product={product} state={state} items={items} onOpen={onOpen} />
      {pursuing.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="tt-pursuing">
          <h2 id="tt-pursuing" className={`${tt.sectionTitle} px-1`}>
            Savings You&apos;re Pursuing
          </h2>
          {pursuing.map((i) => (
            <SavingCard key={i.id} product={product} item={i} imports={imports} />
          ))}
        </section>
      )}
      {secured.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="tt-secured">
          <h2 id="tt-secured" className={`${tt.sectionTitle} px-1`}>
            Secured
          </h2>
          <ul className={`${tt.panel} m-0 flex list-none flex-col divide-y divide-base-300 p-0`}>
            {secured.map((i) => (
              <SecuredRow key={i.id} product={product} item={i} />
            ))}
          </ul>
        </section>
      )}
      {(ruledOut > 0 || left.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm">
          <span className="text-base-content/60">
            {[ruledOut > 0 && `${ruledOut} ruled out`, left.length > 0 && `${left.length} not answered`].filter(Boolean).join(" · ")}
          </span>
          {left.length > 0 && (
            <button type="button" className={`${ui.link} inline-flex items-center gap-1 font-semibold`} onClick={() => onOpen({ step: left[0].option!.kind, id: left[0].id })}>
              Review Them
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </>
  );
};

export const ProductSavings = ({ product }: { product: TrackedProduct }) => {
  const insights = useInsights();
  const { items, imports, loading } = useSavingsItems(product);
  const checked = insights.unlocked.has(product.key);
  const state: ReviewState = !checked ? "unchecked" : (insights.review.get(product.key) ?? "to_review");
  const [open, setOpen] = useState<ReviewStart | null>(null);
  const started = state === "in_progress" || state === "reviewed";
  const hasOptions = items.some((i) => i.option);

  return (
    <div className="flex flex-col gap-4">
      <FreeChecksNotice kind="savings" />
      {checked && loading ? (
        <div className={`${ui.skeleton} h-40 w-full`} aria-busy="true" />
      ) : checked && items.length === 0 ? (
        <div className={`${ui.card} p-6`}>
          <p className={ui.bodySm}>
            No trade program, exemption or cheaper country of origin would lower the duty on this import today. We&apos;ll keep checking as tariffs change.
          </p>
        </div>
      ) : started || (checked && !hasOptions) ? (
        <YourSavings product={product} state={state} items={items} imports={imports ?? null} onOpen={setOpen} />
      ) : (
        <LockedSavings product={product} checked={checked} items={items} onStart={() => setOpen({ step: "intro" })} />
      )}
      {checked && imports && <p className={ui.caption}>Import figures: U.S. Census Bureau. {CENSUS_NOTICE}</p>}
      {open && createPortal(<SavingsReview product={product} start={open} onClose={() => setOpen(null)} />, document.body)}
    </div>
  );
};
