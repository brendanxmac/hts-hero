import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useHtsContext } from "../context/hts-context";
import {
  getBestMatchAtClassificationLevel,
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

interface Props {
  setScrollableUpdates: Dispatch<SetStateAction<number>>;
}

export const SearchResults = ({ setScrollableUpdates }: Props) => {
  const { productDescription } = useHtsContext(); // TODO: do you need to use context...
  const [loading, setLoading] = useState(true);
  const [htsCode, setHtsCode] = useState("");
  const [tariff, setTarrif] = useState("");
  const [htsDescription, setHtsDescription] = useState("");
  const [htsElementsChunk, setHtsElementsChunk] = useState<
    HtsWithParentReference[]
  >([]);
  const [classificationLevel, setClassificationLevel] = useState(0);
  const [decisionProgression, setDecisionProgression] = useState<
    HtsLevelDecision[]
  >([]);

  useEffect(() => {
    const update = classificationLevel + 1;
    setScrollableUpdates(update);
  }, [loading, htsCode, tariff]);

  const resetResults = () => {
    setHtsCode("");
    setTarrif("");
    setHtsDescription("");
    setHtsElementsChunk([]);
    setClassificationLevel(0);
    setDecisionProgression([]);
    setScrollableUpdates(0);
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

      console.log(`Best Match Desc: ${bestMatchElement.description}`);
      console.log(`Best Match: ${bestMatchElement.htsno}`);

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

      if (nextChunk.length < 3) {
        console.log(nextChunk);
      }
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

    async function getFullHtsCode() {
      setLoading(true);
      const hsChapter = await getHSChapter(productDescription);
      const chapterData = await getHtsChapterData(hsChapter);
      setHtsElementsChunk(setIndexInArray(chapterData));
    }
  }, [productDescription]);

  if (loading && !htsCode && classificationLevel === 0) {
    return <LabelledLoader text="" />;
  } else {
    return (
      <div className="w-full max-w-3xl grid grid-cols-2 gap-5 mt-3">
        {decisionProgression ? (
          <div className="w-full max-w-3xl col-span-full">
            <SectionLabel value="Decisions" />
            <div className="my-3 col-span-full grid gap-2">
              {decisionProgression.map((decision, i) => {
                return <Decision key={i} {...decision} />;
              })}
            </div>
          </div>
        ) : undefined}

        {loading && htsElementsChunk.length > 0 ? (
          <div className="min-w-full max-w-3xl col-span-full justify-items-center">
            <LabelledLoader text="" />
          </div>
        ) : undefined}

        {!loading && (
          <div className="col-span-full grid grid-cols-2 gap-3 mb-10">
            <div className="col-span-full">
              <SectionLabel value="Classification" />
            </div>

            <Cell>
              <PrimaryInformation label="HTS Code" value={htsCode || ""} />
            </Cell>
            <Cell>
              <PrimaryInformation label="Tariff" value={tariff || ""} />
            </Cell>
          </div>
        )}
      </div>
    );
  }
};
