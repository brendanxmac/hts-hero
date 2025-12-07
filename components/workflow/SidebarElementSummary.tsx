import { HtsElement } from "../../interfaces/hts";
import { CheckCircleIcon } from "@heroicons/react/16/solid";

interface Props {
  isActive: boolean;
  element: HtsElement;
  chapter: number;
  onClick: () => void;
}

export const SidebarElementSummary = ({
  isActive,
  element,
  onClick,
}: Props) => {
  const { htsno, description } = element;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/40 shadow-lg shadow-primary/10"
          : "bg-base-100 border border-base-content/10 hover:border-primary/30 hover:shadow-md"
      }`}
      onClick={onClick}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <div className="relative z-10 p-3">
        {htsno && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">{htsno}</span>
          </div>
        )}
        <p className="text-sm text-base-content/80 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};
