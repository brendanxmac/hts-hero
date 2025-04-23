"use client";

import { useEffect, useState } from "react";
import { LoadingIndicator } from "./LoadingIndicator";
import { Elements } from "./Elements";
import { Notes } from "./Notes";
import { Tab } from "../interfaces/tab";
import { SectionHeader } from "./SectionHeader";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";
import { useHtsSections } from "../contexts/HtsSectionsContext";
import { Navigatable } from "../interfaces/hts";

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
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections, loading, getSections } = useHtsSections();

  useEffect(() => {
    if (activeTab !== Tabs.ELEMENTS) {
      setActiveTab(Tabs.ELEMENTS);
    }
  }, [breadcrumbs]);

  useEffect(() => {
    const initializeSections = async () => {
      console.log("sections", sections);
      if (sections.length === 0) {
        await getSections();
      }
      if (breadcrumbs.length === 0) {
        setBreadcrumbs([
          {
            title: "Sections",
            element: {
              type: Navigatable.SECTIONS,
              sections,
            },
          },
        ]);
      }
    };
    initializeSections();
  }, [activeTab]);

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <SectionHeader
        title="Explore"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="h-full grow flex flex-col gap-4 overflow-y-auto">
        {loading && <LoadingIndicator text="Loading Sections" />}
        {!loading && activeTab === Tabs.ELEMENTS && (
          <Elements sections={sections} />
        )}
        {!loading && activeTab === Tabs.NOTES && <Notes />}
      </div>
    </div>
  );
};
