import { Color } from "../../enums/style";
import { ClassificationProgression } from "../../interfaces/hts";
import { classNames } from "../../utilities/style";
import { TertiaryLabel } from "../TertiaryLabel";
import { SidebarElementSummary } from "./SidebarElementSummary";

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
      className={classNames(
        "bg-base-100 border-2 flex flex-col rounded-md p-4 gap-2 transition-all duration-200 ease-in-out hover:cursor-pointer shadow-sm",
        active
          ? "bg-primary/10 border-primary"
          : "border-base-content/50 hover:bg-base-300"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <TertiaryLabel
          value={`Level ${index + 1}`}
          color={Color.BASE_CONTENT}
        />
        <TertiaryLabel
          value={`${candidates.length} ${
            candidates.length === 1 ? "candidate" : "candidates"
          }`}
          color={Color.BASE_CONTENT}
        />
      </div>
    </div>
  );
};
