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
        "bg-base-100 border-2 border-neutral-content/40 hover:bg-base-200 flex flex-col rounded-md p-4 gap-2 transition-all duration-200 ease-in-out hover:cursor-pointer",
        active && "bg-primary border border-neutral hover:bg-primary"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <TertiaryLabel
          value={`Level ${index + 1}`}
          color={active ? Color.WHITE : Color.NEUTRAL_CONTENT}
        />
        <TertiaryLabel
          value={`${candidates.length} ${
            candidates.length === 1 ? "candidate" : "candidates"
          }`}
          color={active ? Color.WHITE : Color.NEUTRAL_CONTENT}
        />
      </div>
    </div>
  );
};
