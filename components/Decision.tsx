import { useState } from "react";
import { HtsLevelDecision } from "../interfaces/hts";
import { DecisionSummary } from "./DecisionSummary";
import { DecisionDetail } from "./DecisionDetails";

export const Decision = (decision: HtsLevelDecision) => {
  const { level, selection } = decision;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {showDetails ? (
        <DecisionDetail decision={decision} showDetails={setShowDetails} />
      ) : (
        <DecisionSummary
          level={level}
          code={selection.htsno}
          description={selection.description}
          showDetails={setShowDetails}
        />
      )}
    </>
  );
};
