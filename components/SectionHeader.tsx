import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";
import { PrimaryLabel } from "./PrimaryLabel";

interface SectionHeaderProps {
  title: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SectionHeader = ({
  title,
  tabs,
  activeTab,
  onTabChange,
}: SectionHeaderProps) => {
  return (
    <div className="min-w-full flex gap-4 items-center justify-between">
      <PrimaryLabel value={title} />
      <div
        role="tablist"
        className="tabs tabs-boxed tabs-sm bg-primary-content p-1.5 rounded-xl"
      >
        {tabs.map((tab) => (
          <a
            key={tab.value}
            role="tab"
            onClick={() => onTabChange(tab.value)}
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
  );
};
