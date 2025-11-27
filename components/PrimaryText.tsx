import { Color } from "../enums/style";
import { TextCopyButton } from "./Copy";
import { classNames } from "../utilities/style";

interface Props {
  value: string;
  uppercase?: boolean;
  copyable?: boolean;
  color?: Color;
}

export const PrimaryText = ({
  value,
  color = Color.BASE_CONTENT,
  copyable = false,
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
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
