"use client";

import { useState } from "react";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CENSUS_NOTICE } from "../../../duty-calculator/lib/census";
import { UsImports } from "../../../duty-calculator/lib/usImportsData";
import { useInsights } from "../../insights/InsightsContext";
import { ReviewState } from "../../opportunities/review";
import { TrackedProduct } from "../../report";
import { FreeChecksNotice } from "../../access/FreeChecksNotice";
import { LockedSavings } from "./LockedSavings";
import { rateWith, SavingCard, SecuredRow } from "./SavingCard";
import { ReviewStart, SavingsReview } from "./SavingsReview";
import { ListItem, useSavingsItems } from "./useSavingsItems";
import { pursued, ReviewOverview, WhatWeChecked } from "./ReviewOverview";

// A product's Savings tab, by where its savings review stands (review.ts). Not started (not checked
// yet, or checked with nothing answered): what the review covers and the way in. Under way or
// done, only what's left to do: one line on where the review stands and the way back in, a card
// for each saving being pursued with its next move (SavingCard), the secured ones as rows, and one
// line for everything ruled out or not answered. The questions themselves are answered in the
// review (SavingsReview), in the content area beside the sidebar, one at a time, like the entry audit. Amounts show as
// percentages of the value.

const status = (i: ListItem) => i.opportunity?.status;

// Under way or done: where it stands and what it found, the savings being pursued with their next
// move, the secured ones, then everything it checked
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
  const byOff = (a: ListItem, b: ListItem) =>
    rateWith(product, b).off - rateWith(product, a).off;
  const pursuing = items.filter(pursued).sort(byOff);
  const secured = items.filter((i) => status(i) === "secured");

  return (
    <>
      <ReviewOverview
        product={product}
        state={state}
        items={items}
        onOpen={onOpen}
      />
      {pursuing.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="tt-pursuing">
          <h2 id="tt-pursuing" className={`${tt.sectionTitle} px-1`}>
            Savings You&apos;re Pursuing
          </h2>
          {pursuing.map((i) => (
            <SavingCard
              key={i.id}
              product={product}
              item={i}
              imports={imports}
            />
          ))}
        </section>
      )}
      {secured.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="tt-secured">
          <h2 id="tt-secured" className={`${tt.sectionTitle} px-1`}>
            Secured
          </h2>
          <ul
            className={`${tt.panel} m-0 flex list-none flex-col divide-y divide-base-300 p-0`}
          >
            {secured.map((i) => (
              <SecuredRow key={i.id} product={product} item={i} />
            ))}
          </ul>
        </section>
      )}
      <WhatWeChecked product={product} items={items} onOpen={onOpen} />
    </>
  );
};

export const ProductSavings = ({ product }: { product: TrackedProduct }) => {
  const insights = useInsights();
  const { items, imports, loading } = useSavingsItems(product);
  const checked = insights.unlocked.has(product.key);
  const state: ReviewState = !checked
    ? "unchecked"
    : (insights.review.get(product.key) ?? "to_review");
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
            No trade program, exemption or cheaper country of origin would lower
            the duty on this import today. We&apos;ll keep checking as tariffs
            change.
          </p>
        </div>
      ) : started || (checked && !hasOptions) ? (
        <YourSavings
          product={product}
          state={state}
          items={items}
          imports={imports ?? null}
          onOpen={setOpen}
        />
      ) : (
        <LockedSavings
          product={product}
          checked={checked}
          items={items}
          onStart={() => setOpen({ step: "intro" })}
        />
      )}
      {checked && imports && (
        <p className={ui.caption}>
          Import figures: U.S. Census Bureau. {CENSUS_NOTICE}
        </p>
      )}
      {open && (
        <SavingsReview
          product={product}
          start={open}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
};
