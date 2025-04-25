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
    // TODO: might need to wrap this in a clickable div that will change classification level
    return <ElementSum element={selection} chapter={selection.chapter} />;
  }

  return (
    <div
      className={classNames(
        "bg-base-100 border border-neutral flex flex-col rounded-md px-2 py-4 gap-2 transition-all duration-200 ease-in-out ",
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
