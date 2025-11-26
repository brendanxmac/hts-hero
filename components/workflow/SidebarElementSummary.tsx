import { HtsElement } from "../../interfaces/hts";
import { Color } from "../../enums/style";
import { classNames } from "../../utilities/style";
import { SecondaryText } from "../SecondaryText";
import { TertiaryLabel } from "../TertiaryLabel";

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
        "w-full flex justify-between items-center rounded-md bg-base-100 border-2 px-4 py-2 hover:cursor-pointer shadow-sm",
        isActive
          ? "bg-primary/10 border-primary"
          : "border-base-content hover:bg-base-300"
      )}
      onClick={onClick}
    >
      <div className="w-full flex flex-col items-start justify-between gap-1">
        {htsno && (
          <div className="min-w-20 md:min-w-32">
            <TertiaryLabel value={htsno} color={Color.BASE_CONTENT} />
          </div>
        )}

        <div className="w-full flex items-center justify-between gap-2">
          <SecondaryText value={description} color={Color.BASE_CONTENT} />
        </div>
      </div>
    </div>
  );
};
