"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  getBestChaptersForProductDescription,
  getHtsChapterData,
  getHtsSectionsAndChapters,
  getElementsAtIndentLevel,
} from "../libs/hts";
import { Cell } from "./Cell";
import { LoadingIndicator } from "./LoadingIndicator";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { Chapter, ChapterI } from "./ChapterOriginal";

interface Props {
  productDescription: string;
  setProductDescription: Dispatch<SetStateAction<string>>;
}

export const ExploreAuto = ({ productDescription }: Props) => {
  const [loading, setLoading] = useState(true);
  const [bestChapters, setBestChapters] = useState<number[]>([]);
  const [chapters, setChapters] = useState<ChapterI[]>([]);
  const getBestChapters = async () => {
    const bestChaptersResponse =
      await getBestChaptersForProductDescription(productDescription);
    setBestChapters(bestChaptersResponse.chapters);
  };

  const getChapterBases = async () => {
    const sectionsAndChapters = await getHtsSectionsAndChapters();
    const chapters = sectionsAndChapters.sections
      .map((section) => section.chapters)
      .flat();

    return bestChapters.map((c) => chapters[c - 1]);
  };

  const getChapterData = async () => {
    const chapterBases = await getChapterBases();
    const chapters = await Promise.all(
      chapterBases.map(async (chapter) => {
        const chapterData = await getHtsChapterData(String(chapter.number));
        return {
          ...chapter,
          elements: chapterData,
        };
      })
    );

    const chaptersWithHeadings = chapters.map((chapter) => {
      return {
        ...chapter,
        // 0 = Headings Level
        headings: getElementsAtIndentLevel(chapter.elements, 0),
      };
    });

    setChapters(chaptersWithHeadings);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getBestChapters();
  }, [productDescription]);

  useEffect(() => {
    if (bestChapters.length > 0) {
      setLoading(true);
      getChapterData();
    }
  }, [bestChapters]);

  return (
    <section className="grow h-full w-full overflow-auto flex flex-col items-center">
      <div className="grow w-full mt-2 items-center flex flex-col max-w-3xl gap-5">
        {/* <div className="w-full bg-black bg-opacity-95 pb-4 border-b border-neutral-800 shadow-neutral-600">
          <ProductDescriptionHeader description={productDescription} />
        </div> */}
        <div className="flex flex-col min-w-full gap-2">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => console.log("Back Clicked")}
              type="button"
              className="bg-neutral-700 hover:text-black hover:bg-white shrink-0 h-6 w-6 p-1 rounded-full flex items-center justify-center text-sm font-bold text-white"
            >
              <ArrowLeftIcon className={"h-6 w-6"} />
            </button>
            <h2 className="text-2xl font-bold">Chapters</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            Below is the list of HTS Chapters that your product is likely to be
            classified into, sorted by most to least likely.
          </p>
          {loading && (
            <div className="mt-5">
              <LoadingIndicator text="Fetching Best Chapters" />
            </div>
          )}
          {!loading &&
            chapters.length > 0 &&
            chapters.map((chapter) => {
              return (
                <Cell key={chapter.number}>
                  <Chapter chapter={chapter} />
                </Cell>
              );
            })}
        </div>
      </div>
    </section>
  );
};
