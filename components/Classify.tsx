"use client";

import { useEffect, useState } from "react";
import { Tab } from "../interfaces/tab";
import { SectionHeader } from "./SectionHeader";
import TextInput from "./TextInput";
import { ElementSelection } from "./ElementSelection";
import {
  CandidateSelection,
  HtsElement,
  HtsElementType,
  HtsLevelClassification,
  HtsSection,
} from "../interfaces/hts";
import {
  evaluateBestHeadings,
  getBestDescriptionCandidates,
  getHtsChapterData,
} from "../libs/hts";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { elementsAtClassificationLevel } from "../utilities/data";
import { setIndexInArray } from "../utilities/data";
import { useChapters } from "../contexts/ChaptersContext";
import { HtsLevel } from "../enums/hts";

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
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [productDescription, setProductDescription] = useState("");
  const [recommendedElement, setRecommendedElement] =
    useState<HtsElement | null>(null);
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [headingCandidates, setHeadingCandidates] = useState<HtsElement[]>([
    {
      htsno: "4420",
      indent: "0",
      description:
        "Wood marquetry and inlaid wood; caskets and cases for jewelry or cutlery and similar articles, of wood; statuettes and other ornaments, of wood; wooden articles of furniture not falling within chapter 94:",
      superior: null,
      units: [],
      general: "",
      special: "",
      other: "",
      footnotes: [],
      quotaQuantity: "",
      additionalDuties: "",
      addiitionalDuties: null,
      uuid: "bffcfb98-2112-4688-a59b-aacc2ab5a571",
      chapter: 44,
      type: HtsElementType.ELEMENT,
      suggested: true,
    },
    {
      htsno: "9403",
      indent: "0",
      description: "Other furniture and parts thereof:",
      superior: null,
      units: [],
      general: "",
      special: "",
      other: "",
      footnotes: [],
      quotaQuantity: "",
      additionalDuties: "",
      addiitionalDuties: null,
      uuid: "a0b89f8d-4089-4805-b5aa-7764113b5daa",
      chapter: 94,
      type: HtsElementType.ELEMENT,
      suggested: true,
    },
  ]);
  const [classificationProgression, setClassificationProgression] = useState<
    HtsLevelClassification[]
  >([
    {
      level: HtsLevel.HEADING,
      candidates: [
        {
          htsno: "4420",
          indent: "0",
          description:
            "Wood marquetry and inlaid wood; caskets and cases for jewelry or cutlery and similar articles, of wood; statuettes and other ornaments, of wood; wooden articles of furniture not falling within chapter 94:",
          superior: null,
          units: [],
          general: "",
          special: "",
          other: "",
          footnotes: [],
          quotaQuantity: "",
          additionalDuties: "",
          addiitionalDuties: null,
          uuid: "bffcfb98-2112-4688-a59b-aacc2ab5a571",
          chapter: 44,
          type: HtsElementType.ELEMENT,
          suggested: true,
        },
        {
          htsno: "9403",
          indent: "0",
          description: "Other furniture and parts thereof:",
          superior: null,
          units: [],
          general: "",
          special: "",
          other: "",
          footnotes: [],
          quotaQuantity: "",
          additionalDuties: "",
          addiitionalDuties: null,
          uuid: "a0b89f8d-4089-4805-b5aa-7764113b5daa",
          chapter: 94,
          type: HtsElementType.ELEMENT,
          suggested: true,
        },
      ],
      selection: {
        htsno: "4420",
        indent: "0",
        description:
          "Wood marquetry and inlaid wood; caskets and cases for jewelry or cutlery and similar articles, of wood; statuettes and other ornaments, of wood; wooden articles of furniture not falling within chapter 94:",
        superior: null,
        units: [],
        general: "",
        special: "",
        other: "",
        footnotes: [],
        quotaQuantity: "",
        additionalDuties: "",
        addiitionalDuties: null,
        uuid: "bffcfb98-2112-4688-a59b-aacc2ab5a571",
        chapter: 44,
        type: HtsElementType.ELEMENT,
        suggested: true,
      },
      reasoning: "",
    },
  ]);
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

    console.log("Section Candidates:", bestSectionCandidates.bestCandidates);

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

    console.log("Chapter Candidates:", candidatesForChapter);

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
            suggested: true,
          }));

        candidatesForHeading.push(...candidates);
      })
    );

    console.log("Heading Candidates:", candidatesForHeading);

    setHeadingCandidates(candidatesForHeading);
    // DO not move this down, it will break the classification as the timing is critical
    setClassificationIndentLevel(classificationIndentLevel + 1);
    setLoading({ isLoading: false, text: "" });
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

    // FIXME: See if we can simplify this cause we now have all the chapter data already...

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

    const chapterData = getChapterElements(
      chapterCandidates.find(
        (c) => c.index === parseInt(headingsEvaluation.code.substring(0, 2))
      )?.index
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

    console.log("Recommended Heading:", selectedHeading);

    setRecommendedElement(selectedHeading);
    setLoading({ isLoading: false, text: "" });
  };

  useEffect(() => {
    if (productDescription) {
      console.log("Getting Sections");
      getSections();
    }
  }, [productDescription]);

  useEffect(() => {
    if (sectionCandidates && sectionCandidates.length > 0) {
      console.log("Getting Chapters");
      getChapters();
    }
  }, [sectionCandidates]);

  useEffect(() => {
    if (chapterCandidates && chapterCandidates.length > 0) {
      console.log("Getting Headings");
      getHeadings();
    }
  }, [chapterCandidates]);

  useEffect(() => {
    if (headingCandidates && headingCandidates.length > 0) {
      // console.log("Getting Best Heading");
      // getBestHeading();
    }
  }, [headingCandidates]);

  useEffect(() => {
    console.log("Classification Progression:", classificationProgression);
  }, [classificationProgression]);

  return (
    <section className="grow h-full w-full overflow-auto flex flex-col items-start gap-4">
      <div className="min-w-full flex flex-col gap-4">
        <SectionHeader
          title="Classify"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <TextInput
          label="Product Description"
          placeholder="Enter product description"
          setProductDescription={setProductDescription}
        />
        {/* <TextInput
        label="Product Analysis"
        placeholder="Enter product analysis"
        setProductDescription={() => {}}
      /> */}

        {/* {productDescription && ( */}
        {/* TODO: Figure out a way to show another section as we progres... */}
        {/* TODO: Figure out a way to show another section as we progres... */}
        {/* TODO: Figure out a way to show another section as we progres... */}
        {/* TODO: Figure out a way to show another section as we progres... */}
        {/* TODO: Figure out a way to show another section as we progres... */}
        <ElementSelection
          loading={loading}
          elements={headingCandidates}
          recommendedElement={recommendedElement}
          indentLevel={classificationIndentLevel}
          classificationProgression={classificationProgression}
          setClassificationProgression={setClassificationProgression}
        />
        {/* )} */}
      </div>
    </section>
  );
};
