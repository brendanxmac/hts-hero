"use client";

import { useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatDate } from "../../duty-calculator/lib/format";
import { TrackedProduct } from "../report";
import { useApplyOption } from "./apply";
import { Opportunity, OpportunityEvent, useOpportunities } from "./OpportunitiesContext";
import { SavingOption } from "./options";
import { OpportunityStatus, STATUSES, statusInfo, StatusTone } from "./statuses";

// Where one saving stands, and the way to move it on: track it, research it, do the paperwork,
// secure it (which applies it to the catalog) or rule it out with a reason. Every move is kept,
// with its note and what it changed, as the saving's history.

const STEPS = STATUSES.filter((s) => s.id !== "not_eligible");

const DOTS: Record<StatusTone, string> = {
  neutral: "bg-base-content/30",
  primary: "bg-primary",
  warning: "bg-warning",
  success: "bg-success",
  error: "bg-error",
};

const applyText = (option: SavingOption, product: TrackedProduct) =>
  option.kind === "origin"
    ? `adds ${product.entry.element.htsno} from ${option.setup.country.name} to your catalog and marks this one as moving there`
    : option.kind === "program"
      ? `claims it on this product in your catalog`
      : `answers this condition yes on this product in your catalog`;

const Timeline = ({ events }: { events: OpportunityEvent[] }) => (
  <ol className="flex flex-col gap-3">
    {[...events].reverse().map((e) => {
      const to = statusInfo(e.toStatus);
      return (
        <li key={e.id} className="flex gap-3">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOTS[to.tone]}`} aria-hidden />
          <div className="min-w-0">
            <p className="m-0 text-sm text-base-content">
              <span className="font-semibold">{e.fromStatus ? `${statusInfo(e.fromStatus).label} → ${to.label}` : `Tracked as ${to.label}`}</span>
              <span className="text-base-content/60"> · {formatDate(e.createdAt.slice(0, 10))}</span>
            </p>
            {e.note && <p className="m-0 mt-0.5 text-sm text-base-content/70">{e.note}</p>}
            {e.applied && (
              <p className="m-0 mt-0.5 text-xs text-base-content/60">
                Applied to your catalog{e.applied.addedProductKey ? `: added ${e.applied.addedProductKey}` : ""}.
              </p>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);

export const OpportunityTracker = ({
  product,
  option,
  opportunity,
}: {
  product: TrackedProduct;
  // The option as it's worked out today; gone once it's secured (the product already has it)
  option?: SavingOption;
  opportunity?: Opportunity;
}) => {
  const { track, setStatus, eventsFor } = useOpportunities();
  const apply = useApplyOption();
  const [pending, setPending] = useState<OpportunityStatus | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async (status: OpportunityStatus) => {
    if (!option) return;
    setBusy(true);
    const saved = await track(product.key, option, status, product.totalPct);
    setBusy(false);
    if (!saved) toast.error("Couldn't save this. Please try again.");
  };

  const confirm = async () => {
    if (!opportunity || !pending) return;
    if (pending === "not_eligible" && !note.trim()) return toast.error("Add the reason it doesn't apply, for the record.");
    setBusy(true);
    const applied = pending === "secured" && option ? apply(option, product) : undefined;
    const ok = await setStatus(opportunity, pending, note.trim() || null, applied);
    setBusy(false);
    if (!ok) return toast.error("Couldn't save this. Please try again.");
    if (applied) toast.success("Secured and applied to your catalog.");
    setPending(null);
    setNote("");
  };

  if (!opportunity) {
    return (
      <div className="flex flex-col gap-3">
        <p className={ui.bodySm}>Track it to keep a record as you research it, do the paperwork and secure it.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tt.button("next", "sm")} disabled={busy || !option} onClick={() => start("researching")}>
            Start researching
          </button>
          <button type="button" className={tt.button("secondary", "sm")} disabled={busy || !option} onClick={() => start("found")}>
            Save for later
          </button>
        </div>
      </div>
    );
  }

  const current = STEPS.findIndex((s) => s.id === opportunity.status);
  const closed = opportunity.status === "not_eligible";

  return (
    <div className="flex flex-col gap-4">
      {/* The steps, each a way to move it there */}
      <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => {
          const done = !closed && i <= current;
          const here = s.id === opportunity.status;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={here || busy}
                onClick={() => setPending(s.id)}
                className={`flex w-full flex-col items-start gap-1.5 rounded-xl p-2 text-left transition-colors hover:bg-tt-soft disabled:cursor-default disabled:hover:bg-transparent ${
                  pending === s.id ? "bg-tt-soft" : ""
                }`}
              >
                <span className={`h-1.5 w-full rounded-full ${done ? (s.id === "secured" ? "bg-success" : "bg-primary") : "bg-base-300"}`} aria-hidden />
                <span className={`text-xs font-semibold ${here ? "text-base-content" : "text-base-content/60"}`}>{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {closed && (
        <p className={`${ui.notice("error")} text-sm`}>
          <XMarkIcon className="h-4 w-4 shrink-0 text-error" aria-hidden /> Ruled out{opportunity.note ? `: ${opportunity.note}` : "."}
        </p>
      )}

      {pending ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-base-300 p-4">
          <p className="m-0 text-sm font-semibold text-base-content">
            Move to {statusInfo(pending).label}
            <span className="font-normal text-base-content/60"> · {statusInfo(pending).description}</span>
          </p>
          {pending === "secured" && option && (
            <p className={`${ui.notice("primary")} text-sm`}>
              <CheckIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              Securing it {applyText(option, product)}. The change is kept in this saving&apos;s history.
            </p>
          )}
          <textarea
            className={ui.textarea}
            rows={2}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={pending === "not_eligible" ? "Why it doesn't apply (required)" : "A note for the record (optional): who you spoke to, what's needed…"}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={tt.button(pending === "secured" ? "money" : "next", "sm")} disabled={busy} onClick={confirm}>
              {busy ? "Saving…" : pending === "secured" ? "Secure and apply" : `Move to ${statusInfo(pending).label}`}
            </button>
            <button type="button" className={tt.button("ghost", "sm")} onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        !closed && (
          <button type="button" className={`${ui.link} self-start text-sm`} onClick={() => setPending("not_eligible")}>
            Not eligible? Rule it out
          </button>
        )
      )}

      <div className="flex flex-col gap-2">
        <span className={tt.eyebrow()}>History</span>
        <Timeline events={eventsFor(opportunity.id)} />
      </div>
    </div>
  );
};
