"use client";

import { useEffect, useState } from "react";
import { LoadingIndicator } from "./LoadingIndicator";
import { Elements } from "./Elements";
import { Notes } from "./Notes";
import { Tab } from "../interfaces/tab";
import { SectionHeader } from "./SectionHeader";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { HtsElement, Navigatable } from "../interfaces/hts";
import { ExploreTab } from "../enums/explore";
import Fuse from "fuse.js";
import { useChapters } from "../contexts/ChaptersContext";
import { ElementSummary } from "./ElementSummary";

const ExploreTabs: Tab[] = [
  {
    label: "Elements",
    value: ExploreTab.ELEMENTS,
  },
  {
    label: "Notes",
    value: ExploreTab.NOTES,
  },
];

export const Explore = () => {
  // read in the all-elements.json from hts-chapters

  const [searchValue, setSearchValue] = useState("");
  const [loadedElements, setLoadedElements] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(ExploreTabs[0].value);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections, loading, getSections } = useHtsSections();
  const { fetchChapter, getChapterElements } = useChapters();
  const [fuse, setFuse] = useState<Fuse<HtsElement> | null>(null);
  const [searchResults, setSearchResults] = useState<HtsElement[]>([]);

  useEffect(() => {
    const loadChapters = async () => {
      await fetchChapter(0);
      setLoadedElements(true);
    };
    loadChapters();
  }, []);

  useEffect(() => {
    if (loadedElements) {
      const elements = getChapterElements(0);

      if (elements) {
        setFuse(new Fuse(elements, { keys: ["description"] }));
      }
    }
  }, [loadedElements]);

  useEffect(() => {
    if (activeTab !== ExploreTab.ELEMENTS) {
      setActiveTab(ExploreTab.ELEMENTS);
    }
  }, [breadcrumbs]);

  useEffect(() => {
    const initializeSections = async () => {
      if (sections.length === 0) {
        await getSections();
      }
      if (breadcrumbs.length === 0) {
        setBreadcrumbs([
          {
            title: "Sections",
            element: {
              type: Navigatable.SECTIONS,
              sections,
            },
          },
        ]);
      }
    };
    initializeSections();
  }, [activeTab]);

  useEffect(() => {
    if (fuse) {
      const results = fuse.search(searchValue);
      console.log(`Search Results: ${results.length}`);
      // Grab the top 20 results (at most)
      const topResults = results.slice(0, 20);
      setSearchResults(topResults.map((result) => result.item));
    }
  }, [searchValue]);

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <SectionHeader
        title="Explore"
        tabs={ExploreTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchInput={setSearchValue}
      />

      {searchResults.length > 0 && (
        <div className="flex flex-col gap-4">
          {searchResults.map((result, index) => (
            <ElementSummary
              key={`search-result-${index}`}
              element={result}
              onClick={() => {
                console.log("Clicked", result);
              }}
            />
          ))}
        </div>
      )}

      {searchResults.length === 0 && (
        <div className="h-full grow flex flex-col gap-4 overflow-y-auto">
          {loading && <LoadingIndicator text="Loading Sections" />}
          {!loading && activeTab === ExploreTab.ELEMENTS && (
            <Elements sections={sections} />
          )}
          {!loading && activeTab === ExploreTab.NOTES && <Notes />}
        </div>
      )}
    </div>
  );
};
