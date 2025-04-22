import { Color } from "../../enums/style";
import { classNames } from "../../utilities/style";
import { TertiaryLabel } from "../TertiaryLabel";
import { TertiaryText } from "../TertiaryText";

interface Props {
  title: string;
  text?: string;
  active: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const TextNavigationStep = ({
  title,
  text,
  active,
  icon,
  onClick,
}: Props) => {
  return (
    <div
      className={classNames(
        "flex flex-col rounded-md px-2 py-4 gap-2 transition-all duration-200 ease-in-out",
        text && "bg-none",
        active && "bg-primary/80",
        text && !active && "hover:bg-primary/20"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {icon}
          <TertiaryLabel
            value={title}
            color={active ? Color.WHITE : Color.NEUTRAL_CONTENT}
          />
        </div>
      </div>
      {text && <TertiaryText value={text} color={Color.WHITE} />}
    </div>
  );
};
