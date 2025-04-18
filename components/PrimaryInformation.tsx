import { classNames } from "../utilities/style";
import { TextCopyButton } from "./Copy";

interface Props {
  label?: string;
  value: string;
  copyable?: boolean;
  loud?: boolean;
}

export const PrimaryInformation = ({
  value,
  label,
  loud = false,
  copyable = false,
}: Props) => {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <h2
          className={classNames(
            loud ? "text-secondary" : "text-base-content dark:text-white",
            "font-bold sm:text-lg lg:text-xl"
          )}
        >
          {`${label}`}
        </h2>
      )}
      <h2
        className={classNames(
          loud ? "text-secondary" : "text-base-content dark:text-white",
          "sm:text-lg lg:text-xl"
        )}
      >
        {value}
      </h2>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
