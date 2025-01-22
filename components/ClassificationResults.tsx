"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getBestMatchAtClassificationLevel,
  getHtsChapterData,
  getHtsChapters,
  getHtsLevel,
  getHtsSections,
  getNextChunk,
  updateHtsDescription,
} from "../libs/hts";
import {
  HtsLevelClassification,
  HtsSectionOrChapter,
  HtsWithParentReference,
  MatchResponse,
} from "../interfaces/hts";
import { LoadingDots } from "./LabelledLoader";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { TariffSection } from "./Tariff";
import { DecisionProgression } from "./DecisionProgression";
import { HtsLevel } from "../enums/hts";

interface Props {
  productDescription: string;
  setUpdateScrollHeight: Dispatch<SetStateAction<number>>;
}

export const ClassificationResults = ({
  productDescription,
  setUpdateScrollHeight,
}: Props) => {
  const [resetSearch, setResetSearch] = useState(false);
  const [bestSectionMatch, setBestSectionMatch] = useState<
    MatchResponse | undefined
  >(undefined);
  const [selectedChapter, setSelectedChapter] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [htsDescription, setHtsDescription] = useState("");
  const [htsElementsChunk, setHtsElementsChunk] = useState<
    HtsWithParentReference[]
  >([]);
  const [classificationLevel, setClassificationLevel] = useState(0);
  const [classificationProgression, setClassificationProgression] = useState<
    HtsLevelClassification[]
  >([]);

  const startNewSearch = () => {
    setBestSectionMatch(undefined);
    setSelectedChapter(undefined);
    setClassificationProgression([]);
    setHtsDescription("");
    setHtsElementsChunk([]);
    setClassificationLevel(0);
    setUpdateScrollHeight(0);
    setResetSearch(true);
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
      // setHtsCode(bestMatchElement.htsno);
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

  const getSections = async () => {
    setLoading(true);
    // Get Sections (top 3) -- just pick best to start
    const sectionsResponse = await getHtsSections();
    const sections = sectionsResponse.sections;

    // Hit Chat GPT to get the best for the description
    const bestMatchSection = await getBestMatchAtClassificationLevel(
      [],
      0,
      productDescription,
      "",
      sections.map((s) => s.description)
    );

    setBestSectionMatch(bestMatchSection);

    setHtsDescription(
      updateHtsDescription(
        htsDescription,
        sections[bestMatchSection.index].description
      )
    );

    setClassificationProgression([
      ...classificationProgression,
      {
        level: HtsLevel.SECTION,
        candidates: sections,
        selection: sections[bestMatchSection.index],
        reasoning: bestMatchSection.logic,
      },
    ]);
  };

  const getChapters = async () => {
    // Get Chapters (top 3 from each ^^) -- just pick best from the bunch to start...
    const chaptersResponse: { sections: HtsSectionOrChapter[][] } =
      await getHtsChapters();
    const sectionsWithChapters = chaptersResponse.sections;
    const chaptersFromBestMatchSection =
      sectionsWithChapters[bestSectionMatch.index];

    // Hit Chat GPT to get the best for the description
    const bestMatchChapter = await getBestMatchAtClassificationLevel(
      [],
      0,
      productDescription,
      htsDescription,
      chaptersFromBestMatchSection.map((c) => c.description)
    );

    setSelectedChapter(
      String(
        chaptersResponse.sections[bestSectionMatch.index][
          bestMatchChapter.index
        ].number
      )
    );

    setClassificationProgression([
      ...classificationProgression,
      {
        level: HtsLevel.CHAPTER,
        candidates: chaptersFromBestMatchSection,
        selection: chaptersFromBestMatchSection[bestMatchChapter.index],
        reasoning: bestMatchChapter.logic,
      },
    ]);
  };
  const getChapterData = async () => {
    const chapterData = await getHtsChapterData(selectedChapter);
    setHtsElementsChunk(setIndexInArray(chapterData));
  };

  useEffect(() => {
    if (classificationProgression.length === 1) {
      getChapters();
    }
    if (classificationProgression.length === 2) {
      getChapterData();
    }
  }, [classificationProgression]);

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
    startNewSearch();
  }, [productDescription]);

  useEffect(() => {
    if (resetSearch) {
      getSections();
      setResetSearch(false);
    }
  }, [resetSearch]);

  if (loading && !classificationProgression.length) {
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
