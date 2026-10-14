"use client";

import { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

// The calculator's quiet next step: cobalt text with an arrow that nudges on hover ("Explain this",
// "See which ones apply", "Get alerted when it changes"). A button, since each opens a pitch.
export const ArrowLink = ({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
  >
    {children}
    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
  </button>
);
