import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { generateBreadcrumbsForHtsElement } from "../libs/hts";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { ExploreTab } from "../enums/explore";
import { HtsElement } from "../interfaces/hts";
import {
  getChapterFromHtsElement,
  getHtsElementParents,
  getSectionAndChapterFromChapterNumber,
} from "../libs/hts";
import { ElementSearchSummary } from "./ElementSearchSummary";
import { TertiaryLabel } from "./TertiaryLabel";
import { useHts } from "../contexts/HtsContext";
import { FuseResult } from "fuse.js";

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
      <div className="w-full h-96 flex gap-2 justify-center items-center">
        <TertiaryLabel value="No results yet, start a search above" />
        <span className="text-lg">👆</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      {results.map((result, index) => {
        const { item: element } = result;
        const sectionAndChapter = getSectionAndChapterFromChapterNumber(
          sections,
          Number(getChapterFromHtsElement(element, htsElements))
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
              console.log("clicked");
              // Clear search results and search query
              setSearchResults([]);
              setSearchValue("");
              setBreadcrumbs(breadcrumbs);
              setActiveTab(ExploreTab.ELEMENTS);
            }}
          />
        );
      })}
    </div>
  );
};
