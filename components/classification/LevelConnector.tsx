"use client";

import { ChevronDownIcon } from "@heroicons/react/16/solid";

export interface LevelConnectorProps {
  isActive: boolean;
  hasPreviousSelection: boolean;
}

export function LevelConnector({
  isActive,
  hasPreviousSelection,
}: LevelConnectorProps) {
  const isHighlighted = hasPreviousSelection && isActive;

  const lineGradientClass = isHighlighted
    ? "bg-gradient-to-b from-success/40 to-primary/40"
    : "bg-gradient-to-b from-base-content/20 to-base-content/10";

  const circleClass = isHighlighted
    ? "bg-primary/20 border border-primary/30 animate-pulse"
    : "bg-base-200 border border-base-content/10";

  const bottomLineClass = isHighlighted
    ? "bg-gradient-to-b from-primary/40 to-transparent"
    : "bg-gradient-to-b from-base-content/10 to-transparent";

  return (
    <div className="flex flex-col items-center py-4">
      <div className={`w-px h-4 ${lineGradientClass}`} />
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm ${circleClass}`}
      >
        <ChevronDownIcon
          className={`w-4 h-4 ${isHighlighted ? "text-primary" : "text-base-content/40"}`}
        />
      </div>
      <div className={`w-px h-4 ${bottomLineClass}`} />
    </div>
  );
}
