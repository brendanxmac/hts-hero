"use client";

import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import type { ReactNode } from "react";
import type { CrossEvidence } from "../../interfaces/cross-rulings";
import { CROSS_SOURCE_CREDIT, crossRulingUrl, formatRulingDate, rulingLabel } from "../../libs/cross-rulings";
import { classNames } from "../../utilities/style";
import * as ui from "../ui/styles";
import { TariffBadges } from "./TariffBadges";

interface Props {
  evidence: CrossEvidence[];
  canEdit: boolean;
  onRemove?: (rulingNumber: string) => void;
  onNoteChange?: (rulingNumber: string, note: string) => void;
  /** Save now (on leaving a note), rather than on the context's debounce */
  onNoteBlur?: () => void;
  /** Read the ruling's full text here; a link to CBP's page when left out */
  onOpen?: (rulingNumber: string) => void;
  /** Shown when nothing is saved yet */
  emptyText?: ReactNode;
  compact?: boolean;
}

// The rulings saved as evidence for a classification: what each one is, the user's note on why it
// supports the classification, and a link to it on CBP's site. A ruling binds only on the facts it
// describes, so we say so, and credit CBP as the source.
export function CrossEvidenceList({
  evidence,
  canEdit,
  onRemove,
  onNoteChange,
  onNoteBlur,
  onOpen,
  emptyText = "No rulings saved as evidence yet.",
  compact = false,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {evidence.length === 0 ? (
        <p className="text-sm text-base-content/60">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {evidence.map((item) => (
            <li
              key={item.rulingNumber}
              className={classNames(
                "rounded-lg border bg-base-100",
                compact ? "p-3" : "p-4",
                item.revoked ? "border-error/30" : "border-base-300"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-sm bg-base-200 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-base-content/70">
                      {rulingLabel(item)}
                    </span>
                    {item.revoked && (
                      <span className="rounded-sm bg-error/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-error">
                        Revoked
                      </span>
                    )}
                    {item.rulingDate && (
                      <span className="text-xs text-base-content/50">{formatRulingDate(item.rulingDate)}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold leading-snug text-base-content">{item.subject}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {onOpen ? (
                    <button
                      type="button"
                      className={ui.button({ variant: "ghost", size: "sm" })}
                      onClick={() => onOpen(item.rulingNumber)}
                    >
                      Read
                    </button>
                  ) : (
                    <a
                      href={crossRulingUrl(item.rulingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ui.button({ variant: "ghost", size: "sm" })}
                    >
                      View on CROSS
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}
                  {canEdit && onRemove && (
                    <button
                      type="button"
                      className={ui.button({ variant: "ghost", size: "sm", icon: true })}
                      aria-label={`Remove ${rulingLabel(item)} from evidence`}
                      onClick={() => onRemove(item.rulingNumber)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {item.tariffs.length > 0 && (
                <div className="mt-2">
                  <TariffBadges tariffs={item.tariffs} />
                </div>
              )}
              {canEdit && onNoteChange ? (
                <textarea
                  aria-label={`Why ${rulingLabel(item)} supports this classification`}
                  className={classNames(ui.textarea, "mt-3 min-h-16")}
                  placeholder="Why this ruling supports the classification (similar product, same heading, same GRI…)"
                  value={item.note}
                  onChange={(e) => onNoteChange(item.rulingNumber, e.target.value)}
                  onBlur={onNoteBlur}
                />
              ) : (
                item.note && <p className="mt-3 whitespace-pre-wrap text-sm text-base-content/80">{item.note}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-base-content/50">
        {CROSS_SOURCE_CREDIT}. A ruling applies to the facts it describes.
      </p>
    </div>
  );
}
