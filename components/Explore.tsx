"use client";

import { useEffect, useState } from "react";
import { getHtsSectionsAndChapters } from "../libs/hts";
import { HtsElementType, HtsSection } from "../interfaces/hts";
import { LoadingIndicator } from "./LoadingIndicator";
import { Elements, NavigatableElement } from "./Elements";
import { Notes } from "./Notes";
import { Tab } from "../interfaces/tab";
import { SectionHeader } from "./SectionHeader";
import { classNames } from "../utilities/style";
import { useBreadcrumbs } from "../contexts/BreadcrumbsContext";

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
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    const fetchSectionsAndChapters = async () => {
      setLoading(true);
      const { sections } = await getHtsSectionsAndChapters();
      setSections(sections);
      setBreadcrumbs([
        {
          title: "Sections",
          element: { type: HtsElementType.SECTION, sections },
        },
      ]);
      setLoading(false);
    };

    if (activeTab === Tabs.ELEMENTS && !sections.length) {
      fetchSectionsAndChapters();
    }
  }, [activeTab, sections]);

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
