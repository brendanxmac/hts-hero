import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getBestMatchAtClassificationLevel,
  getHSChapter,
  getHtsChapterData,
  getHtsLevel,
  getNextChunk,
  updateHtsDescription,
} from "../libs/hts";
import {
  HtsLevelClassification,
  HtsWithParentReference,
} from "../interfaces/hts";
import { LoadingDots } from "./LabelledLoader";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { TariffSection } from "./Tariff";
import { DecisionProgression } from "./DecisionProgression";

interface Props {
  productDescription: string;
  setUpdateScrollHeight: Dispatch<SetStateAction<number>>;
}

export const ClassificationResults = ({
  productDescription,
  setUpdateScrollHeight,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [htsCode, setHtsCode] = useState("");
  const [htsDescription, setHtsDescription] = useState("");
  const [htsElementsChunk, setHtsElementsChunk] = useState<
    HtsWithParentReference[]
  >([]);
  const [classificationLevel, setClassificationLevel] = useState(0);
  const [classificationProgression, setClassificationProgression] = useState<
    HtsLevelClassification[]
  >([]);

  const resetResults = () => {
    setHtsCode("");
    setHtsDescription("");
    setHtsElementsChunk([]);
    setClassificationLevel(0);
    setClassificationProgression([]);
    setUpdateScrollHeight(0);
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

    console.log("bestMatchResponse:");
    console.log(bestMatchResponse);

    const bestMatchElement = elementsAtLevel[bestMatchResponse.index];

    setHtsDescription(
      updateHtsDescription(htsDescription, bestMatchElement.description)
    );

    // Get & Set next selection progression
    setClassificationProgression([
      ...classificationProgression,
      {
        level: getHtsLevel(bestMatchElement.htsno),
        candidates: elementsAtLevel,
        selection: bestMatchElement,
        reasoning: bestMatchResponse.logic,
      },
    ]);

    if (bestMatchElement.htsno) {
      setHtsCode(bestMatchElement.htsno);
    }

    // Get Next HTS Elements Chunk
    const nextChunkStartIndex = bestMatchElement.indexInParentArray + 1;
    const nextChunk = getNextChunk(
      htsElementsChunk,
      nextChunkStartIndex,
      classificationLevel
    );

    setClassificationLevel(classificationLevel + 1);
    setHtsElementsChunk(setIndexInArray(nextChunk));
  };

  const getFullHtsCode = async () => {
    setLoading(true);
    const hsChapter = await getHSChapter(productDescription);
    const chapterData = await getHtsChapterData(hsChapter);
    // setHtsElementsChunk(setIndexInArray(chapterData));
  };

  useEffect(() => {
    setUpdateScrollHeight(Math.random());
  }, [loading, classificationProgression]);

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
    return (
      <div className="mt-5">
        <LoadingDots />
      </div>
    );
  } else {
    return (
      <div className="w-full max-w-4xl grid grid-cols-2 gap-5 mt-3">
        {classificationProgression.length && (
          <DecisionProgression
            decisionProgression={classificationProgression}
          />
        )}

        {loading && htsElementsChunk.length > 0 ? (
          <div className="min-w-full max-w-4xl col-span-full justify-items-center">
            <LoadingDots />
          </div>
        ) : undefined}

        {!loading && (
          <TariffSection
            classificationProgression={classificationProgression}
            setUpdateScrollHeight={setUpdateScrollHeight}
          />
        )}
      </div>
    );
  }
};
