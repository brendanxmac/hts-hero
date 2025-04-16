"use client";

import { useEffect, useState } from "react";
import { Tab } from "../interfaces/tab";
import TextInput from "./TextInput";
import { CandidateElements } from "./CandidateElements";
import { CandidateSelection, HtsElement, HtsSection } from "../interfaces/hts";
import { getBestDescriptionCandidates } from "../libs/hts";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { elementsAtClassificationLevel } from "../utilities/data";
import { setIndexInArray } from "../utilities/data";
import { useChapters } from "../contexts/ChaptersContext";
import { HtsLevel } from "../enums/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { useClassification } from "../contexts/ClassificationContext";

enum Tabs {
  COMPLETED = "completed",
  IN_PROGRESS = "in-progress",
}

const tabs: Tab[] = [
  {
    label: "Completed",
    value: Tabs.COMPLETED,
  },
  {
    label: "In Progress",
    value: Tabs.IN_PROGRESS,
  },
];

export const Classify = () => {
  const { fetchChapter, getChapterElements } = useChapters();
  const {
    classificationProgression,
    setClassificationProgression,
    addToClassificationProgression,
  } = useClassification();
  const [productDescription, setProductDescription] = useState("");
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [headingCandidates, setHeadingCandidates] = useState<HtsElement[]>([]);
  const [classificationIndentLevel, setClassificationIndentLevel] = useState(1);
  const [loading, setLoading] = useState({ isLoading: false, text: "" });

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

    setSectionCandidates(candidates);
    setLoading({ isLoading: false, text: "" });
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

    // Fetch Chapter Data for the best candidates
    await Promise.all(
      candidatesForChapter.map(async (chapter) => {
        const chapterElements = getChapterElements(chapter.index);
        if (!chapterElements) {
          await fetchChapter(chapter.index);
        }
      })
    );

    setChapterCandidates(candidatesForChapter);
    setLoading({ isLoading: false, text: "" });
  };

  // Get up to 2 Best Headings Per Chapter
  const getHeadings = async () => {
    setLoading({ isLoading: true, text: "Finding Best Headings" });
    const candidatesForHeading: HtsElement[] = [];
    await Promise.all(
      chapterCandidates.map(async (chapter) => {
        let chapterData = getChapterElements(chapter.index);
        if (!chapterData) {
          await fetchChapter(chapter.index);
          chapterData = getChapterElements(chapter.index);
        }

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

        const candidates = bestCandidateHeadings.bestCandidates
          .map((candidate) => {
            return elementsAtLevel[candidate.index];
          })
          .map((candidate) => ({
            ...candidate,
          }));

        candidatesForHeading.push(...candidates);
      })
    );

    setHeadingCandidates(candidatesForHeading);
    addToClassificationProgression(HtsLevel.HEADING, candidatesForHeading);
    // DO not move this down, it will break the classification as the timing is critical
    setClassificationIndentLevel(classificationIndentLevel + 1);
    setLoading({ isLoading: false, text: "" });
  };

  useEffect(() => {
    if (productDescription) {
      getSections();
    }
  }, [productDescription]);

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
      console.log("Heading Candidates:", headingCandidates);
      setClassificationProgression([
        {
          level: HtsLevel.HEADING,
          candidates: headingCandidates,
        },
      ]);
    }
  }, [headingCandidates]);

  return (
    <section className="grow h-full w-full flex flex-col items-start gap-4">
      <div className="w-full flex flex-col overflow-auto gap-4">
        <div className="w-full overflow-y-scroll flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <TextInput
              label="Item Description"
              placeholder="Enter item description"
              setProductDescription={setProductDescription}
            />
            {/* <TextInput
            label="Analysis"
            placeholder="Enter product analysis"
            setProductDescription={() => {}}
          /> */}
          </div>

          {loading.isLoading && <LoadingIndicator text={loading.text} />}

          {classificationProgression.length > 0 && (
            <CandidateElements
              indentLevel={0}
              classificationProgression={classificationProgression}
              setClassificationProgression={setClassificationProgression}
              productDescription={productDescription}
            />
          )}
        </div>
      </div>
    </section>
  );
};

// {
//       htsno: "3924",
//       indent: "0",
//       description:
//         "Tableware, kitchenware, other household articles and hygienic or toilet articles, of plastics:",
//       superior: null,
//       units: [],
//       general: "",
//       special: "",
//       other: "",
//       footnotes: [],
//       quotaQuantity: "",
//       additionalDuties: "",
//       uuid: "6aa606a0-f237-4164-99c8-83da0c917781",
//       chapter: 39,
//       type: Navigatable.ELEMENT,
//     },
//     {
//       htsno: "3926",
//       indent: "0",
//       description:
//         "Other articles of plastics and articles of other materials of headings 3901 to 3914:",
//       superior: null,
//       units: [],
//       general: "",
//       special: "",
//       other: "",
//       footnotes: [],
//       quotaQuantity: "",
//       additionalDuties: "",
//       uuid: "9d73c351-f483-40de-abc5-134626ea5e3d",
//       chapter: 39,
//       type: Navigatable.ELEMENT,
//     },
//     {
//       htsno: "8481",
//       indent: "0",
//       description:
//         "Taps, cocks, valves and similar appliances, for pipes, boiler shells, tanks, vats or the like, including pressure-reducing valves and thermostatically controlled valves; parts thereof:",
//       superior: null,
//       units: [],
//       general: "",
//       special: "",
//       other: "",
//       footnotes: [],
//       quotaQuantity: "",
//       additionalDuties: "",
//       uuid: "38c82ecf-f91e-4f75-a844-16f2568d11ff",
//       chapter: 84,
//       type: Navigatable.ELEMENT,
//     },
//     {
//       htsno: "8479",
//       indent: "0",
//       description:
//         "Machines and mechanical appliances having individual functions, not specified or included elsewhere in this chapter; parts thereof:",
//       superior: null,
//       units: [],
//       general: "",
//       special: "",
//       other: "",
//       footnotes: [],
//       quotaQuantity: "",
//       additionalDuties: "",
//       uuid: "5f7e817d-b3af-45c7-8dad-ec5d0c853e0b",
//       chapter: 84,
//       type: Navigatable.ELEMENT,
//     },
