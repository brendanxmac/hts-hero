import { classNames } from "../utilities/style";
import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
  copyable?: boolean;
  loud?: boolean;
}

export const PrimaryInformation = ({
  value,
  loud = false,
  copyable = true,
}: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h2
        className={classNames(
          "text-base-content",
          "font-bold text-sm md:text-base"
        )}
      >
        {value}
      </h2>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
