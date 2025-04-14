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
  const { setBreadcrumbs } = useBreadcrumbs();
  const { sections, loading, getSections } = useHtsSections();

  useEffect(() => {
    const initializeSections = async () => {
      const sections = await getSections();
      if (sections.length > 0) {
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
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Explore"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="flex flex-col gap-4">
        {loading && <LoadingIndicator text="Loading Sections" />}
        {!loading && activeTab === Tabs.ELEMENTS && (
          <Elements sections={sections} />
        )}
        {!loading && activeTab === Tabs.NOTES && <Notes />}
      </div>
    </div>
  );
};
