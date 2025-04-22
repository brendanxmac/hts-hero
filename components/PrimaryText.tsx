import { Color } from "../enums/style";
import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
  copyable?: boolean;
  color?: Color;
}

export const PrimaryText = ({
  value,
  color = Color.NEUTRAL_CONTENT,
  copyable = false,
}: Props) => {
  return (
    <div className="flex items-center gap-2">
      <h2 className={`text-${color} md:text-xl`}>{value}</h2>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
