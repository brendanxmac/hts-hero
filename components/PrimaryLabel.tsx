import { Color } from "../enums/style";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  uppercase?: boolean;
  color?: Color;
}

export const PrimaryLabel = ({
  value,
  color = Color.BASE_CONTENT,
  uppercase = false,
}: Props) => {
  return (
    <h2
      className={classNames(
        `text-${color} font-bold md:text-xl`,
        uppercase && "uppercase"
      )}
    >
      {value}
    </h2>
  );
};
