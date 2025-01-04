import { useState } from "react";
import { HtsLevelClassification } from "../interfaces/hts";
import { DecisionSummary } from "./DecisionSummary";
import { DecisionDetails } from "./DecisionDetails";
import { Cell } from "./Cell";

export const Decision = (decision: HtsLevelClassification) => {
  const { level, selection } = decision;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Cell>
      <DecisionSummary
        level={level}
        code={selection.htsno}
        description={selection.description}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
      />
      {showDetails && (
        <DecisionDetails decision={decision} showDetails={setShowDetails} />
      )}
    </Cell>
  );
};
