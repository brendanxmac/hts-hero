import { classNames } from "../utilities/style";
import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
  loud?: boolean;
  copyable?: boolean;
}

export const SecondaryInformation = ({ value, loud, copyable }: Props) => {
  return (
    <div className="flex gap-2 items-center">
      <h3
        className={classNames(
          "text-xs md:text-sm text-base-content",
          loud && "font-bold"
        )}
      >
        {value}
      </h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
