import { Color } from "../enums/style";
import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
  color?: Color;
  copyable?: boolean;
  capitalize?: boolean;
}

export const TertiaryText = ({
  value,
  copyable,
  color = Color.BASE_CONTENT,
  capitalize = false,
}: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h3 className={`text-${color} text-xs md:text-sm`}>
        {capitalize ? value.toUpperCase() : value}
      </h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
