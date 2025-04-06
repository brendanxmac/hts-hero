"use client";

import { useEffect, useState } from "react";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { Cell } from "./Cell";
import { HtsSection } from "../interfaces/hts";
import { classNames } from "../utilities/style";
import { Section } from "./Section";
import { LoadingIndicator } from "./LabelledLoader";
import { Note } from "./Note";
import { notes } from "../public/notes/notes";

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
    label: "Notes",
    value: Tabs.NOTES,
  },
  {
    label: "Elements",
    value: Tabs.ELEMENTS,
  },
];

export const Explore = () => {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<HtsSection[]>([]);
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  useEffect(() => {
    const fetchSectionsAndChapters = async () => {
      setLoading(true);
      const { sections } = await getHtsSectionsAndChapters();
      setSections(sections);
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
            <div className="flex flex-col">
              {sections.length > 0 && (
                <div className="flex flex-col">
                  {sections.map((section) => {
                    return (
                      <Section
                        key={`section-${section.number}`}
                        section={section}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === Tabs.NOTES && (
            <div className="flex flex-col gap-2 mt-4">
              {notes.length > 0 && (
                <div className="flex flex-col gap-3">
                  {notes.map((note) => {
                    return <Note key={`note-${note.title}`} note={note} />;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
