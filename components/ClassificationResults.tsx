import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getBestMatchAtClassificationLevel,
  getHSChapter,
  getHtsChapterData,
  getHtsLevel,
  getNextChunk,
  updateHtsDescription,
} from "../libs/hts";
import { HtsLevelDecision, HtsWithParentReference } from "../interfaces/hts";
import { LabelledLoader } from "./LabelledLoader";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { TariffSection } from "./TariffSection";
import { DecisionProgression } from "./DecisionProgression";

interface Props {
  productDescription: string;
  setScrollableUpdates: Dispatch<SetStateAction<number>>;
}

export const ClassificationResults = ({
  productDescription,
  setScrollableUpdates,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [htsCode, setHtsCode] = useState("");
  const [htsDescription, setHtsDescription] = useState("");
  const [htsElementsChunk, setHtsElementsChunk] = useState<
    HtsWithParentReference[]
  >([]);
  const [classificationLevel, setClassificationLevel] = useState(0);
  const [decisionProgression, setDecisionProgression] = useState<
    HtsLevelDecision[]
  >([]);

  const resetResults = () => {
    setHtsCode("");
    setHtsDescription("");
    setHtsElementsChunk([]);
    setClassificationLevel(0);
    setDecisionProgression([]);
    setScrollableUpdates(0);
  };

  const findBestClassifierAtLevel = async () => {
    const elementsAtLevel = elementsAtClassificationLevel(
      htsElementsChunk,
      classificationLevel
    );

    const bestMatchResponse = await getBestMatchAtClassificationLevel(
      elementsAtLevel,
      classificationLevel,
      productDescription,
      htsDescription
    );
    setHtsDescription(updateHtsDescription(htsDescription, bestMatchResponse));
    const bestMatchElement = elementsAtLevel.find(
      (i) => i.description === bestMatchResponse.description
    );

    // Get & Set next selection progression
    const nextSelectionProgression: HtsLevelDecision = {
      level: getHtsLevel(bestMatchElement.htsno),
      candidates: elementsAtLevel,
      selection: bestMatchElement,
      reasoning: bestMatchResponse.logic,
    };
    setDecisionProgression([...decisionProgression, nextSelectionProgression]);

    if (bestMatchElement.htsno) {
      setHtsCode(bestMatchElement.htsno);
    }

    // Get Next HTS Elements Chunk
    const nextChunkStartIndex = bestMatchElement.indexInParentArray + 1;
    // TODO: see if there's a possible off by 1 error here.... ^^ \/
    const nextChunk = getNextChunk(
      htsElementsChunk,
      nextChunkStartIndex,
      classificationLevel
    );

    setClassificationLevel(classificationLevel + 1);

    console.log(`Next Chunk: ${nextChunk.length}`);

    // Set next HTS Elements Chunk
    setHtsElementsChunk(setIndexInArray(nextChunk));
  };

  const getFullHtsCode = async () => {
    setLoading(true);
    const hsChapter = await getHSChapter(productDescription);
    const chapterData = await getHtsChapterData(hsChapter);
    setHtsElementsChunk(setIndexInArray(chapterData));
  };

  useEffect(() => {
    const update = classificationLevel + 1;
    setScrollableUpdates(update);
  }, [loading, htsCode]);

  useEffect(() => {
    const anotherClassificationLevelExists = htsElementsChunk.length > 0;
    const isFirstClassificationLevel = classificationLevel === 0;

    if (!anotherClassificationLevelExists) {
      if (isFirstClassificationLevel) {
        return; // Handle base case where no chunk exists
      } else {
        // Classification has completed
        setLoading(false);
      }
    }

    if (anotherClassificationLevelExists) {
      findBestClassifierAtLevel();
    }
  }, [htsElementsChunk]);

  useEffect(() => {
    resetResults();
    getFullHtsCode();
  }, [productDescription]);

  if (loading && !htsCode && classificationLevel === 0) {
    return <LabelledLoader text="" />;
  } else {
    return (
      <div className="w-full max-w-3xl grid grid-cols-2 gap-5 mt-3">
        {decisionProgression.length && (
          <DecisionProgression decisionProgression={decisionProgression} />
        )}

        {loading && htsElementsChunk.length > 0 ? (
          <div className="min-w-full max-w-3xl col-span-full justify-items-center">
            <LabelledLoader text="" />
          </div>
        ) : undefined}

        {/* {!loading && (
          <ClassificationSection
            htsCode={
              decisionProgression[decisionProgression.length - 1].selection
                .htsno
            }
          />
        )} */}

        {!loading && (
          <TariffSection decisionProgression={decisionProgression} />
        )}
      </div>
    );
  }
};
