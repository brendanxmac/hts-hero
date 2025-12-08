"use client";

import { TrashIcon } from "@heroicons/react/16/solid";

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative overflow-hidden bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-base-content/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-error/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-error/20 border border-error/30 mb-4">
            <TrashIcon className="h-6 w-6 text-error" />
          </div>

          <h3 className="text-xl font-bold text-base-content mb-2">
            Delete Classification
          </h3>
          <p className="text-base-content/70 mb-6 leading-relaxed">
            Are you sure you want to delete this classification? This action
            cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-xl font-semibold text-sm text-base-content/80 hover:text-base-content hover:bg-base-content/10 transition-all duration-200"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-xl font-semibold text-sm bg-error text-error-content hover:bg-error/90 hover:shadow-lg hover:shadow-error/30 transition-all duration-200"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

