import { ClassifyTab } from "../enums/classify";
import { IconTab } from "../interfaces/tab";
import { CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/16/solid";

export const ClassifyTabs: IconTab<ClassifyTab>[] = [
  {
    value: ClassifyTab.CLASSIFY,
    icon: <CheckIcon className="w-5 h-5" />,
    text: "Select",
  },
  {
    value: ClassifyTab.EXPLORE,
    icon: <MagnifyingGlassIcon className="w-5 h-5" />,
    text: "Search",
  },
];
