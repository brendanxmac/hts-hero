import { classNames } from "../utilities/style";
import { TextCopyButton } from "./Copy";

interface Props {
  label?: string;
  value: string;
  loud?: boolean;
  copyable?: boolean;
}

export const TertiaryInformation = ({
  value,
  loud,
  copyable,
  label,
}: Props) => {
  return (
    <div className="flex gap-2 items-center">
      {label && (
        <h3
          className={classNames(
            "text-xs sm:text-sm font-bold",
            loud ? "text-secondary" : "text-base-content"
          )}
        >
          {label}
        </h3>
      )}
      <h3
        className={classNames(
          "text-xs sm:text-sm",
          loud ? "text-secondary" : "text-base-content"
        )}
      >
        {value}
      </h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
