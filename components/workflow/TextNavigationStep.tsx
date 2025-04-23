import { Color } from "../../enums/style";
import { classNames } from "../../utilities/style";
import { TertiaryLabel } from "../TertiaryLabel";
import { TertiaryText } from "../TertiaryText";

interface Button {
  label: string;
  onClick: () => void;
}

interface Props {
  title: string;
  text?: string;
  active: boolean;
  icon: React.ReactNode;
  button?: Button;
}

export const TextNavigationStep = ({
  title,
  text,
  active,
  icon,
  button,
}: Props) => {
  return (
    <div
      className={classNames(
        "flex flex-col rounded-md px-2 py-4 gap-2",
        active && "bg-primary/80"
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {icon}
          <TertiaryLabel
            value={title}
            color={active ? Color.WHITE : Color.NEUTRAL_CONTENT}
          />
        </div>
        {!active && button && (
          <button
            className="btn btn-sm btn-link hover:text-secondary hover:scale-105 transition-all duration-200 ease-in-out"
            onClick={button.onClick}
          >
            {button.label}
          </button>
        )}
      </div>
      {text && <TertiaryText value={text} color={Color.WHITE} />}
    </div>
  );
};
