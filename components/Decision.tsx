import { useState } from "react";
import { HtsLevelDecision } from "../interfaces/hts";
import { DecisionSummary } from "./DecisionSummary";
import { DecisionDetails } from "./DecisionDetails";

export const Decision = (decision: HtsLevelDecision) => {
  const { level, selection } = decision;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {showDetails ? (
        <DecisionDetails decision={decision} showDetails={setShowDetails} />
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
