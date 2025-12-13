import { ClassificationProgression } from "../../interfaces/hts";
import { SidebarElementSummary } from "./SidebarElementSummary";
import { QueueListIcon } from "@heroicons/react/16/solid";

interface Props {
  onClick: () => void;
  active: boolean;
  index: number;
  classificationProgression: ClassificationProgression;
}

export const ElementsNavigationStep = ({
  classificationProgression,
  active,
  index,
  onClick,
}: Props) => {
  const { candidates, selection } = classificationProgression;

  if (selection) {
    return (
      <SidebarElementSummary
        element={selection}
        chapter={selection.chapter}
        isActive={active}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${
        active
          ? "bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/40 shadow-lg shadow-primary/10"
          : "bg-base-100 border border-base-content/10 hover:border-primary/30 hover:shadow-md"
      }`}
      onClick={onClick}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <div className="relative z-10 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <QueueListIcon className="w-3.5 h-3.5 text-primary/70" />
          <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
            Level {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-base-content/5 border border-base-content/10">
          <span className="text-xs font-medium text-base-content/60">
            {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"}
          </span>
        </div>
      </div>
    </div>
  );
};
