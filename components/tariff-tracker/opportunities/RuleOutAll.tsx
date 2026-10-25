"use client";

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../../duty-calculator/lib/format";
import { TrackedProduct } from "../report";
import { Opportunity, useOpportunities } from "./OpportunitiesContext";
import { SavingOption } from "./options";
import { isOpen } from "./statuses";

// Rules out a group of a product's open savings at once, each moved to Not eligible with the reason
// in its own history, so it's on record like a single one. Secured savings and ones ruled out
// already are left alone. Two groups (review.ts):
// - the quick wins (trade programs and exemptions): ruling them out finishes the import's review.
//   That doesn't mean nothing's left to save: sourcing it elsewhere is still there, longer term
// - sourcing it somewhere else: a big, risky change most importers won't make, so it's its own call
// Once a group is all decided, it says when and why instead.

type Scope = "quick" | "sourcing";

const COPY: Record<Scope, { button: string; title: string; reasons: { id: string; label: string }[]; done: (reason: string, date: string) => string }> = {
  quick: {
    button: "None of the quick wins work for us",
    title: "Rule out the quick wins",
    reasons: [
      { id: "not_interested", label: "We're not interested in these" },
      { id: "not_viable", label: "None of these are viable for our goods" },
    ],
    done: (reason, date) =>
      `Quick wins reviewed${reason ? `: ${reason}` : ""} (${date}). Sourcing it somewhere else is still there as a longer-term option.`,
  },
  sourcing: {
    button: "Not changing where we source it",
    title: "Rule out sourcing it elsewhere",
    reasons: [
      { id: "not_moving", label: "We're not looking to change suppliers" },
      { id: "not_realistic", label: "None of these countries are realistic for us" },
    ],
    done: (reason, date) => `Sourcing elsewhere ruled out${reason ? `: ${reason}` : ""} (${date}). Open one to look at it again.`,
  },
};

const inScope = (scope: Scope, option?: SavingOption, opportunity?: Opportunity) => {
  const kind = option?.kind ?? opportunity?.kind;
  return scope === "sourcing" ? kind === "origin" : kind !== "origin";
};

export const RuleOutAll = ({
  scope,
  product,
  items: all,
}: {
  scope: Scope;
  product: TrackedProduct;
  // The product's options, each with its tracked opportunity
  items: { option?: SavingOption; opportunity?: Opportunity }[];
}) => {
  const { track, setStatus } = useOpportunities();
  const copy = COPY[scope];
  const items = all.filter((i) => inScope(scope, i.option, i.opportunity));
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(copy.reasons[0].id);
  const [busy, setBusy] = useState(false);

  // Options not yet tracked, and tracked ones still open
  const pending = items.filter((i) => (i.option && !i.opportunity) || (i.opportunity && isOpen(i.opportunity.status)));
  const ruledOut = items.filter((i) => i.opportunity?.status === "not_eligible");

  if (!pending.length) {
    if (!ruledOut.length) return null;
    const last = ruledOut.map((i) => i.opportunity!).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    return (
      <p className={`${ui.notice(scope === "quick" ? "success" : "primary")} text-sm`}>
        {scope === "quick" ? <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden /> : <XCircleIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
        {copy.done(last.note ?? "", formatDate(last.updatedAt.slice(0, 10)))}
      </p>
    );
  }

  const confirm = async () => {
    const text = copy.reasons.find((x) => x.id === reason)!.label;
    setBusy(true);
    const results = await Promise.all(
      pending.map((i) =>
        i.opportunity ? setStatus(i.opportunity, "not_eligible", text) : track(product.key, i.option!, "not_eligible", product.totalPct, text).then(Boolean)
      )
    );
    setBusy(false);
    const failed = results.filter((ok) => !ok).length;
    if (failed) return toast.error(`Couldn't rule out ${failed} of them. Please try again.`);
    toast.success(`Ruled out ${pending.length} ${pending.length === 1 ? "option" : "options"}.`);
    setOpen(false);
  };

  if (!open) {
    return (
      <button type="button" className={`${ui.button({ variant: "ghost", size: "sm" })} self-start`} onClick={() => setOpen(true)}>
        <XCircleIcon className="h-4 w-4" aria-hidden />
        {copy.button}
      </button>
    );
  }

  return (
    // Inside the Savings card: a container fill, never a card inside the card
    <div className="flex flex-col gap-3 rounded-xl bg-tt-soft p-4">
      <p className="m-0 text-sm font-semibold text-base-content">
        {copy.title}: {pending.length} {pending.length === 1 ? "option" : "options"}
        <span className="font-normal text-base-content/60"> · each is marked Not eligible, with the reason kept</span>
      </p>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Reason">
        {copy.reasons.map((r) => (
          <label key={r.id} className="flex cursor-pointer items-center gap-2 text-sm text-base-content">
            <input type="radio" name={`rule-out-${scope}-${product.key}`} className="accent-primary" checked={reason === r.id} onChange={() => setReason(r.id)} />
            {r.label}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={ui.button({ variant: "primary", size: "sm" })} disabled={busy} onClick={confirm}>
          {busy ? "Ruling out…" : "Rule them all out"}
        </button>
        <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};
