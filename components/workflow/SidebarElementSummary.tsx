import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { HtsElement } from "../../interfaces/hts";
import { TertiaryText } from "../TertiaryText";
import { Color } from "../../enums/style";
import { SecondaryLabel } from "../SecondaryLabel";
import { classNames } from "../../utilities/style";

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
      className={classNames(
        "w-full flex justify-between items-center rounded-md bg-base-100 border-2 border-neutral px-4 py-2",
        isActive && "bg-primary/80",
        !isActive && "hover:cursor-pointer hover:bg-primary/40"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="w-full flex flex-col items-start justify-between gap-1">
          {htsno && (
            <div className="min-w-20 md:min-w-32">
              <TertiaryText
                value={htsno}
                color={isActive ? Color.WHITE : Color.NEUTRAL_CONTENT}
              />
            </div>
          )}

          <div className="w-full flex items-center justify-between gap-2">
            <SecondaryLabel value={description} color={Color.WHITE} />
          </div>
        </div>
      </div>

      <ChevronRightIcon
        className={classNames(
          "shrink-0 w-5 h-5 text-primary",
          isActive && "text-white"
        )}
      />
    </div>
  );
};
