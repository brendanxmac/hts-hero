import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { generateBreadcrumbsForHtsElement } from "../libs/hts";
import { useChapters } from "../contexts/ChaptersContext";
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

interface Props {
  searchString: string;
  results: HtsElement[];
  setActiveTab: (tab: ExploreTab) => void;
}

export const SearchResults = ({
  results,
  searchString,
  setActiveTab,
}: Props) => {
  const { getChapterElements } = useChapters();
  const { sections } = useHtsSections();
  const { setBreadcrumbs } = useBreadcrumbs();

  if (results.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col gap-4 justify-center items-center">
        <TertiaryLabel value="No results yet, start a search above" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="w-full flex justify-between">
        <p>
          Results for <span className="font-bold">{`"${searchString}"`}</span>
        </p>
        <button className="btn btn-xs btn-outline">
          Search Synonyms (TODO)
        </button>
      </div>

      {results.map((result, index) => {
        const sectionAndChapter = getSectionAndChapterFromChapterNumber(
          sections,
          Number(
            getChapterFromHtsElement(
              result,
              getHtsElementParents(result, getChapterElements(0))
            )
          )
        );
        const parents = getHtsElementParents(result, getChapterElements(0));
        const breadcrumbs = generateBreadcrumbsForHtsElement(
          result,
          sections,
          sectionAndChapter.chapter,
          [...parents, result]
        );

        return (
          <ElementSearchSummary
            key={`search-result-${index}`}
            element={result}
            sectionAndChapter={sectionAndChapter}
            parents={parents}
            onClick={() => {
              setBreadcrumbs(breadcrumbs);
              setActiveTab(ExploreTab.ELEMENTS);
            }}
          />
        );
      })}
    </div>
  );
};
