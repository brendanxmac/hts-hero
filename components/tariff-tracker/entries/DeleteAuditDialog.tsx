"use client";

import { useState } from "react";
import { TrashIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Dialog } from "@/components/ui/Dialog";
import { mono, trackerSans } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { formatDate } from "../../duty-calculator/lib/format";
import { money, VERDICTS } from "./EntriesTable";
import { AuditRow } from "./useAuditRows";

// Before an audited entry is deleted (EntriesTable's trash button): which one, as it reads in the
// table (when, what, paid and owed, the result), so the right one goes, and that it can't be undone.
// Portals out of Duty Guard, so it carries Duty Guard's look itself (DESIGN_SYSTEM §15).

export const DeleteAuditDialog = ({ row, onConfirm, onClose }: { row: AuditRow | null; onConfirm: (row: AuditRow) => Promise<boolean>; onClose: () => void }) => {
  const [busy, setBusy] = useState(false);
  // Kept while it closes, so the panel doesn't empty mid-fade
  const [shown, setShown] = useState(row);
  if (row && row !== shown) setShown(row);
  const r = row ?? shown;
  if (!r) return null;
  const { entry, product, audit } = r;
  const verdict = audit ? VERDICTS[audit.verdict] : null;

  const confirm = async () => {
    setBusy(true);
    const ok = await onConfirm(r);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={!!row} onClose={() => !busy && onClose()} className="relative z-[80]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} tt-ob-pop relative flex w-full max-w-md flex-col gap-5 p-6 shadow-2xl sm:p-7`}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error/12 text-error" aria-hidden>
            <TrashIcon className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-2">
            <span className={tt.eyebrow("error")}>Delete Audit</span>
            <Dialog.Title className={`${tt.display} m-0 pr-6 text-2xl font-semibold leading-tight text-base-content`}>Delete this audited entry?</Dialog.Title>
            <p className="m-0 text-sm leading-relaxed text-base-content/70">
              It comes out of your audits and their totals for good. This can&apos;t be undone.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl bg-tt-soft p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold text-base-content">Entry of {formatDate(entry.entryDate)}</span>
                <span className="truncate text-xs text-base-content/60">
                  {entry.entryNumber && <span className={mono.className}>{entry.entryNumber} · </span>}
                  {product ? (
                    <>
                      <span className={mono.className}>{product.entry.element.htsno}</span> · {product.entry.country.flag} {product.entry.country.name}
                    </>
                  ) : (
                    `${entry.htsCode} · ${entry.country}`
                  )}
                </span>
              </span>
              {verdict && <span className={`${tt.chip(verdict.tone)} shrink-0`}>{verdict.label}</span>}
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-base-300 pt-3 text-sm">
              <span className="flex flex-col">
                <span className="text-xs text-base-content/60">Entered</span>
                <span className="font-semibold tabular-nums text-base-content">{money(entry.customsValue)}</span>
              </span>
              <span className="flex flex-col">
                <span className="text-xs text-base-content/60">Paid</span>
                <span className="font-semibold tabular-nums text-base-content">{money(audit?.paid ?? entry.dutyPaid + (entry.adcvd?.paid ?? 0))}</span>
              </span>
              <span className="flex flex-col">
                <span className="text-xs text-base-content/60">Owed</span>
                <span className="font-semibold tabular-nums text-base-content">{audit ? money(audit.owed) : "—"}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={ui.button({ variant: "secondary" })} onClick={onClose} disabled={busy} autoFocus>
              Keep it
            </button>
            <button
              type="button"
              className={`${ui.button({ variant: "primary" })} bg-error! text-error-content! hover:bg-error/90!`}
              onClick={confirm}
              disabled={busy}
            >
              <TrashIcon className="h-4 w-4" aria-hidden />
              {busy ? "Deleting…" : "Delete audit"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
