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
import Fuse, { FuseResult } from "fuse.js";
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
  const [activeTab, setActiveTab] = useState(ExploreTabs[1].value);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections, loading: loadingSections, getSections } = useHtsSections();
  const [fuse, setFuse] = useState<Fuse<HtsElement> | null>(null);
  const [searchResults, setSearchResults] = useState<FuseResult<HtsElement>[]>(
    []
  );
  const { htsElements, fetchElements } = useHts();

  useEffect(() => {
    const loadAllData = async () => {
      setLoading({ isLoading: true, text: "Fetching All Elements" });
      await Promise.all([fetchElements(), getSections()]);
      setLoading({ isLoading: false, text: "" });
    };

    if (!sections.length || !htsElements.length) {
      loadAllData();
    } else {
      setLoading({ isLoading: false, text: "" });
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
  }, []);

  useEffect(() => {
    if (htsElements.length > 0) {
      setFuse(
        new Fuse(htsElements, {
          keys: ["description", "htsno"],
          threshold: 0.3,
          findAllMatches: true,
          ignoreLocation: true,
          includeMatches: true,
        })
      );
    }
  }, [htsElements]);

  useEffect(() => {
    if (activeTab !== ExploreTab.ELEMENTS) {
      setActiveTab(ExploreTab.ELEMENTS);
    }
  }, [breadcrumbs]);

  useEffect(() => {
    if (fuse && searchValue.length > 0) {
      const timeoutId = setTimeout(() => {
        const results = fuse.search(
          searchValue.split(" ").length === 1
            ? `'${searchValue} `
            : `'${searchValue}`
        );
        const topResults = results.slice(0, 30);
        setSearchResults(topResults);
        setActiveTab(ExploreTab.SEARCH);
        setLoading({ isLoading: false, text: "" });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);

  return (
    <div className="w-full p-6 h-full flex flex-col gap-4">
      <SectionHeader
        title="Explore"
        tabs={ExploreTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={(value) => {
          if (searchValue !== value) {
            setSearchValue(value);
            setLoading({ isLoading: true, text: "Searching Elements" });
          }
          if (activeTab !== ExploreTab.SEARCH) {
            setActiveTab(ExploreTab.SEARCH);
          }
        }}
      />

      <div className="w-full h-full grow flex flex-col gap-4 overflow-y-auto">
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
