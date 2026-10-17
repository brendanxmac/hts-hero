"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useCanSeeWhy } from "./WhyGate";

// The plain-English summary of a duty takes a free account (the "why" is the product's edge). It
// lives in the Overview tab and the Explain drawer (../overview); this is the drawer's button.

// "Summarize": the button that shows and hides it, in the results' header beside the main action.
// Nothing for anyone who can't see the explanation (signed out, the header's own "Summarize"
// opens the pitch).
export const ExplainToggle = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => {
  const { canSee, loading } = useCanSeeWhy();
  if (loading || !canSee) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={open}
      className={`${ui.button({ variant: open ? "primary" : "secondary", size: "sm" })} shrink-0`}
    >
      <SparklesIcon className="h-4 w-4" aria-hidden />
      Summarize
    </button>
  );
};
