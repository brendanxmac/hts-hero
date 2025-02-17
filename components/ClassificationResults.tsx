"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getBestDescriptionCandidates,
  getHtsChapterData,
  getHtsLevel,
  getHtsSectionsAndChapters,
  getNextChunk,
  rankBestHtsHeadings,
  updateHtsDescription,
} from "../libs/hts";
import {
  HtsLevelClassification,
  HtsSection,
  HtsWithParentReference,
  CandidateSelection,
  HeadingSelection,
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
  const [resetSearch, setResetSearch] = useState(false);
  const [sectionCandidates, setSectionCandidates] =
    useState<CandidateSelection[]>();
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [headingCandidates, setHeadingCandidates] = useState<
    HeadingSelection[]
  >([]);

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
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);

  const startNewSearch = () => {
    setSectionCandidates([]);
    setChapterCandidates([]);
    setHeadingCandidates([]);
    setSelectedChapter(undefined);
    setClassificationProgression([]);
    setHtsDescription("");
    setHtsElementsChunk([]);
    setClassificationLevel(0);
    setUpdateScrollHeight(0);
    setResetSearch(true);
  };

  const findBestClassifierAtLevel = async () => {
    // const elementsAtLevel = elementsAtClassificationLevel(
    //   htsElementsChunk,
    //   classificationLevel
    // );
    // const bestMatchResponse = await getBestCandidatesAtClassificationLevel(
    //   elementsAtLevel,
    //   classificationLevel,
    //   productDescription,
    //   htsDescription
    // );
    // const bestMatchElement = elementsAtLevel[bestMatchResponse.index];
    // setHtsDescription(
    //   updateHtsDescription(htsDescription, bestMatchElement.description)
    // );
    // Get & Set next selection progression
    // setClassificationProgression([
    //   ...classificationProgression,
    //   {
    //     level: getHtsLevel(bestMatchElement.htsno),
    //     candidates: elementsAtLevel,
    //     selection: bestMatchElement,
    //     reasoning: bestMatchResponse.logic,
    //   },
    // ]);
    // if (bestMatchElement.htsno) {
    //   // setHtsCode(bestMatchElement.htsno);
    // }
    // Get Next HTS Elements Chunk
    // const nextChunkStartIndex = bestMatchElement.indexInParentArray + 1;
    // const nextChunk = getNextChunk(
    //   htsElementsChunk,
    //   nextChunkStartIndex,
    //   classificationLevel
    // );
    // setClassificationLevel(classificationLevel + 1);
    // setHtsElementsChunk(setIndexInArray(nextChunk));
  };

  // Examples:
  // 2 Liter Ceramic Pot that is conduction capable

  // Get 2-3 Best Sections
  const getSections = async () => {
    console.log("Getting Best Sections");
    const sectionsResponse = await getHtsSectionsAndChapters();
    setHtsSections(sectionsResponse.sections);
    const sections = sectionsResponse.sections;
    const bestSectionCandidates = await getBestDescriptionCandidates(
      [],
      productDescription,
      true,
      2,
      3,
      sections.map((s) => s.description)
    );

    console.log("Best Section Candidates:");
    console.log(bestSectionCandidates);

    const candidates: CandidateSelection[] =
      bestSectionCandidates.bestCandidates.map((sectionCandidate) => ({
        index: sections[sectionCandidate.index].number,
        description: sections[sectionCandidate.index].description,
        logic: sectionCandidate.logic,
      }));

    setSectionCandidates(candidates);

    // TODO: Maybe should set progression here and add a condition below to ONLY kick
    // off the subheading and beyond classification if the level is === heading
    // setClassificationProgression([
    //   ...classificationProgression,
    //   {
    //     level: HtsLevel.SECTION,
    //     candidates: sections,
    //     selection: sections[bestSectionMatch.index],
    //     reasoning: bestSectionMatch.logic,
    //   },
    // ]);
  };

  // Get 2-3 Best Chapters
  const getChapters = async () => {
    console.log("Getting Best Chapters");
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
          2,
          3,
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

    // TODO: Maybe should set progression here and add a condition below to ONLY kick
    // off the subheading and beyond classification if the level is === heading
    // setClassificationProgression([
    //   ...classificationProgression,
    //   {
    //     level: HtsLevel.CHAPTER,
    //     candidates: chapters,
    //     selection: chapters[bestChapterMatch.index],
    //     reasoning: bestChapterMatch.logic,
    //   },
    // ]);
  };

  // Get 2-3 Best Headings Per Chapter
  const getHeadings = async () => {
    console.log("Getting Best Headings");
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
          2,
          3,
          elementsAtLevel.map((e) => e.description)
        );

        console.log(`Best Heading Candidates for Chapter ${chapter.index}:`);
        console.log(bestCandidateHeadings);

        const candidates = bestCandidateHeadings.bestCandidates.map(
          (candidate) => ({
            index: elementsAtLevel[candidate.index].htsno,
            description: elementsAtLevel[candidate.index].description,
            logic: candidate.logic,
          })
        );

        candidatesForHeading.push(...candidates);
      })
    );

    setHeadingCandidates(candidatesForHeading);
  };

  const getBestHeading = async () => {
    console.log("Getting Best OVERALL Headings");
    console.log(headingCandidates);

    const rankedHeadings = await rankBestHtsHeadings(
      headingCandidates.map((h) => h.description),
      productDescription
    );

    console.log("Ranked Headings:");
    console.log(rankedHeadings);

    // const bestCandidateHeadings = await getBestDescriptionCandidates(
    //   [],
    //   productDescription,
    //   false,
    //   null,
    //   1,
    //   headingCandidates.map((h) => h.description)
    // );

    // console.log(`BEST HEADING:`);
    // console.log(bestCandidateHeadings);

    // TODO: Need to set the htsDescription here
    // TODO: Need to set the classificationProgression here
    // TODO: Need to set the classificationLevel here
    // TODO: Need to set the htsElementsChunk here?

    // const candidates = bestCandidateHeadings.bestCandidates.map(
    //   (candidate) => ({
    //     index: headingCandidates[candidate.index].index,
    //     description: headingCandidates[candidate.index].description,
    //     logic: candidate.logic,
    //   })
    // );
  };

  const getChapterData = async () => {
    const chapterData = await getHtsChapterData(selectedChapter);
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
      setLoading(true);
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
