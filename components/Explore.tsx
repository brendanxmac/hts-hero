"use client";

import { useEffect, useState } from "react";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { HtsElementType, HtsSection } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Elements, NavigatableElement } from "./Elements";
import { Notes } from "./Notes";
import { Tab } from "../interfaces/tab";
import { SectionHeader } from "./SectionHeader";

enum Tabs {
  NOTES = "notes",
  ELEMENTS = "elements",
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
    <section className="grow h-full min-w-full overflow-auto flex flex-col items-start">
      <div className="min-w-full flex flex-col gap-4">
        <SectionHeader
          title="Explorer"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

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
    </section>
  );
};
