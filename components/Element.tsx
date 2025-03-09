import { useState } from "react";
import { HtsElement } from "../interfaces/hts";
import { ElementDetails } from "./ElementDetails";
import { Cell } from "./Cell";
import { ElementSummary } from "./ElementSummary";

interface Props {
  element: HtsElement;
  chapterElements: HtsElement[];
}

export const Element = ({ element, chapterElements }: Props) => {
  const { htsno, description, children } = element;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Cell>
      <ElementSummary
        number={htsno}
        description={description}
        children={children}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
      />
      {showDetails && (
        <ElementDetails element={element} chapterElements={chapterElements} />
      )}
    </Cell>
  );
};
