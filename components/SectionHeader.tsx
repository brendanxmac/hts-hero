import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";
import { PrimaryLabel } from "./PrimaryLabel";
import { SearchBar } from "./SearchBar";

interface SectionHeaderProps {
  title: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearch: (value: string) => void;
}

export const SectionHeader = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  onSearch,
}: SectionHeaderProps) => {
  return (
    <div className="flex gap-4 items-center justify-between flex-col sm:flex-row">
      <div className="flex gap-4 items-center">
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
                "tab transition-all duration-200 ease-in",
                tab.value === activeTab && "tab-active font-semibold"
              )}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>
      <div className="w-full max-w-xs">
        <SearchBar
          placeholder="Search Elements"
          onSearch={(value) => onSearch(value)}
        />
      </div>
    </div>
  );
};
