import { useEffect, useState } from "react";
import { useHtsContext } from "../context/hts-context";
import { HorizontalAlignment } from "../enums/style";
import {
  getBestMatchAtClassificationLevel,
  getFullClassificationDescription,
  getHSChapter,
  getHtsChapterData,
  getNextChunk,
  isFullHTSCode,
  updateHtsDescription,
} from "../libs/hts";
import { PrimaryInformation } from "./PrimaryInformation";
import { SecondaryInformation } from "./SecondaryInformation";
import { HtsLevelSelection, HtsWithParentReference } from "../interfaces/hts";
import { LabelledLoader } from "./LabelledLoader";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";

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
  const [selectionProgression, setSelectionProgression] = useState<
    HtsLevelSelection[]
  >([]);

  useEffect(() => {
    async function findBestProductionDescriptionMatchAtLevel() {
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
      const nextSelectionProgression: HtsLevelSelection = {
        element: bestMatchElement,
        reasoning: bestMatchResponse.logic,
      };
      setSelectionProgression([
        ...selectionProgression,
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

      // Set next HTS Elements Chunk
      setHtsElementsChunk(setIndexInArray(nextChunk));
    }

    if (!htsElementsChunk.length) {
      // Ensure that we actually have elements to work with
      // This accounts for the base case where htsElements chunk it initially set
      return;
    }

    if (!isFullHTSCode(htsCode)) {
      // findBestProductionDescriptionMatchAtLevel();
    } else {
      console.log(`*** Successfully Fetched Full HTS Code ***`);
      // TODO: Get the full China -> US tariff
      for (let i = selectionProgression.length - 1; i > 0; i--) {
        if (selectionProgression[i].element.general) {
          const { htsno, general, footnotes } = selectionProgression[i].element;
          setHtsCode(htsno);

          if (footnotes.length) {
            setTarrif(`${general} + ${footnotes[0].value}`);
          } else {
            setTarrif(general);
          }
        }
      }

      setDescription(getFullClassificationDescription(selectionProgression));
      setLoading(false);
    }
  }, [htsElementsChunk]);

  useEffect(() => {
    async function getFullHtsCode() {
      setLoading(true);
      const hsChapter = await getHSChapter(productDescription);
      const chapterData = await getHtsChapterData(hsChapter);
      setHtsElementsChunk(setIndexInArray(chapterData));
      setLoading(false);
    }
    // getFullHtsCode();
  }, [productDescription]);

  // useEffect(() => {
  //   console.log("Classification Progression Updated:");
  //   console.log(classificationProgression);
  // }, [classificationProgression]);

  if (loading && !htsCode) {
    return <LabelledLoader text="" />;
  } else {
    return (
      <div className="w-full max-w-4xl grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="mt-8 col-span-2 gap-2 flex">
          <h1 className="text-6xl text-">{htsCode}</h1>
          {loading && <LabelledLoader text="" />}
        </div>
        <div className="grow bg-neutral-900 rounded-md p-4">
          <PrimaryInformation label="HTS Code" heading={htsCode || ""} />
        </div>

        <div className="grow bg-neutral-900 rounded-md p-4">
          <PrimaryInformation
            label="Tariff"
            heading={tariff || ""}
            textAlign={HorizontalAlignment.LEFT}
          />
        </div>

        <SecondaryInformation
          label="Selection Logic"
          heading={description || ""}
        />
      </div>
    );
  }
};
