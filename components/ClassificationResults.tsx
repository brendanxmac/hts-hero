"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getBestCandidatesAtClassificationLevel,
  getHtsChapterData,
  getHtsLevel,
  getHtsSectionsAndChapters,
  getNextChunk,
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
  const [bestSectionMatch, setBestSectionMatch] = useState<
    CandidateSelection | undefined
  >(undefined);

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

  const getSections = async () => {
    setLoading(true);
    // Get Sections (top 3)
    const sectionsResponse = await getHtsSectionsAndChapters();
    setHtsSections(sectionsResponse.sections);
    const sections = sectionsResponse.sections;

    // Hit Chat GPT to get the best for the description
    const bestSectionCandidates = await getBestCandidatesAtClassificationLevel(
      [],
      0,
      productDescription,
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

    // setBestSectionMatch(bestSectionMatch);

    // setHtsDescription(
    //   updateHtsDescription(
    //     htsDescription,
    //     sections[bestSectionMatch.index].description
    //   )
    // );

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

  const getChapters = async () => {
    console.log("Getting Chapters");
    // Get Chapters (top 3 from each section)
    // const chapters = htsSections[bestSectionMatch.index].chapters;
    console.log(htsSections.length);
    const candidateSections = htsSections.filter((section) => {
      return sectionCandidates.some((candidate) => {
        return candidate.index === section.number;
      });
    });

    console.log("Sections with Chapters:");
    console.log(candidateSections);
    // const chapters = sectionCandidates.bestCandidates.map((section) => {
    //   return htsSections[section.index].chapters;
    // });
    let candidatesForChapter: CandidateSelection[] = [];

    await Promise.all(
      candidateSections.map(async (section) => {
        // Hit Chat GPT to get the best for the description
        console.log(
          `Getting Best Chapter Candidates for Section ${section.number}`
        );
        const bestChapterCandidates =
          await getBestCandidatesAtClassificationLevel(
            [],
            0,
            productDescription,
            section.chapters.map((c) => c.description)
          );

        console.log(`Best Chapter Candidates for Section ${section.number}:`);
        console.log(bestChapterCandidates);

        const candidates: CandidateSelection[] =
          bestChapterCandidates.bestCandidates.map((chapterCandidate) => ({
            index: section.chapters[chapterCandidate.index].number,
            description: section.chapters[chapterCandidate.index].description,
            logic: chapterCandidate.logic,
          }));

        candidatesForChapter.push(...candidates);
      })
    );

    console.log("========== Setting Chapter Candidates ==========");
    console.log(candidatesForChapter.length);
    if (candidatesForChapter.length) {
      console.log(candidatesForChapter[0]);
    }
    setChapterCandidates(candidatesForChapter);

    // const selectedChapter = chapters[bestChapterMatch.index].number;

    // setSelectedChapter(String(selectedChapter));

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

  const getHeadings = async () => {
    console.log("Getting Headings");

    // Get Headings (top 3 from each chapter)
    const candidatesForHeading: HeadingSelection[] = [];
    // 1. Fetch Chapter Data
    await Promise.all(
      chapterCandidates.map(async (chapter) => {
        console.log(
          `Getting Best Heading Candidates for Chapter ${chapter.index}`
        );
        const chapterData = await getHtsChapterData(String(chapter.index));
        const chapterDataWithParentIndex = setIndexInArray(chapterData);
        // 2. Get Elements at Heading Level (indent: 0)
        const elementsAtLevel = elementsAtClassificationLevel(
          chapterDataWithParentIndex,
          0
        );
        // 3. Find Best Candidates
        const bestCandidateHeadings =
          await getBestCandidatesAtClassificationLevel(
            elementsAtLevel,
            classificationLevel,
            productDescription
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

    console.log(`Setting Candidates for Heading`);
    setHeadingCandidates(candidatesForHeading);
  };

  const getBestHeading = async () => {
    console.log("Getting Best OVERALL Headings");
    console.log(headingCandidates);

    const bestCandidateHeadings = await getBestCandidatesAtClassificationLevel(
      [],
      0,
      productDescription,
      headingCandidates.map((h) => h.description)
    );

    console.log(`Best Heading Candidates OVERALL:`);
    console.log(bestCandidateHeadings);

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
      // Go find best chapters via Promise.all with ChatGPT
      getChapters();
    }
  }, [sectionCandidates]);

  useEffect(() => {
    if (chapterCandidates && chapterCandidates.length > 0) {
      // Go find best chapters via Promise.all with ChatGPT
      console.log("GOING TO GET HEADINGS");
      getHeadings();
    }
  }, [chapterCandidates]);

  useEffect(() => {
    if (headingCandidates && headingCandidates.length > 0) {
      // Go find best chapters via Promise.all with ChatGPT
      console.log("GOING TO GET BEST HEADING");
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
