"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CheckIcon } from "@heroicons/react/20/solid";
import { todayIso } from "../../../duty-calculator/lib/format";
import { FlowPage } from "../../shell/FlowPage";
import { historyRange } from "../../product/analysis/history";
import { TrackedProduct } from "../../report";
import { CalculationResult } from "../../../../tariffs/engine-v2/types";
import { EntryAudit, TrackerEntry } from "../entries";
import { useEntries } from "../EntriesContext";
import { AuditResults, Checking } from "./AuditResults";
import { AdcvdStep } from "./AdcvdStep";
import { CheckStep, useDraftCheck } from "./CheckStep";
import { focusStep } from "./focus";
import { sendAuditReport } from "./reports";
import { detailsProblems, EntryDraft, entryDraft, paidProblem } from "./draft";
import { EntryPart, EntryPartStep, MethodStep, PaidStep } from "./Steps";

// The entry audit, one step at a time (2026-11-02), in the content area beside the sidebar
// (FlowPage, 2026-11-03): how the entry comes in (typed
// in; the 7501 and ES-003 upload is coming soon), the entry (its import when there's a choice, date,
// number and value, each a step of its own), what was paid, Adjustments (what applied to it, with
// what was paid against what it should have paid beside), then AD/CVD. Finish plays "Auditing your
// entry…" while it saves and spends the audit check, then the review plays out (AuditResults): side
// by side, how to proceed, "This looks wrong". Closing goes back to the audits. A saved entry's row
// opens it straight on its Review. Mounted once by EntryCheckHost; the draft is in entryCheckStore.

// The entry's parts are steps of their own, one thing at a time (EntryPartStep)
export type CheckStepId = "method" | EntryPart | "paid" | "check" | "adcvd" | "review";

const RAIL: { id: CheckStepId; label: string; steps: CheckStepId[] }[] = [
  { id: "method", label: "Upload Method", steps: ["method"] },
  { id: "date", label: "Entry Details", steps: ["import", "date", "number", "value"] },
  { id: "paid", label: "Duty Paid", steps: ["paid"] },
  { id: "check", label: "Adjustments", steps: ["check"] },
  { id: "adcvd", label: "AD/CVD", steps: ["adcvd"] },
  // Once it's saved: the steps before open again with the saved entry, and Finish saves over it
  { id: "review", label: "Results", steps: ["review"] },
];

