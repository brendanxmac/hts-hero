import { useState } from "react";
import { ClassificationProgression } from "../interfaces/hts";
import { DecisionSummary } from "./DecisionSummary";
import { DecisionDetails } from "./DecisionDetails";
import { Cell } from "./Cell";
import { getCodeFromHtsPrimitive } from "../libs/hts";

export const Decision = (decision: ClassificationProgression) => {
  const { selection } = decision;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Cell>
      <DecisionSummary
        code={getCodeFromHtsPrimitive(selection)}
        description={selection.description}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
      />
      {showDetails && <DecisionDetails decision={decision} />}
    </Cell>
  );
};
