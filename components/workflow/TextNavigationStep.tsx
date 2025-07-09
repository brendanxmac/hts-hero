import { Color } from "../../enums/style";
import { classNames } from "../../utilities/style";
import { PrimaryText } from "../PrimaryText";
import { SecondaryText } from "../SecondaryText";
import { TertiaryLabel } from "../TertiaryLabel";

interface Button {
  label: string;
  onClick: () => void;
}

interface Props {
  title: string;
  text?: string;
  large?: boolean;
  active: boolean;
  icon?: JSX.Element;
  button?: Button;
  showButton?: boolean;
}

export const TextNavigationStep = ({
  title,
  text,
  large,
  active,
  icon,
  button,
}: Props) => {
  return (
    <div
      className={classNames(
        "flex flex-col rounded-md gap-2 p-3 border-2 border-neutral-content/40 hover:cursor-pointer",
        active && "bg-primary/80 transition-all duration-300 ease-in-out",
        !text && "py-4",
        !active && "hover:bg-primary/40"
      )}
      onClick={() => {
        button.onClick();
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          {icon && icon}
          <TertiaryLabel
            value={title}
            color={active ? Color.WHITE : Color.NEUTRAL_CONTENT}
          />
        </div>
        {/* {!active && button && showButton && (
          <button
            className="btn btn-xs btn-link hover:text-secondary hover:scale-105 transition-all duration-200 ease-in-out"
            onClick={button.onClick}
          >
            {button.label}
          </button>
        )} */}
      </div>
      {text ? (
        large ? (
          <PrimaryText value={text} color={Color.WHITE} />
        ) : (
          <SecondaryText value={text} color={Color.WHITE} />
        )
      ) : null}
    </div>
  );
};