const Rail = ({ step, reachable, onGo }: { step: CheckStepId; reachable: (id: CheckStepId) => boolean; onGo: (id: CheckStepId) => void }) => {
  const at = RAIL.findIndex((r) => r.steps.includes(step));
  return (
    <ol className="m-0 hidden list-none items-center gap-2 p-0 md:flex" aria-label="Audit steps">
      {RAIL.map((r, i) => {
        const done = at > i;
        const current = at === i;
        const canGo = !current && reachable(r.id);
        return (
          <li key={r.id} className="flex items-center gap-2">
            {i > 0 && <span className={`h-px w-8 ${done || current ? "bg-primary/50" : "bg-base-300"}`} aria-hidden />}
            <button
              type="button"
              disabled={!canGo}
              onClick={() => onGo(r.id)}
              aria-current={current ? "step" : undefined}
              className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors enabled:hover:bg-base-300/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-default"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${done ? "bg-primary text-primary-content" : current ? "border-2 border-primary text-primary" : "border-2 border-base-300 text-base-content/40"
                  }`}
                aria-hidden
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-sm font-semibold ${current ? "text-base-content" : done ? "text-base-content/70 group-enabled:group-hover:text-base-content" : "text-base-content/40"}`}
              >
                {r.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

export interface Saved {
  entry: TrackerEntry;
  product: TrackedProduct;
  audit: EntryAudit;
  result: CalculationResult;
}

// AD/CVD, with the draft's live check kept here too, so Finish saves exactly what was shown. The
// save is handed up and runs while "Auditing your entry…" plays, not before it.
const AdcvdWithFinish = ({
  product,
  draft,
  set,
  onBack,
  onFinish,
}: {
  product: TrackedProduct;
  draft: EntryDraft;
  set: (patch: Partial<EntryDraft>) => void;
  onBack: () => void;
  onFinish: (save: () => Promise<Saved | null>) => void;
}) => {
  const { addAndCheck, update } = useEntries();
  const { facts, result, audit, adcvd } = useDraftCheck(product, draft);
  const save = async (): Promise<Saved | null> => {
    const entry = {
      htsCode: product.key.split("-")[0],
      country: product.entry.country.code,
      entryDate: facts.entryDate,
      entryNumber: draft.entryNumber.trim() || null,
      customsValue: facts.customsValue,
      quantity: facts.quantity,
      dutyPaid: Number(draft.dutyPaid),
      claimedPreference: result.availablePreferences.some((p) => p.symbol === facts.claimedPreference) ? facts.claimedPreference : null,
      answers: facts.answers,
      adcvd,
    };
    // A saved entry stepped back into: saved over, its check already spent
    if (draft.editingId) {
      const updated = await update(draft.editingId, entry);
      if (!updated) toast.error("Couldn't save your changes. Please try again.");
      return updated && { entry: updated, product, audit, result };
    }
    const saved = await addAndCheck(entry);
    if (!saved) {
      toast.error("Couldn't save this entry. Please try again.");
      return null;
    }
    if (!saved.checked) {
      toast.error("Saved, but the check didn't go through. Check it from your audits.");
      return null;
    }
    // Cases added by hand that our matching didn't link to the import: so they can be linked
    for (const c of adcvd.cases.filter((x) => x.source === "added"))
      void sendAuditReport({
        kind: "case_link",
        entryId: saved.entry.id,
        htsCode: saved.entry.htsCode,
        country: saved.entry.country,
        caseNumber: c.caseNumbers[0],
        details: { case: c, summary: `Added ${c.caseNumbers.join(", ")} (${c.answer === "yes" ? "covers the goods" : c.answer}) to an entry of ${saved.entry.htsCode} from ${saved.entry.country}` },
      });
    return { entry: saved.entry, product, audit, result };
  };
  return <AdcvdStep product={product} draft={draft} set={set} busy={false} onBack={onBack} onFinish={() => onFinish(save)} />;
};

export const EntryCheck = ({
  products,
  fixed,
  draft,
  setDraft,
  onClose,
  onReset,
  review,
}: {
  products: TrackedProduct[];
  // The one product it's for (a product's Audit tab): no picking
  fixed: boolean;
  draft: EntryDraft;
  setDraft: (draft: EntryDraft) => void;
  onClose: () => void;
  // Saved: a fresh draft for the next one
  onReset: () => void;
  // A saved entry to open on: straight to its Review
  review?: Saved;
}) => {
  const [step, setStep] = useState<CheckStepId>(draft.entryDate ? "date" : "method");
  const [saved, setSaved] = useState<Saved | null>(review ?? null);
  // "Auditing your entry…" plays while the entry saves; the Review shows once both are done
  const [checking, setChecking] = useState(false);
  const [played, setPlayed] = useState(Boolean(review));
  const finish = async (save: () => Promise<Saved | null>) => {
    setPlayed(false);
    setChecking(true);
    const s = await save();
    if (s) {
      setSaved(s);
      setLeft(null);
      onReset();
    }
    setChecking(false);
  };
  const showChecking = checking || (saved !== null && !played);
  // The Results stepped back from, to return to unchanged
  const [left, setLeft] = useState<Saved | null>(null);
  // From the Results, any step opens again with the saved entry in it, to look over or change
  const stepBack = (id: CheckStepId) => {
    if (!saved) return;
    setDraft(entryDraft(saved.entry));
    setLeft(saved);
    setSaved(null);
    setStep(id === "date" && !fixed ? "import" : id);
  };
  const backToResults = () => {
    if (!left) return;
    onReset();
    setSaved(left);
    setLeft(null);
  };
  const scroller = useRef<HTMLDivElement>(null);
  const range = useMemo(() => historyRange(), []);
  const today = todayIso();
  const product = products.find((p) => p.key === draft.productKey);
  const set = (patch: Partial<EntryDraft>) => setDraft({ ...draft, ...patch });

  const detailsOk = Object.keys(detailsProblems(draft, product, range, today)).length === 0;
  const paidOk = detailsOk && !paidProblem(draft);
  const parts: EntryPart[] = fixed ? ["date", "number", "value"] : ["import", "date", "number", "value"];
  const reachable = (id: CheckStepId) =>
    id === "method" || id === "date" || (id === "paid" && detailsOk) || (id === "check" && paidOk) || (id === "adcvd" && paidOk && draft.answers !== null);

  // Check & Adjust starts from the import's settings today
  const go = (next: CheckStepId) => {
    if (next === "check" && product && draft.answers === null)
      setDraft({ ...draft, claimedPreference: product.input.claimedPreference ?? null, answers: { ...(product.adjustments.answers ?? {}) } });
    setStep(next);
  };

  // Each step starts at the top, its input focused (focus.ts), or its title for screen readers
  const toTop = () => scroller.current?.scrollTo({ top: 0 });
  useEffect(() => {
    toTop();
    const timer = setTimeout(() => focusStep(scroller.current), 50);
    return () => clearTimeout(timer);
  }, [step, saved, showChecking]);

  const body = (() => {
    if (showChecking) return <Checking date={draft.entryDate || saved?.entry.entryDate || today} onDone={() => setPlayed(true)} />;
    if (saved)
      return (
        <AuditResults
          {...saved}
          onClose={onClose}
          onAnother={() => {
            setSaved(null);
            setStep(parts[0]);
          }}
        />
      );
    switch (step) {
      case "method":
        return <MethodStep onNext={() => go(parts[0])} />;
      case "import":
      case "date":
      case "value":
      case "number": {
        const i = parts.indexOf(step);
        return (
          <EntryPartStep
            part={step}
            parts={parts}
            draft={draft}
            set={set}
            products={products}
            range={range}
            today={today}
            onBack={() => go(i > 0 ? parts[i - 1] : "method")}
            onNext={() => go(parts[i + 1] ?? "paid")}
            onEdit={go}
          />
        );
      }
      case "paid":
        return <PaidStep draft={draft} set={set} onBack={() => go("value")} onNext={() => go("check")} />;
      case "check":
        return product ? <CheckStep product={product} draft={draft} set={set} onBack={() => go("paid")} onNext={() => go("adcvd")} /> : null;
      case "adcvd":
        return product ? (
          <AdcvdWithFinish
            product={product}
            draft={draft}
            set={set}
            onBack={() => go("check")}
            onFinish={finish}
          />
        ) : null;
    }
  })();

  const about = saved?.product ?? product;
  return (
    <FlowPage
      label="Entry Audit"
      context={about ? `${about.entry.element.htsno} · ${about.entry.country.flag} ${about.entry.country.name}` : undefined}
      back="Back to Audits"
      onClose={onClose}
      scroller={scroller}
      progress={{ at: RAIL.findIndex((r) => r.steps.includes(saved || checking ? "review" : step)) + 1, of: RAIL.length }}
      rail={
        <Rail
          step={saved || checking ? "review" : step}
          reachable={(id) => !checking && (saved ? id !== "review" : id === "review" ? left !== null : reachable(id))}
          onGo={(id) => (saved ? stepBack(id) : id === "review" ? backToResults() : go(id))}
        />
      }
    >
      {/* Steps sit at the top, so a step growing or shrinking never moves what's above it */}
      <div key={showChecking ? "checking" : saved ? "results" : step} className="flex flex-1 flex-col">
        {body}
      </div>
    </FlowPage>
  );
};
