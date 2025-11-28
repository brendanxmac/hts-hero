import { Color } from "../enums/style";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  uppercase?: boolean;
  color?: Color;
}

export const SecondaryText = ({
  value,
  uppercase = false,
  color = Color.BASE_CONTENT,
}: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h3
        className={classNames(
          `text-${color} text-sm md:text-base whitespace-pre-wrap`,
          uppercase && "uppercase"
        )}
      >
        {value}
      </h3>
    </div>
  );
};
