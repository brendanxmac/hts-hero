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
import { Loader } from "../interfaces/ui";
import { SearchResults } from "./SearchResults";
import { useHts } from "../contexts/HtsContext";

const ExploreTabs: Tab[] = [
  {
    label: "Search",
    value: ExploreTab.SEARCH,
  },
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
  const [{ isLoading, text: loadingText }, setLoading] = useState<Loader>({
    isLoading: true,
    text: "Fetching Sections",
  });
  const [searchValue, setSearchValue] = useState("");
  const [loadedElements, setLoadedElements] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(ExploreTabs[1].value);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections, loading: loadingSections, getSections } = useHtsSections();
  const [fuse, setFuse] = useState<Fuse<HtsElement> | null>(null);
  const [searchResults, setSearchResults] = useState<HtsElement[]>([]);
  const { htsElements, fetchElements } = useHts();

  useEffect(() => {
    const loadAllElements = async () => {
      setLoading({ isLoading: true, text: "Fetching All Elements" });
      await fetchElements();
      setLoadedElements(true);
      if (loadingText === "Fetching All Elements") {
        setLoading({ isLoading: false, text: "" });
      }
    };
    loadAllElements();
  }, []);

  useEffect(() => {
    if (loadedElements) {
      if (htsElements) {
        setFuse(
          new Fuse(htsElements, {
            keys: ["description", "htsno"],
            threshold: 0.5,
          })
        );
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
      if (sections.length === 0 && !loadingSections) {
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
  }, []);

  useEffect(() => {
    if (fuse) {
      const timeoutId = setTimeout(() => {
        const results = fuse.search(searchValue);
        const topResults = results.slice(0, 30);
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
          <SearchResults
            results={searchResults}
            searchString={searchValue}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
};
