import { Color } from "../enums/style";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  uppercase?: boolean;
  color?: Color;
}

export const TertiaryLabel = ({
  value,
  color = Color.BASE_CONTENT,
  uppercase = false,
}: Props) => {
  return (
    <h3
      className={classNames(
        `text-${color} text-xs md:text-sm font-bold`,
        uppercase && "uppercase"
      )}
    >
      {value}
    </h3>
  );
};
