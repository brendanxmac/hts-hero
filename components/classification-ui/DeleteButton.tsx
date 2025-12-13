"use client";

import { TrashIcon } from "@heroicons/react/16/solid";

export interface DeleteButtonProps {
  canDelete: boolean;
  isDeleting: boolean;
  onClick: () => void;
}

export function DeleteButton({ canDelete, isDeleting, onClick }: DeleteButtonProps) {
  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1.5 h-9 px-3 rounded-lg font-semibold text-xs transition-all duration-200 ${
          canDelete
            ? "bg-error/15 border border-error/30 text-error hover:bg-error/25 hover:border-error/40"
            : "bg-base-content/5 border border-base-content/10 text-base-content/30 cursor-not-allowed"
        }`}
        onClick={() => canDelete && onClick()}
        disabled={!canDelete || isDeleting}
        title={
          canDelete ? "Delete classification" : "Only drafts can be deleted"
        }
      >
        {isDeleting ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <TrashIcon className="w-3.5 h-3.5" />
        )}
      </button>
      {!canDelete && !isDeleting && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-base-content text-base-100 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          Only drafts can be deleted
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-base-content" />
        </div>
      )}
    </div>
  );
}

