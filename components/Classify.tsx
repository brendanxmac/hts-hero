"use client";

import { useState } from "react";
import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";
import TextInput from "./TextInput";

enum Tabs {
  COMPLETED = "completed",
  IN_PROGRESS = "in-progress",
}

const tabs: Tab[] = [
  {
    label: "Completed",
    value: Tabs.COMPLETED,
  },
  {
    label: "In Progress",
    value: Tabs.IN_PROGRESS,
  },
];

export const Classify = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  return (
    <section className="grow h-full w-full overflow-auto flex flex-col items-center">
      <div className="flex flex-col min-w-full">
        <div className="sticky top-0 flex gap-6 items-center bg-base-100">
          <h2 className="text-xl md:text-2xl font-bold">Classify</h2>
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
        <TextInput
          label="Product Description"
          placeholder="Enter product description"
          setProductDescription={() => {}}
        />
        <TextInput
          label="Product Analysis"
          placeholder="Enter product analysis"
          setProductDescription={() => {}}
        />
      </div>
    </section>
  );
};
