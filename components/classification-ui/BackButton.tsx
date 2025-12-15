"use client";

import { ArrowLeftIcon } from "@heroicons/react/16/solid";

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  isSaving?: boolean;
  disabled?: boolean;
}

export function BackButton({
  onClick,
  label = "Back",
  isSaving = false,
  disabled = false,
}: BackButtonProps) {
  const isDisabled = disabled || isSaving;

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-base-content/50">
        <span className="loading loading-spinner loading-xs"></span>
        <span>Saving...</span>
      </div>
    );
  }

  return (
    <button
      className={`group flex items-center gap-2 text-sm font-medium transition-colors ${
        isDisabled
          ? "text-base-content/40 cursor-not-allowed"
          : "text-base-content/70 hover:text-base-content"
      }`}
      onClick={onClick}
      disabled={isDisabled}
    >
      <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </button>
  );
}

