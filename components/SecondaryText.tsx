import { TextCopyButton } from "./Copy";
import { Color } from "../enums/style";

interface Props {
  value: string;
  color?: Color;
  copyable?: boolean;
}

export const SecondaryText = ({
  value,
  copyable,
  color = Color.NEUTRAL_CONTENT,
}: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h3
        className={`text-${color} text-sm md:text-base lg:text-lg whitespace-pre-wrap`}
      >
        {value}
      </h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
