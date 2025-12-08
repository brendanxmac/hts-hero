"use client";

import { ArrowLeftIcon } from "@heroicons/react/16/solid";

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = "Back" }: BackButtonProps) {
  return (
    <button
      className="group flex items-center gap-2 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
      onClick={onClick}
    >
      <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      {label}
    </button>
  );
}

