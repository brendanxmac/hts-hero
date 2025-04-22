import { Color } from "../enums/style";
import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
  color?: Color;
  copyable?: boolean;
}

export const TertiaryText = ({
  value,
  copyable,
  color = Color.NEUTRAL_CONTENT,
}: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h3 className={`text-${color} text-xs md:text-sm`}>{value}</h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
