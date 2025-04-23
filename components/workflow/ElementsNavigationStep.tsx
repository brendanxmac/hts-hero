import { Color } from "../../enums/style";
import { HtsLevelClassification } from "../../interfaces/hts";
import { classNames } from "../../utilities/style";
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

  return (
    <div
      className={classNames(
        "flex flex-col rounded-md px-2 py-4 gap-2 transition-all duration-200 ease-in-out",
        active && "bg-primary/80",
        !active && "hover:bg-primary/20"
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
