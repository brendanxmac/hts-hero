import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { generateBreadcrumbsForHtsElement } from "../libs/hts";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { ExploreTab } from "../enums/explore";
import { HtsElement } from "../interfaces/hts";
import {
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { ElementSearchSummary } from "./ElementSearchSummary";
import { useHts } from "../contexts/HtsContext";
import { FuseResult } from "fuse.js";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";

interface Props {
  results: FuseResult<HtsElement>[];
  setActiveTab: (tab: ExploreTab) => void;
  setSearchResults: (results: FuseResult<HtsElement>[]) => void;
  setSearchValue: (value: string) => void;
}

export const SearchResults = ({
  results,
  setActiveTab,
  setSearchResults,
  setSearchValue,
}: Props) => {
  const { htsElements } = useHts();
  const { sections } = useHtsSections();
  const { setBreadcrumbs } = useBreadcrumbs();

  if (results.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col gap-4 justify-center items-center">
        <div className="w-16 h-16 rounded-2xl bg-base-content/5 border border-base-content/10 flex items-center justify-center">
          <MagnifyingGlassIcon className="w-8 h-8 text-base-content/30" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-medium text-base-content/60">
            No results found
          </span>
          <span className="text-sm text-base-content/40">
            Try a different search term
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Results Header */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
          Search Results
        </span>
        <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
          {results.length}
        </span>
      </div>

      {/* Results List */}
      <div className="flex flex-col gap-2">
      {results.map((result, index) => {
        const { item: element } = result;
        const sectionAndChapter = getSectionAndChapterFromChapterNumber(
          sections,
          Number(element.chapter)
        );
        const parents = getHtsElementParents(element, htsElements);
        const breadcrumbs = generateBreadcrumbsForHtsElement(
          sections,
          sectionAndChapter.chapter,
          [...parents, element]
        );

        return (
          <ElementSearchSummary
            key={`search-result-${index}`}
            element={element}
            sectionAndChapter={sectionAndChapter}
            parents={parents}
            onClick={() => {
              setSearchResults([]);
              setSearchValue("");
              setBreadcrumbs(breadcrumbs);
              setActiveTab(ExploreTab.ELEMENTS);
            }}
          />
        );
      })}
      </div>
    </div>
  );
};
