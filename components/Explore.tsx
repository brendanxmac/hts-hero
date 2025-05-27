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
import { TertiaryLabel } from "./TertiaryLabel";
import { ElementSearchSummary } from "./ElementSearchSummary";
import {
  generateBreadcrumbsForHtsElement,
  getChapterFromHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { Loader } from "../interfaces/ui";

const ExploreTabs: Tab[] = [
  {
    label: "Elements",
    value: ExploreTab.ELEMENTS,
  },
  {
    label: "Notes",
    value: ExploreTab.NOTES,
  },
  {
    label: "Search",
    value: ExploreTab.SEARCH,
  },
];

export const Explore = () => {
  const [{ isLoading, text: loadingText }, setLoading] = useState<Loader>({
    isLoading: true,
    text: "Fetching Sections",
  });
  const [searchValue, setSearchValue] = useState("");
  const [loadedElements, setLoadedElements] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(ExploreTabs[0].value);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections, getSections } = useHtsSections();
  const { fetchChapter, getChapterElements } = useChapters();
  const [fuse, setFuse] = useState<Fuse<HtsElement> | null>(null);
  const [searchResults, setSearchResults] = useState<HtsElement[]>([]);

  useEffect(() => {
    const loadChapters = async () => {
      setLoading({ isLoading: true, text: "Fetching Chapters" });
      await fetchChapter(0);
      setLoadedElements(true);
      setLoading({ isLoading: false, text: "" });
    };
    loadChapters();
  }, []);

  useEffect(() => {
    if (loadedElements) {
      const elements = getChapterElements(0);

      if (elements) {
        setFuse(new Fuse(elements, { keys: ["description", "htsno"] }));
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
      setLoading({ isLoading: false, text: "" });
    };
    initializeSections();
  }, [activeTab]);

  useEffect(() => {
    if (fuse) {
      const timeoutId = setTimeout(() => {
        const results = fuse.search(searchValue);
        console.log(`Search Results: ${results.length}`);
        const topResults = results.slice(0, 10);
        setSearchResults(topResults.map((result) => result.item));
        setActiveTab(ExploreTab.SEARCH);
        setLoading({ isLoading: false, text: "" });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <SectionHeader
        title="Explore"
        tabs={ExploreTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={(value) => {
          setSearchValue(value);
          setLoading({ isLoading: true, text: "Searching Elements" });
        }}
      />

      <div className="h-full grow flex flex-col gap-4 overflow-y-auto">
        {isLoading && <LoadingIndicator text={loadingText} />}
        {!isLoading && activeTab === ExploreTab.ELEMENTS && (
          <Elements sections={sections} />
        )}
        {!isLoading && activeTab === ExploreTab.NOTES && <Notes />}
        {!isLoading && activeTab === ExploreTab.SEARCH && (
          <div className="flex flex-col gap-4">
            {/* TODO: add recents */}
            {searchResults.length === 0 ? (
              <div className="w-full h-96 flex flex-col gap-4 justify-center items-center">
                <TertiaryLabel value="No results yet, start a search above" />
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
                <div className="w-full flex justify-between">
                  <TertiaryLabel
                    value={searchResults.length ? `Top Results` : "No Results"}
                  />
                  <button className="btn btn-xs btn-outline">
                    Search Synonyms (TODO)
                  </button>
                </div>

                {searchResults.map((result, index) => (
                  <ElementSearchSummary
                    key={`search-result-${index}`}
                    element={result}
                    sectionAndChapter={getSectionAndChapterFromChapterNumber(
                      sections,
                      Number(
                        getChapterFromHtsElement(
                          result,
                          getHtsElementParents(result, getChapterElements(0))
                        )
                      )
                    )}
                    parents={getHtsElementParents(
                      result,
                      getChapterElements(0)
                    )}
                    onClick={() => {
                      console.log("Clicked", result);
                      const parents = getHtsElementParents(
                        result,
                        getChapterElements(0)
                      );
                      const { chapter } = getSectionAndChapterFromChapterNumber(
                        sections,
                        Number(
                          getChapterFromHtsElement(
                            result,
                            getHtsElementParents(result, getChapterElements(0))
                          )
                        )
                      );
                      console.log("Parents", parents);
                      console.log(getChapterFromHtsElement(result, parents));
                      // Set breadcrumbs to the parents, starting with the section, then chapter, then elements if applicable
                      setBreadcrumbs(
                        generateBreadcrumbsForHtsElement(
                          result,
                          sections,
                          chapter,
                          [...parents, result]
                        )
                      );
                      setActiveTab(ExploreTab.ELEMENTS);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
