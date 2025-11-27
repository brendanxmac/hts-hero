import { Color } from "../enums/style";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  uppercase?: boolean;
  color?: Color;
}

export const SecondaryLabel = ({
  value,
  uppercase = false,
  color = Color.BASE_CONTENT,
}: Props) => {
  return (
    <h3
      className={classNames(
        `text-${color} text-sm md:text-base font-bold`,
        uppercase && "uppercase"
      )}
    >
      {value}
    </h3>
  );
};
