"use client";

import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as ui from "@/components/ui/styles";
import { formatDate, todayIso } from "../../duty-calculator/lib/format";
import { useTrackerAccess } from "../access/accessContext";
import { historyRange } from "../product/analysis/history";
import { TrackedProduct } from "../report";
import { useTracker } from "../TrackerContext";
import { useEntries } from "./EntriesContext";

// Logs one line of a past entry (a catalog product, or the one product it's fixed to: a product's
// Audit tab) and checks it, spending one of the trial's audit checks. Entries from the first
// verified revision on can be checked.

const productLabel = (p: TrackedProduct) => `${p.entry.element.htsno} · ${p.entry.country.flag} ${p.entry.country.name}`;

interface Draft {
  productKey: string;
  entryDate: string;
  entryNumber: string;
  customsValue: string;
  quantity: string;
  dutyPaid: string;
}

export const AuditForm = ({ fixedProduct }: { fixedProduct?: TrackedProduct }) => {
  const { products: catalog } = useTracker();
  const { addAndCheck } = useEntries();
  const products = fixedProduct ? [fixedProduct] : catalog;
  const { paid, auditsLeft, openUpgrade } = useTrackerAccess();
  const range = useMemo(() => historyRange(), []);
  const today = todayIso();
  const [draft, setDraft] = useState<Draft>({
    productKey: products[0]?.key ?? "",
    entryDate: "",
    entryNumber: "",
    customsValue: "",
    quantity: "",
    dutyPaid: "",
  });
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const product = products.find((p) => p.key === draft.productKey) ?? products[0];
  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setProblem(null);
  };
  const outOfChecks = !paid && auditsLeft === 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (outOfChecks) return openUpgrade("entries");
    const value = Number(draft.customsValue);
    const paidUsd = Number(draft.dutyPaid);
    if (!product) return setProblem("Pick a product from your imports.");
    if (!draft.entryDate || draft.entryDate > today) return setProblem("Enter the entry date (today or earlier).");
    if (draft.entryDate < range.from) return setProblem(`Entries from ${formatDate(range.from)} on can be checked.`);
    if (!(value > 0)) return setProblem("Enter the entered (customs) value.");
    if (!(paidUsd >= 0) || draft.dutyPaid.trim() === "") return setProblem("Enter the duty paid on this line.");
    if (draft.quantity && !(Number(draft.quantity) > 0)) return setProblem("Enter a quantity above zero, or leave it empty.");
    setBusy(true);
    const saved = await addAndCheck({
      htsCode: product.key.split("-")[0],
      country: product.entry.country.code,
      entryDate: draft.entryDate,
      entryNumber: draft.entryNumber.trim() || null,
      customsValue: value,
      quantity: draft.quantity ? Number(draft.quantity) : null,
      dutyPaid: paidUsd,
    });
    setBusy(false);
    if (!saved) toast.error("Couldn't save this entry. Please try again.");
    else setDraft((d) => ({ ...d, entryNumber: "", customsValue: "", quantity: "", dutyPaid: "" }));
  };

  return (
    <form onSubmit={submit} className={ui.card} aria-labelledby="tt-audit-form">
      <div className={ui.cardHeader}>
        <div>
          <h2 id="tt-audit-form" className={ui.cardTitle}>
            Audit an entry
          </h2>
          <p className={`${ui.caption} mt-0.5`}>
            {fixedProduct ? "One entry of this product" : "One line of a past entry: what it was"}, when it entered, and the duty you paid.
          </p>
        </div>
      </div>
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {!fixedProduct && (
        <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <span className={ui.fieldLabel}>Product</span>
          <select className={ui.select} value={product?.key ?? ""} onChange={(e) => set({ productKey: e.target.value })}>
            {products.map((p) => (
              <option key={p.key} value={p.key}>
                {productLabel(p)}
              </option>
            ))}
          </select>
        </label>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={ui.fieldLabel}>Entry date</span>
          <input type="date" className={ui.input} min={range.from} max={today} value={draft.entryDate} onChange={(e) => set({ entryDate: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={ui.fieldLabel}>Entry number (optional)</span>
          <input className={ui.input} value={draft.entryNumber} maxLength={20} onChange={(e) => set({ entryNumber: e.target.value })} placeholder="e.g. ABC-1234567-8" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={ui.fieldLabel}>Entered value (USD)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" className={ui.input} value={draft.customsValue} onChange={(e) => set({ customsValue: e.target.value })} />
        </label>
        {product?.result.requiresQuantity && (
          <label className="flex flex-col gap-1.5">
            <span className={ui.fieldLabel}>Quantity</span>
            <input type="number" min="0" step="any" inputMode="decimal" className={ui.input} value={draft.quantity} onChange={(e) => set({ quantity: e.target.value })} placeholder={product.quantity.toLocaleString("en-US")} />
          </label>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={ui.fieldLabel}>Duty paid (USD, without fees)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" className={ui.input} value={draft.dutyPaid} onChange={(e) => set({ dutyPaid: e.target.value })} />
        </label>
      </div>
      <div className={`${ui.cardFooter} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
        <p className={problem ? "text-sm text-error" : ui.caption}>
          {problem ??
            "Checked with the product's own answers and trade program from your imports. Duty paid is on the entry summary, without MPF or HMF."}
        </p>
        <button type="submit" className={`${ui.button({ variant: "primary" })} shrink-0`} disabled={busy || !products.length}>
          {busy ? "Checking…" : outOfChecks ? "See plans" : paid ? "Check this entry" : "Check this entry · 1 free check"}
        </button>
      </div>
    </form>
  );
};
