import { classNames } from "../utilities/style";
import { TextCopyButton } from "./Copy";

interface Props {
  value: string;
  label?: string;
  loud?: boolean;
  copyable?: boolean;
}

export const SecondaryInformation = ({
  value,
  copyable,
  label,
  loud,
}: Props) => {
  return (
    <div className="flex gap-2 items-center justify-between">
      {label && (
        <h3 className={"text-xs md:text-sm text-base-content font-bold"}>
          {`${label}`}
        </h3>
      )}
      <h3
        className={classNames(
          "text-xs md:text-sm text-base-content",
          loud && "text-secondary"
        )}
      >
        {value}
      </h3>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
