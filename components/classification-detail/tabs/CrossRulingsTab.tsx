"use client";

import { trimHtsTo8Digits } from "../../../libs/cross-rulings";
import { CrossRulingsPanel } from "../../cross-rulings/CrossRulingsPanel";
import { IncompleteView } from "../../cross-rulings/IncompleteView";

interface Props {
  latestHtsCode: string | null;
  isComplete: boolean;
  /** Evidence can be added and edited */
  canEdit: boolean;
}

// A finished classification's CROSS Ruling Validation tab: search CROSS for its code on CBP's site,
// look up the rulings that fit, and keep them as the classification's evidence
export const CrossRulingsTab = ({ latestHtsCode, isComplete, canEdit }: Props) => {
  if (!isComplete) return <IncompleteView />;

  const term =
    latestHtsCode && latestHtsCode.replace(/\D/g, "").length >= 4 ? trimHtsTo8Digits(latestHtsCode) : null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">CROSS Ruling Validation</h1>
        <p className="text-sm text-base-content/50 mt-1">
          Find CBP rulings for similar products on CROSS, then save the ones that back this classification as evidence.
        </p>
      </div>
      <CrossRulingsPanel
        searchTerms={term ? [term] : []}
        defaultSearchText=""
        surface="classification"
        canEdit={canEdit}
      />
    </div>
  );
};
