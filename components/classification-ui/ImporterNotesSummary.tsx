"use client";

import { TagIcon, DocumentTextIcon } from "@heroicons/react/16/solid";

interface Props {
  importerName: string;
  notes?: string;
}

/**
 * Collapsed summary for Importer & Notes section
 * Shows the importer tag and notes preview
 */
export function ImporterNotesSummary({ importerName, notes }: Props) {
  const hasNotes = notes && notes.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 mt-3 ml-1">
      {/* Importer row */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg bg-primary/15">
          <TagIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
        </div>
        <span className="text-sm md:text-base font-semibold text-base-content/80">
          {importerName}
        </span>
      </div>

      {/* Notes preview row */}
      {hasNotes && (
        <div className="flex items-start gap-2.5">
          <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg bg-base-content/10 shrink-0 mt-0.5">
            <DocumentTextIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-base-content/60" />
          </div>
          <p className="text-sm md:text-base text-base-content line-clamp-3 leading-relaxed">
            {notes}
          </p>
        </div>
      )}
    </div>
  );
}
