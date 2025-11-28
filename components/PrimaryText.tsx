import { Color } from "../enums/style";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  uppercase?: boolean;
  color?: Color;
}

export const PrimaryText = ({
  value,
  color = Color.BASE_CONTENT,
  uppercase = false,
}: Props) => {
  return (
    <div className="flex items-center gap-2">
      <h2
        className={classNames(
          `text-${color} md:text-xl`,
          uppercase && "uppercase"
        )}
      >
        {value}
      </h2>
    </div>
  );
};
