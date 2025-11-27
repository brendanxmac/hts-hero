import { Color } from "../enums/style";
import { TextCopyButton } from "./Copy";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  uppercase?: boolean;
  color?: Color;
  copyable?: boolean;
  capitalize?: boolean;
}

export const TertiaryText = ({
  value,
  copyable,
  uppercase = false,
  color = Color.BASE_CONTENT,
  capitalize = false,
}: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h3
        className={classNames(
          `text-${color} text-xs md:text-sm`,
          uppercase && "uppercase"
        )}
      >
        {capitalize ? value.toUpperCase() : value}
      </h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
