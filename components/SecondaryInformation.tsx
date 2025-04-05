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
          "font-bold text-xs md:text-sm",
          loud ? "text-primary" : "text-base-content"
        )}
      >
        {value}
      </h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
