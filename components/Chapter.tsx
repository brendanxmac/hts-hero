import { HtsElement, HtsSectionAndChapterBase } from "../interfaces/hts";
import { useState, useMemo } from "react";
import {
  getDirectChildrenElements,
  getElementsAtIndentLevel,
  getElementsInChapter,
} from "../libs/hts";
import { ElementSummary } from "./ElementSummary";
import {
  DocumentTextIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import PDF from "./PDF";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { ButtonWithIcon } from "./ButtonWithIcon";
import { SecondaryLabel } from "./SecondaryLabel";
import { useHts } from "../contexts/HtsContext";
import { SupabaseBuckets } from "../constants/supabase";
import Fuse, { IFuseOptions } from "fuse.js";

interface Props {
  chapter: HtsSectionAndChapterBase;
}

export const Chapter = ({ chapter }: Props) => {
  const { number, description, filePath: notesPath } = chapter;
  const { htsElements } = useHts();
  const [showNotes, setShowNotes] = useState(false);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const chapterElements = getElementsInChapter(htsElements, number);
  const elementsAtIndentLevel = chapterElements
    ? getElementsAtIndentLevel(chapterElements, 0)
    : [];
  const elementsWithChildrenAdded = elementsAtIndentLevel.map((element) => {
    const directChildrenElements = getDirectChildrenElements(
      element,
      chapterElements || []
    );

    return {
      ...element,
      children: directChildrenElements,
    };
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Fuse.js configuration for searching
  const fuseOptions: IFuseOptions<HtsElement> = {
    keys: ["htsno", "description"],
    threshold: 0.1,
    ignoreLocation: true,
    findAllMatches: true,
  };

  // Filter elements based on search query
  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) {
      return elementsWithChildrenAdded;
    }

    const fuse = new Fuse(elementsWithChildrenAdded, fuseOptions);
    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [elementsWithChildrenAdded, searchQuery]);

  return (
    <div className="card flex flex-col w-full gap-6 rounded-xl bg-base-100 border border-base-content/10 p-4 pt-2 sm:pt-6 transition duration-100 ease-in-out">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <SecondaryLabel value={`Chapter ${number.toString()}`} />
          <ButtonWithIcon
            icon={<DocumentTextIcon className="h-4 w-4" />}
            label={`Chapter ${number.toString()} Notes`}
            onClick={() => setShowNotes(!showNotes)}
          />
        </div>
        <h2 className="text-sm md:text-xl font-bold text-white">
          {description}
        </h2>
      </div>

      <div className="flex flex-col gap-2 bg-base-100">
        <div className="w-full flex justify-between items-end gap-4">
          <SecondaryLabel value="Headings" />
          {/* Filter Bar */}
          <div className="flex-1 relative md:max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by description or code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1 bg-base-100 border-2 border-base-content/20 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-link btn-sm text-xs hover:text-secondary no-underline"
                >
                  clear
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {filteredElements.map((element, i) => {
            return (
              <ElementSummary
                key={`${i}-${element.htsno}`}
                element={element}
                onClick={() => {
                  setBreadcrumbs([
                    ...breadcrumbs,
                    {
                      title: `${element.htsno || element.description.split(" ").slice(0, 2).join(" ") + "..."}`,
                      element: {
                        ...element,
                        chapter: chapter.number,
                      },
                    },
                  ]);
                }}
              />
            );
          })}
        </div>
      </div>
      {showNotes && (
        <PDF
          title={`Chapter ${number.toString()} Notes`}
          bucket={SupabaseBuckets.NOTES}
          filePath={notesPath}
          isOpen={showNotes}
          setIsOpen={setShowNotes}
        />
      )}
    </div>
  );
};
