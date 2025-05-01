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
import { ExploreTab } from "../enums/explore";

const ExploreTabs: Tab[] = [
  {
    label: "Elements",
    value: ExploreTab.ELEMENTS,
  },
  {
    label: "Notes",
    value: ExploreTab.NOTES,
  },
];

export const Explore = () => {
  const [activeTab, setActiveTab] = useState(ExploreTabs[0].value);
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();
  const { sections, loading, getSections } = useHtsSections();

  useEffect(() => {
    if (activeTab !== ExploreTab.ELEMENTS) {
      setActiveTab(ExploreTab.ELEMENTS);
    }
  }, [breadcrumbs]);

  useEffect(() => {
    const initializeSections = async () => {
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
        tabs={ExploreTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="h-full grow flex flex-col gap-4 overflow-y-auto">
        {loading && <LoadingIndicator text="Loading Sections" />}
        {!loading && activeTab === ExploreTab.ELEMENTS && (
          <Elements sections={sections} />
        )}
        {!loading && activeTab === ExploreTab.NOTES && <Notes />}
      </div>
    </div>
  );
};
