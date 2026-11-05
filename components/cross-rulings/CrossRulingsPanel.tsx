"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import type { CrossRulingDetail } from "../../interfaces/cross-rulings";
import { crossSearchUrl, fetchCrossRulingByNumber, formatCrossSearchQuery } from "../../libs/cross-rulings";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { useClassification } from "../../contexts/ClassificationContext";
import { classNames } from "../../utilities/style";
import * as ui from "../ui/styles";
import { CenteredSpinner } from "./CenteredSpinner";
import { CrossEvidenceList } from "./CrossEvidenceList";
import { CrossSearchLink } from "./CrossSearchLink";
import { RulingDetailView } from "./RulingDetailView";
import { RulingLookup } from "./RulingLookup";
import { useCrossEvidence } from "./useCrossEvidence";

interface Props {
  /** HTS codes (cut to 8 digits) to offer CROSS searches for */
  searchTerms: string[];
  /** Shows a box for any CROSS search, filled with this (the product description) */
  defaultSearchText?: string;
  /** For tracking: classification / classify_step */
  surface: string;
  canEdit: boolean;
  onAddToNotes?: (text: string) => void;
  compact?: boolean;
}

// A classification's CROSS rulings: search CROSS on CBP's site (a new tab), paste back the number of
// a ruling that fits to read it here, quote it into the notes, and save it as evidence.
export function CrossRulingsPanel({ searchTerms, defaultSearchText, surface, canEdit, onAddToNotes, compact = false }: Props) {
  const { flushAndSave } = useClassification();
  const { evidence, hasEvidence, addEvidence, removeEvidence, updateNote } = useCrossEvidence(surface);
  const [selected, setSelected] = useState<CrossRulingDetail | null>(null);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(defaultSearchText ?? "");

  const openSaved = async (rulingNumber: string) => {
    setOpening(true);
    setOpenError(null);
    const result = await fetchCrossRulingByNumber(rulingNumber);
    setOpening(false);
    if (result.status === "found") setSelected(result.ruling);
    else setOpenError("CBP couldn't return that ruling right now. Try again in a minute, or open it on CROSS.");
  };

  if (opening) return <CenteredSpinner label="Loading ruling text..." />;

  if (selected) {
    return (
      <RulingDetailView
        ruling={selected}
        onBack={() => setSelected(null)}
        onAddToNotes={canEdit ? onAddToNotes : undefined}
        onAddAsEvidence={canEdit ? () => addEvidence(selected) : undefined}
        isEvidence={hasEvidence(selected.rulingNumber)}
      />
    );
  }

  const sectionTitle = compact ? "text-sm font-semibold text-base-content" : "text-base font-semibold text-base-content";
  const box = classNames("rounded-lg border border-base-300 bg-base-100", compact ? "p-3" : "p-5");
  const freeTerm = formatCrossSearchQuery(searchText);

  return (
    <div className="flex flex-col gap-4">
      <section className={box}>
        <h3 className={sectionTitle}>Find Rulings on CROSS</h3>
        <p className="mt-0.5 text-xs text-base-content/60">
          Searches open on CBP&apos;s site, rulings.cbp.gov, in a new tab. Found one that fits? Paste its number below.
        </p>
        {searchTerms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchTerms.map((term) => (
              <CrossSearchLink key={term} term={term} surface={surface} />
            ))}
          </div>
        )}
        {defaultSearchText !== undefined && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              aria-label="Search CROSS for"
              className={compact ? ui.inputSm : ui.input}
              placeholder="Keywords, an HTS code or a ruling number"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && freeTerm) {
                  e.preventDefault();
                  trackEvent(MixpanelEvent.CROSS_SEARCH_OPENED, { surface, term: freeTerm, free_text: true });
                  window.open(crossSearchUrl(freeTerm), "_blank", "noopener,noreferrer");
                }
              }}
            />
            <a
              href={freeTerm ? crossSearchUrl(freeTerm) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!freeTerm}
              className={classNames(ui.button({ size: "sm" }), !freeTerm && "pointer-events-none opacity-50")}
              onClick={() => trackEvent(MixpanelEvent.CROSS_SEARCH_OPENED, { surface, term: freeTerm, free_text: true })}
            >
              Search CROSS
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        )}
      </section>

      <section className={box}>
        <h3 className={sectionTitle}>Look Up a Ruling</h3>
        <p className="mb-3 mt-0.5 text-xs text-base-content/60">
          Read it here, quote it into your notes, or save it as evidence for this classification.
        </p>
        <RulingLookup surface={surface} onFound={setSelected} compact={compact} />
      </section>

      <section className={box}>
        <h3 className={sectionTitle}>
          CROSS Evidence{evidence.length > 0 ? ` (${evidence.length})` : ""}
        </h3>
        <p className="mb-3 mt-0.5 text-xs text-base-content/60">
          The rulings that back this classification. They show in the Classification Defense and the report.
        </p>
        {openError && <p className="mb-2 text-xs text-error">{openError}</p>}
        <CrossEvidenceList
          evidence={evidence}
          canEdit={canEdit}
          compact={compact}
          onRemove={removeEvidence}
          onNoteChange={updateNote}
          onNoteBlur={() => void flushAndSave()}
          onOpen={(n) => void openSaved(n)}
          emptyText="None yet. Look up a ruling above and choose Add as Evidence."
        />
      </section>
    </div>
  );
}
