"use client";

import { useEffect, useState } from "react";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { HtsElementType, HtsSection } from "../interfaces/hts";
import { classNames } from "../utilities/style";
import { LoadingIndicator } from "./LoadingIndicator";
import { Elements, NavigatableElement } from "./Elements";
import { Notes } from "./Notes";

enum Tabs {
  NOTES = "notes",
  ELEMENTS = "elements",
}

interface Tab {
  label: string;
  value: string;
}

const tabs: Tab[] = [
  {
    label: "Elements",
    value: Tabs.ELEMENTS,
  },
  {
    label: "Notes",
    value: Tabs.NOTES,
  },
];

export const Explore = () => {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<HtsSection[]>([]);
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [breadcrumbs, setBreadcrumbs] = useState<NavigatableElement[]>([]);

  useEffect(() => {
    const fetchSectionsAndChapters = async () => {
      setLoading(true);
      const { sections } = await getHtsSectionsAndChapters();
      setSections(sections);
      setBreadcrumbs([
        {
          title: "Sections",
          element: {
            type: HtsElementType.SECTION,
            sections,
          },
        },
      ]);
      setLoading(false);
    };

    if (activeTab === Tabs.ELEMENTS && !sections.length) {
      fetchSectionsAndChapters();
    }
  }, [activeTab, sections]);

  return (
    <section className="grow h-full w-full overflow-auto flex flex-col items-center">
      <div className="grow w-full items-center flex flex-col gap-5">
        <div className="flex flex-col min-w-full">
          <div className="sticky top-0 bg-base-100 flex gap-6 items-center pb-3">
            <h2 className="text-xl md:text-2xl font-bold">Explorer</h2>
            <div
              role="tablist"
              className="tabs tabs-boxed tabs-sm bg-primary-content p-1.5 rounded-xl"
            >
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

          {loading && (
            <div className="flex justify-center items-center">
              <LoadingIndicator />
            </div>
          )}

          {activeTab === Tabs.ELEMENTS && (
            <Elements
              sections={sections}
              breadcrumbs={breadcrumbs}
              setBreadcrumbs={setBreadcrumbs}
            />
          )}

          {activeTab === Tabs.NOTES && <Notes />}
        </div>
      </div>
    </section>
  );
};
