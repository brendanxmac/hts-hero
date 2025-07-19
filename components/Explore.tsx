"use client";

import { useEffect, useState, useRef } from "react";
import { LoadingIndicator } from "./LoadingIndicator";
import { Elements } from "./Elements";
import { Notes } from "./Notes";
import { Tab } from "../interfaces/tab";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { HtsElement, Navigatable } from "../interfaces/hts";
import { ExploreTab } from "../enums/explore";
import Fuse, { FuseResult } from "fuse.js";
import { Loader } from "../interfaces/ui";
import { SearchResults } from "./SearchResults";
import { useHts } from "../contexts/HtsContext";
import { isHTSCode } from "../libs/hts";
import { SearchBar } from "./SearchBar";
import { classNames } from "../utilities/style";
import { Color } from "../enums/style";
import { PrimaryLabel } from "./PrimaryLabel";

const ExploreTabs: Tab[] = [
  {
    label: "Codes",
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
    text: "Loading",
  });
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(ExploreTabs[1].value);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections, getSections } = useHtsSections();
  const [fuse, setFuse] = useState<Fuse<HtsElement> | null>(null);
  const [searchResults, setSearchResults] = useState<FuseResult<HtsElement>[]>(
    []
  );
  const { htsElements, fetchElements, revision } = useHts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading({ isLoading: true, text: "Loading" });
      await Promise.all([fetchElements("latest"), getSections()]);
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
          threshold: 0.4,
          findAllMatches: true,
          ignoreLocation: true,
        })
      );
    }
  }, [htsElements]);

  useEffect(() => {
    if (activeTab !== ExploreTab.ELEMENTS) {
      setActiveTab(ExploreTab.ELEMENTS);
    }
  }, [breadcrumbs]);

  // Scroll to top when breadcrumbs change (navigation occurs)
  useEffect(() => {
    if (scrollContainerRef.current && breadcrumbs.length > 1) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [breadcrumbs]);

  useEffect(() => {
    if (fuse && searchValue.length > 0) {
      const timeoutId = setTimeout(() => {
        const searchString = isHTSCode(searchValue)
          ? searchValue
          : searchValue.split(" ").length === 1
            ? `'${searchValue} `
            : `'${searchValue}`;

        const results = fuse.search(searchString);
        const topResults = results.slice(0, 30);
        setSearchResults(topResults);
        setActiveTab(ExploreTab.SEARCH);
        setLoading({ isLoading: false, text: "" });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);

  return (
    <div className="w-full h-full p-4 flex flex-col gap-2">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingIndicator text={loadingText} />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="w-full h-full grow flex flex-col gap-4 overflow-y-scroll"
        >
          <div className="flex gap-4 items-center justify-between flex-col md:flex-row">
            <div className="w-full flex gap-4 items-center justify-between md:justify-normal">
              <div className="flex flex-col -space-y-1">
                <div className="flex gap-2 items-end">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    HTS {revision?.name.split("-")[0]}
                  </h1>
                  <div className="mb-0.5">
                    <PrimaryLabel
                      value={`v${revision?.name.split("-")[1]}`}
                      color={Color.PRIMARY}
                    />
                  </div>
                </div>
              </div>

              <div
                role="tablist"
                className="tabs tabs-boxed bg-primary/30 rounded-xl"
              >
                {ExploreTabs.map((tab) => (
                  <a
                    key={tab.value}
                    role="tab"
                    onClick={() => setActiveTab(tab.value)}
                    className={classNames(
                      "tab transition-all duration-200 ease-in text-white font-semibold",
                      tab.value === activeTab && "tab-active"
                    )}
                  >
                    {tab.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="w-full md:max-w-[250px] lg:max-w-[350px]">
              <SearchBar
                placeholder="Search by code or description"
                onSearch={(value) => {
                  if (value.length > 0) {
                    if (searchValue !== value) {
                      setSearchValue(value);
                      setLoading({
                        isLoading: true,
                        text: "Searching Elements",
                      });
                    }
                    if (activeTab !== ExploreTab.SEARCH) {
                      setActiveTab(ExploreTab.SEARCH);
                    }
                  }
                }}
              />
            </div>
          </div>
          {activeTab === ExploreTab.ELEMENTS && (
            <Elements sections={sections} />
          )}
          {activeTab === ExploreTab.NOTES && <Notes />}
          {activeTab === ExploreTab.SEARCH && (
            <SearchResults
              results={searchResults}
              searchString={searchValue}
              setActiveTab={setActiveTab}
              setSearchResults={setSearchResults}
              setSearchValue={setSearchValue}
            />
          )}
        </div>
      )}
    </div>
  );
};
