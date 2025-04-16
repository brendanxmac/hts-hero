"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getBestClassificationProgression,
  getHtsChapterData,
  getHtsLevel,
  getHtsSectionsAndChapters,
  getElementsWithinIndentLevelFromStartPoint,
  evaluateBestHeadings,
  updateHtsDescription,
  getBestDescriptionCandidates,
  logSearch,
} from "../libs/hts";
import {
  HtsLevelClassification,
  HtsSection,
  HtsElementWithParentReference,
  CandidateSelection,
  HtsElement,
} from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { DecisionProgression } from "./DecisionProgression";
import { Loader } from "../interfaces/ui";

interface Props {
  productDescription: string;
  setUpdateScrollHeight: Dispatch<SetStateAction<number>>;
}

export const ClassificationResults = ({
  productDescription,
  setUpdateScrollHeight,
}: Props) => {
  const [resetSearch, setResetSearch] = useState(false);
  const [sectionCandidates, setSectionCandidates] =
    useState<CandidateSelection[]>();
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [headingCandidates, setHeadingCandidates] = useState<HtsElement[]>([]);

  const [loading, setLoading] = useState<Loader>({ isLoading: true, text: "" });
  const [htsDescription, setHtsDescription] = useState("");
  const [htsElementsChunk, setHtsElementsChunk] = useState<
    HtsElementWithParentReference[]
  >([]);
  const [classificationIndentLevel, setClassificationIndentLevel] = useState(0);
  const [classificationProgression, setClassificationProgression] = useState<
    HtsLevelClassification[]
  >([]);
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);

  const startNewSearch = () => {
    setSectionCandidates([]);
    setChapterCandidates([]);
    setHeadingCandidates([]);
    setClassificationProgression([]);
    setHtsDescription("");
    setHtsElementsChunk([]);
    setClassificationIndentLevel(0);
    setUpdateScrollHeight(0);
    setResetSearch(true);
  };

  const findBestClassifierAtLevel = async () => {
    const elementsAtLevel = elementsAtClassificationLevel(
      htsElementsChunk,
      classificationIndentLevel
    );

    setLoading({
      isLoading: true,
      text: `Finding Best ${getHtsLevel(elementsAtLevel[0].htsno)}`,
    });
    const simplifiedElementsAtLevel = elementsAtLevel.map((e) => ({
      code: e.htsno,
      description: e.description,
    }));

    const bestProgressionResponse = await getBestClassificationProgression(
      simplifiedElementsAtLevel,
      htsDescription,
      productDescription
    );

    console.log("Best Progression Response:", bestProgressionResponse);
    console.log("Elements At Level:", elementsAtLevel);

    const bestMatchElement = elementsAtLevel[bestProgressionResponse.index];

    console.log("Best Match Element:", bestMatchElement);

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
        reasoning: bestProgressionResponse.logic,
      },
    ]);

    // Get Next HTS Elements Chunk
    const nextChunkStartIndex = bestMatchElement.indexInParentArray + 1;
    const nextChunk = getElementsWithinIndentLevelFromStartPoint(
      htsElementsChunk,
      nextChunkStartIndex,
      classificationIndentLevel
    );
    setClassificationIndentLevel(classificationIndentLevel + 1);
    setHtsElementsChunk(setIndexInArray(nextChunk));
  };

  // Get 2-3 Best Sections
  const getSections = async () => {
    setLoading({ isLoading: true, text: "Finding Best Sections" });
    const sectionsResponse = await getHtsSectionsAndChapters();
    setHtsSections(sectionsResponse.sections);
    const sections = sectionsResponse.sections;
    const bestSectionCandidates = await getBestDescriptionCandidates(
      [],
      productDescription,
      true,
      0,
      2,
      sections.map((s) => s.description)
    );

    const candidates: CandidateSelection[] =
      bestSectionCandidates.bestCandidates.map((sectionCandidate) => ({
        index: sections[sectionCandidate.index].number,
        description: sections[sectionCandidate.index].description,
        logic: sectionCandidate.logic,
      }));

    // console.log(
    //   "Fetching Top Level Section Notes for section:",
    //   candidates[0].index
    // );
    // const sectionNotes = await fetchTopLevelSectionNotes(candidates[0].index);
    // console.log("Section Notes:");
    // console.log(sectionNotes);

    // if (sectionNotes.length > 0) {
    //   console.log("Fetching Exclusionary Notes");
    //   const exclusionaryNotes = await determineExclusionarySectionNotes(
    //     sectionNotes,
    //     productDescription
    //   );
    //   console.log("Exclusionary Notes:");
    //   console.log(exclusionaryNotes);
    // }

    setSectionCandidates(candidates);
  };

  // Get 2-3 Best Chapters
  const getChapters = async () => {
    setLoading({ isLoading: true, text: "Finding Best Chapters" });
    const candidateSections = htsSections.filter((section) => {
      return sectionCandidates.some((candidate) => {
        return candidate.index === section.number;
      });
    });

    let candidatesForChapter: CandidateSelection[] = [];

    await Promise.all(
      candidateSections.map(async (section) => {
        const bestChapterCandidates = await getBestDescriptionCandidates(
          [],
          productDescription,
          true,
          0,
          2,
          section.chapters.map((c) => c.description)
        );

        const candidates: CandidateSelection[] =
          bestChapterCandidates.bestCandidates.map((chapterCandidate) => ({
            index: section.chapters[chapterCandidate.index].number,
            description: section.chapters[chapterCandidate.index].description,
            logic: chapterCandidate.logic,
          }));

        candidatesForChapter.push(...candidates);
      })
    );

    setChapterCandidates(candidatesForChapter);
  };

  // Get up to 2 Best Headings Per Chapter
  const getHeadings = async () => {
    setLoading({ isLoading: true, text: "Finding Best Headings" });
    const candidatesForHeading: HtsElement[] = [];
    await Promise.all(
      chapterCandidates.map(async (chapter) => {
        const chapterData = await getHtsChapterData(String(chapter.index));
        const chapterDataWithParentIndex = setIndexInArray(chapterData);
        const elementsAtLevel = elementsAtClassificationLevel(
          chapterDataWithParentIndex,
          0
        );
        const bestCandidateHeadings = await getBestDescriptionCandidates(
          elementsAtLevel,
          productDescription,
          false,
          0,
          2,
          elementsAtLevel.map((e) => e.description)
        );

        // Handle Empty Case
        if (bestCandidateHeadings.bestCandidates.length === 0) {
          return;
        }

        // Handle Negative Index Case (sometimes chatGPT will do this)
        if (bestCandidateHeadings.bestCandidates[0].index < 0) {
          return;
        }

        const candidates = bestCandidateHeadings.bestCandidates.map(
          (candidate) => {
            return elementsAtLevel[candidate.index];
          }
        );

        // const candidates = bestCandidateHeadings.bestCandidates.map(
        //   (candidate) => ({
        //     heading: elementsAtLevel[candidate.index].htsno,
        //     description: elementsAtLevel[candidate.index].description,
        //     logic: candidate.logic,
        //   })
        // );

        candidatesForHeading.push(...candidates);
      })
    );

    setHeadingCandidates(candidatesForHeading);
    // DO not move this down, it will break the classification as the timing is critical
    setClassificationIndentLevel(classificationIndentLevel + 1);
  };

  const getBestHeading = async () => {
    setLoading({ isLoading: true, text: "Picking Best Heading" });
    const headingsEvaluation = await evaluateBestHeadings(
      headingCandidates.map((h) => ({
        code: h.htsno,
        description: h.description,
      })),
      productDescription
    );

    // Get the chapter and chapter data of the chapter the selected heading belongs to
    if (!headingsEvaluation.code) {
      throw new Error("No code found in headings evaluation");
    }

    const headingDescription = headingCandidates.find(
      (c) => c.htsno === headingsEvaluation.code
    )?.description;

    if (!headingDescription) {
      throw new Error("No heading description found");
    }

    const chapterData = await getHtsChapterData(
      headingsEvaluation.code.substring(0, 2)
    );
    const chapterDataWithParentIndex = setIndexInArray(chapterData);
    const elementsAtLevel = elementsAtClassificationLevel(
      chapterDataWithParentIndex,
      0
    );

    const selectedHeading = elementsAtLevel.find(
      (e) => e.htsno === headingsEvaluation.code
    );

    if (!selectedHeading) {
      throw new Error("No selected heading found");
    }

    // Get Next HTS Elements Chunk
    const nextChunkStartIndex = selectedHeading.indexInParentArray + 1;
    const nextChunk = getElementsWithinIndentLevelFromStartPoint(
      chapterDataWithParentIndex,
      nextChunkStartIndex,
      0 // find the next 0th indented level element to determine endIndex for next chunk
    );

    setHtsDescription(updateHtsDescription(htsDescription, headingDescription));
    setHtsElementsChunk(setIndexInArray(nextChunk));
    setClassificationProgression([
      ...classificationProgression,
      {
        level: getHtsLevel(selectedHeading.htsno),
        candidates: headingCandidates,
        selection: selectedHeading,
        reasoning: headingsEvaluation.evaluation,
      },
    ]);
  };

  useEffect(() => {
    if (sectionCandidates && sectionCandidates.length > 0) {
      getChapters();
    }
  }, [sectionCandidates]);

  useEffect(() => {
    if (chapterCandidates && chapterCandidates.length > 0) {
      getHeadings();
    }
  }, [chapterCandidates]);

  useEffect(() => {
    if (headingCandidates && headingCandidates.length > 0) {
      getBestHeading();
    }
  }, [headingCandidates]);

  useEffect(() => {
    setUpdateScrollHeight(Math.random());
  }, [loading, classificationProgression]);

  useEffect(() => {
    const anotherClassificationLevelExists = htsElementsChunk.length > 0;
    const isFirstClassificationLevel = classificationIndentLevel === 0;

    if (!anotherClassificationLevelExists) {
      if (isFirstClassificationLevel) {
        return; // Handle base case where no chunk exists
      } else {
        // Classification has completed
        setLoading({ isLoading: false, text: "" });
      }
    }

    if (anotherClassificationLevelExists) {
      findBestClassifierAtLevel();
    }
  }, [htsElementsChunk]);

  useEffect(() => {
    // Don't let logs block the search, execute and forget
    logSearch(productDescription).catch((error) => {
      console.error("Error logging search:", error);
    });
    startNewSearch();
  }, [productDescription]);

  useEffect(() => {
    if (resetSearch) {
      setLoading({ isLoading: true, text: "Starting Classification" });
      getSections();
      setResetSearch(false);
    }
  }, [resetSearch]);

  if (loading && !classificationProgression.length) {
    return (
      <div className="mt-5">
        <LoadingIndicator text={loading.text} />
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
            <LoadingIndicator text={loading.text} />
          </div>
        ) : undefined}

        {/* {!loading && (
          <TariffSection
            classificationProgression={classificationProgression}
            setUpdateScrollHeight={setUpdateScrollHeight}
          />
        )} */}
      </div>
    );
  }
};
