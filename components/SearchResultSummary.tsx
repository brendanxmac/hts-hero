import { useEffect, useState } from "react";
import { useHtsContext } from "../context/hts-context";
import {
  getBestMatchAtClassificationLevel,
  getFullClassificationDescription,
  getHSChapter,
  getHtsChapterData,
  getHtsLevel,
  getNextChunk,
  getTarrif,
  updateHtsDescription,
} from "../libs/hts";
import { PrimaryInformation } from "./PrimaryInformation";
import { HtsLevelDecision, HtsWithParentReference } from "../interfaces/hts";
import { LabelledLoader } from "./LabelledLoader";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { Cell } from "./Cell";
import { Decision } from "./Decision";
import { SectionLabel } from "./SectionLabel";
import { SelectionCandidate } from "./SelectionCandidate";

export const SearchResults = () => {
  const { productDescription } = useHtsContext(); // TODO: do you need to use context...
  const [loading, setLoading] = useState(false);
  const [htsCode, setHtsCode] = useState("");
  const [tariff, setTarrif] = useState("");
  const [description, setDescription] = useState("");
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
    setTarrif("");
    setDescription("");
    setHtsDescription("");
    setHtsElementsChunk([]);
    setClassificationLevel(0);
    setDecisionProgression([]);
  };

  useEffect(() => {
    async function findBestClassifierAtLevel() {
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
      setHtsDescription(
        updateHtsDescription(htsDescription, bestMatchResponse)
      );
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
      setDecisionProgression([
        ...decisionProgression,
        nextSelectionProgression,
      ]);
      setHtsCode(bestMatchElement.htsno);
      setClassificationLevel(classificationLevel + 1);

      // Get Next HTS Elements Chunk
      const nextChunkStartIndex = bestMatchElement.indexInParentArray + 1;
      const nextChunk = getNextChunk(
        htsElementsChunk,
        nextChunkStartIndex,
        classificationLevel
      );

      console.log(`Next Chunk Size: ${nextChunk.length}`);

      // Set next HTS Elements Chunk
      setHtsElementsChunk(setIndexInArray(nextChunk));
    }

    const anotherClassificationLevelExists = htsElementsChunk.length > 0;
    const isFirstClassificationLevel = classificationLevel === 0;

    if (!anotherClassificationLevelExists) {
      if (isFirstClassificationLevel) {
        return; // Handle base case where no chunk exists
      } else {
        // Classification has completed
        console.log(
          `*** Level: ${classificationLevel - 1} -- Code: ${htsCode} ***`
        );

        setTarrif(getTarrif(decisionProgression)); // TODO: Need full China -> US tariff
        setDescription(getFullClassificationDescription(decisionProgression));
        setLoading(false);
      }
    }

    if (anotherClassificationLevelExists) {
      findBestClassifierAtLevel();
      setDescription(getFullClassificationDescription(decisionProgression));
    }
  }, [htsElementsChunk]);

  useEffect(() => {
    resetResults();
    getFullHtsCode();

    async function getFullHtsCode() {
      setLoading(true);
      const hsChapter = await getHSChapter(productDescription);
      const chapterData = await getHtsChapterData(hsChapter);
      setHtsElementsChunk(setIndexInArray(chapterData));
    }
  }, [productDescription]);

  if (loading && !htsCode) {
    return <LabelledLoader text="" />;
  } else {
    return (
      <div className="w-full max-w-4xl grid grid-cols-2 gap-2">
        <Cell>
          <PrimaryInformation label="HTS Code" value={htsCode || ""} />
        </Cell>
        <Cell>
          <PrimaryInformation label="Tariff" value={tariff || ""} />
        </Cell>

        {decisionProgression ? (
          <div className="w-full max-w-4xl col-span-full">
            <SectionLabel value="Decisions" />
            <div className="my-3 col-span-full grid gap-3">
              {decisionProgression.map((decision, i) => {
                return <Decision key={i} {...decision} />;
              })}
            </div>
          </div>
        ) : undefined}
      </div>
    );
  }
};
