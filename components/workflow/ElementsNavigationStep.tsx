import { Color } from "../../enums/style";
import { HtsLevelClassification } from "../../interfaces/hts";
import { classNames } from "../../utilities/style";
import { ElementSum } from "../ElementSum";
import { TertiaryLabel } from "../TertiaryLabel";

interface Props {
  onClick: () => void;
  active: boolean;
  classificationLevel: HtsLevelClassification;
}

export const ClassificationLevelNavigationStep = ({
  classificationLevel,
  active,
  onClick,
}: Props) => {
  const { levelName, candidates, reasoning, selection } = classificationLevel;

  if (!active && selection) {
    // FIXME: This onclick does not work cause the element sums onclick takes priority
    return (
      <div onClick={onClick}>
        <ElementSum element={selection} chapter={selection.chapter} isSidebar />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "bg-base-100 border border-neutral flex flex-col rounded-md p-4 gap-2 transition-all duration-200 ease-in-out ",
        active && "bg-primary/80",
        !active && "hover:bg-neutral"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <TertiaryLabel
          value={levelName}
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
