import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";

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
    <div className="min-w-full flex gap-4 items-center justify-between pt-4 pb-2 border-b border-base-300">
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
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
