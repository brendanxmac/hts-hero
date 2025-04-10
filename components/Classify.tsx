"use client";

import { useEffect, useState } from "react";
import { Tab } from "../interfaces/tab";
import { SectionHeader } from "./SectionHeader";
import TextInput from "./TextInput";
import { ElementSelection } from "./ElementSelection";
import { CandidateSelection, HtsElement, HtsSection } from "../interfaces/hts";
import { getBestDescriptionCandidates, getHtsChapterData } from "../libs/hts";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { elementsAtClassificationLevel } from "../utilities/data";
import { setIndexInArray } from "../utilities/data";

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
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [productDescription, setProductDescription] = useState("");
  const [elements, setElements] = useState<HtsElement[]>([]);
  const [htsSections, setHtsSections] = useState<HtsSection[]>([]);
  const [sectionCandidates, setSectionCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [chapterCandidates, setChapterCandidates] = useState<
    CandidateSelection[]
  >([]);
  const [headingCandidates, setHeadingCandidates] = useState<HtsElement[]>([]);
  const [classificationIndentLevel, setClassificationIndentLevel] = useState(0);
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

    setChapterCandidates(candidatesForChapter);
    setLoading({ isLoading: false, text: "" });
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

    console.log("Heading Candidates:", candidatesForHeading);

    setHeadingCandidates(candidatesForHeading);
    // DO not move this down, it will break the classification as the timing is critical
    setClassificationIndentLevel(classificationIndentLevel + 1);
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

        {/* TODO: make a component that will show candidate headers for the classification */}
        {productDescription && (
          <ElementSelection loading={loading} elements={headingCandidates} />
        )}
      </div>
    </section>
  );
};
