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
        "flex flex-col rounded-md gap-2 p-3 border hover:cursor-pointer shadow-sm bg-base-100",
        active ? "bg-primary/10 border-primary" : "border-base-content/80",
        !text && "py-4",
        !active && "hover:bg-primary/5"
      )}
      onClick={() => {
        button.onClick();
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          {icon && icon}
          <TertiaryLabel value={title} color={Color.BASE_CONTENT} />
        </div>
      </div>
      {text ? (
        large ? (
          <PrimaryText value={text} color={Color.BASE_CONTENT} />
        ) : (
          <SecondaryText value={text} color={Color.BASE_CONTENT} />
        )
      ) : null}
    </div>
  );
};
