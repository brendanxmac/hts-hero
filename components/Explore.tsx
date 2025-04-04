"use client";

import { useEffect, useState } from "react";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { Cell } from "./Cell";
import { HtsSection } from "../interfaces/hts";
import { classNames } from "../utilities/style";
import { Section } from "./Section";
import { LoadingIndicator } from "./LabelledLoader";

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

export const Explore = () => {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<HtsSection[]>([]);
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  useEffect(() => {
    const fetchSectionsAndChapters = async () => {
      setLoading(true);
      const { sections } = await getHtsSectionsAndChapters();
      setSections(sections);
      setLoading(false);
    };

    fetchSectionsAndChapters();
  }, []);

  return (
    <section className="grow h-full w-full overflow-auto flex flex-col items-center p-3">
      <div className="grow w-full mt-2 items-center flex flex-col gap-5">
        <div className="flex flex-col min-w-full gap-4">
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-bold">Explorer</h2>
            <div
              role="tablist"
              className="tabs tabs-boxed tabs-xs bg-primary-content p-1.5 rounded-xl"
            >
              {tabs.map((tab) => (
                <a
                  key={tab.value}
                  role="tab"
                  onClick={() => setActiveTab(tab.value)}
                  className={classNames(
                    "tab font-bold",
                    tab.value === activeTab && "tab-active"
                  )}
                >
                  {tab.label}
                </a>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center">
              <LoadingIndicator />
            </div>
          )}

          {sections.length > 0 && (
            <div className="flex flex-col gap-2">
              {sections.map((section) => {
                return (
                  <Cell key={section.number}>
                    <Section section={section} />
                  </Cell>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
