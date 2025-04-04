import { useState } from "react";
import { HtsSection } from "../interfaces/hts";
import { Cell } from "./Cell";
import { SectionSummary } from "./SectionSummary";
import { SectionDetails } from "./SectionDetails";

interface Props {
  section: HtsSection;
}

export const Section = ({ section }: Props) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Cell>
      <SectionSummary
        section={section}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
      />
      {showDetails && <SectionDetails section={section} />}
    </Cell>
  );
};
