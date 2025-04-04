"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  getBestChaptersForProductDescription,
  getHtsChapterData,
  getHtsSectionsAndChapters,
  getElementsAtIndentLevel,
} from "../libs/hts";
import { Cell } from "./Cell";
import { LoadingIndicator } from "./LabelledLoader";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { Chapter, ChapterI } from "./Chapter";
import { HtsSection } from "../interfaces/hts";
import { Section } from "./Section";
import { classNames } from "../utilities/style";

interface Props {
  productDescription: string;
  setProductDescription: Dispatch<SetStateAction<string>>;
}

const tabs = [
  {
    label: "Notes",
    value: "notes",
  },
  {
    label: "Elements",
    value: "elements",
  },
];

export const Explore = ({ productDescription }: Props) => {
  // const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<HtsSection[]>([]);
  const [chapters, setChapters] = useState<ChapterI[]>([]);
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  return (
    <section className="grow h-full w-full overflow-auto flex flex-col items-center">
      <div className="grow w-full mt-2 items-center flex flex-col max-w-3xl gap-5">
        <div className="flex flex-col min-w-full gap-2">
          <div className="flex gap-2 items-center">
            <h2 className="text-2xl font-bold">HTS Explorer</h2>
            <div role="tablist" className="tabs tabs-boxed">
              {tabs.map((tab) => (
                <a
                  key={tab.value}
                  role="tab"
                  onClick={() => setActiveTab(tab.value)}
                  className={classNames(
                    "tab",
                    tab.value === activeTab && "tab-active"
                  )}
                >
                  {tab.label}
                </a>
              ))}
            </div>
          </div>

          {sections.length > 0 &&
            sections.map((section) => {
              return (
                <Cell key={section.number}>
                  <Section section={section} />
                </Cell>
              );
            })}
        </div>
      </div>
    </section>
  );
};
