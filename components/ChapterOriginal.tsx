import { useState } from "react";
import { HtsElement, HtsSectionAndChapterBase } from "../interfaces/hts";
import { Cell } from "./Cell";
import { ChapterSummary } from "./ChapterOriginalSummary";
import { ChapterDetails } from "./ChapterDetails";

export interface ChapterI extends HtsSectionAndChapterBase {
  elements: HtsElement[];
  headings: HtsElement[];
}

interface Props {
  chapter: ChapterI;
}

export const Chapter = ({ chapter }: Props) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Cell>
      <ChapterSummary
        chapter={chapter}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
      />
      {showDetails && <ChapterDetails chapter={chapter} />}
    </Cell>
  );
};
