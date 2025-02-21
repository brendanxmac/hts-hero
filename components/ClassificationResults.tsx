"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getBestClassificationProgression,
  getHtsChapterData,
  getHtsLevel,
  getHtsSectionsAndChapters,
  getNextChunk,
  evaluateBestHeadings,
  updateHtsDescription,
  fetchTopLevelSectionNotes,
  determineExclusionarySectionNotes,
  getBestDescriptionCandidates,
} from "../libs/hts";
import {
  HtsLevelClassification,
  HtsSection,
  HtsWithParentReference,
  CandidateSelection,
  HeadingSelection,
} from "../interfaces/hts";
import { LoadingIndicator } from "./LabelledLoader";
import {
  elementsAtClassificationLevel,
  setIndexInArray,
} from "../utilities/data";
import { TariffSection } from "./Tariff";
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
  const [headingCandidates, setHeadingCandidates] = useState<
    HeadingSelection[]
  >([]);

  const [loading, setLoading] = useState<Loader>({ isLoading: true, text: "" });
  const [htsDescription, setHtsDescription] = useState("");
  const [htsElementsChunk, setHtsElementsChunk] = useState<
    HtsWithParentReference[]
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
    console.log("htsElementsChunk:", htsElementsChunk[0]);
    console.log("classificationIndentLevel:", classificationIndentLevel);
    const elementsAtLevel = elementsAtClassificationLevel(
      htsElementsChunk,
      classificationIndentLevel
    );
    console.log("elementsAtLevel:", elementsAtLevel[0]);
    console.log("elementsAtLevel length:", elementsAtLevel.length);
    setLoading({
      isLoading: true,
      text: `Finding Best ${getHtsLevel(elementsAtLevel[0].htsno)}`,
    });
    const simplifiedElementsAtLevel = elementsAtLevel.map((e) => ({
      code: e.htsno,
      description: e.description,
    }));
    console.log("simplifiedElementsAtLevel:", simplifiedElementsAtLevel[0]);
    console.log(
      "simplifiedElementsAtLevel length:",
      simplifiedElementsAtLevel.length
    );
    const bestProgressionResponse = await getBestClassificationProgression(
      simplifiedElementsAtLevel,
      productDescription,
      htsDescription
    );
    // FIXME: DIRECT string matching could cause some issues if the LLM returns a bad code....
    const bestMatchElement = elementsAtLevel.find(
      (e) => e.htsno === bestProgressionResponse.code
    );
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
    if (bestMatchElement.htsno) {
      // setHtsCode(bestMatchElement.htsno);
    }
    // Get Next HTS Elements Chunk
    const nextChunkStartIndex = bestMatchElement.indexInParentArray + 1;
    const nextChunk = getNextChunk(
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
    console.log("Getting Best Sections");
    const sectionsResponse = await getHtsSectionsAndChapters();
    setHtsSections(sectionsResponse.sections);
    const sections = sectionsResponse.sections;
    const bestSectionCandidates = await getBestDescriptionCandidates(
      [],
      productDescription,
      true,
      null, // todo: consider updating before shipping
      2,
      sections.map((s) => s.description)
    );

    console.log("Best Section Candidates:");
    console.log(
      bestSectionCandidates.bestCandidates.map((c) => sections[c.index])
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
    console.log("Getting Best Chapters");
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
          false,
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
    console.log("Getting Best Headings");
    setLoading({ isLoading: true, text: "Finding Best Headings" });
    const candidatesForHeading: HeadingSelection[] = [];
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

        console.log(`Best Heading Candidates for Chapter ${chapter.index}:`);
        console.log(bestCandidateHeadings);

        // Handle Empty Case
        if (bestCandidateHeadings.bestCandidates.length === 0) {
          return;
        }

        // Handle Negative Index Case (sometimes chatGPT will do this)
        if (bestCandidateHeadings.bestCandidates[0].index < 0) {
          return;
        }

        const candidates = bestCandidateHeadings.bestCandidates.map(
          (candidate) => ({
            heading: elementsAtLevel[candidate.index].htsno,
            description: elementsAtLevel[candidate.index].description,
            logic: candidate.logic,
          })
        );

        candidatesForHeading.push(...candidates);
      })
    );

    setHeadingCandidates(candidatesForHeading);
    setClassificationIndentLevel(classificationIndentLevel + 1);
  };

  const getBestHeading = async () => {
    console.log("Getting Best OVERALL Headings");
    setLoading({ isLoading: true, text: "Picking Best Heading" });
    console.log(headingCandidates);

    const headingsEvaluation = await evaluateBestHeadings(
      headingCandidates.map((h) => ({
        code: h.heading,
        description: h.description,
      })),
      productDescription
    );

    console.log("Headings Evaluation:");
    console.log(headingsEvaluation);

    // ================================
    // TODO: Need to kick off the rest of the classification here
    // ================================
    // Get the chapter and chapter data of the chapter the selected heading belongs to
    if (!headingsEvaluation.code) {
      throw new Error("No code found in headings evaluation");
    }

    console.log("Code:", headingsEvaluation.code);
    const headingDescription = headingCandidates.find(
      (c) => c.heading === headingsEvaluation.code
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

    setHtsDescription(updateHtsDescription(htsDescription, headingDescription));
    setHtsElementsChunk(setIndexInArray(chapterData));
    setClassificationProgression([
      ...classificationProgression,
      {
        level: getHtsLevel(selectedHeading.htsno),
        candidates: elementsAtLevel,
        selection: selectedHeading,
        reasoning: headingsEvaluation.evaluation,
      },
    ]);
  };

  const getChapterData = async (chapter: string) => {
    if (Number(chapter) > 99 || Number(chapter) < 1) {
      throw new Error(`Chapter ${chapter} is greater than 99 or less than 1`);
    }
    const chapterData = await getHtsChapterData(chapter);
    setHtsElementsChunk(setIndexInArray(chapterData));
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

  // useEffect(() => {
  // if (classificationProgression.length === 1) {
  //   getChapters();
  // }
  // if (classificationProgression.length === 2) {
  //   getChapterData();
  // }
  // }, [classificationProgression]);

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
