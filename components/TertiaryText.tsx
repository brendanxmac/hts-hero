import { Color } from "../enums/style";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  uppercase?: boolean;
  color?: Color;
  capitalize?: boolean;
}

export const TertiaryText = ({
  value,
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
    </div>
  );
};
