import { classNames } from "../utilities/style";
import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
  loud?: boolean;
  copyable?: boolean;
}

export const TertiaryInformation = ({ value, loud, copyable }: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h3
        className={classNames(
          "text-xs",
          loud ? "text-accent" : "text-base-content"
        )}
      >
        {value}
      </h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
