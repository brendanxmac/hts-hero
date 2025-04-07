import { TextCopyButton } from "./Copy";

interface Props {
  label?: string;
  value: string;
  copyable?: boolean;
}

export const PrimaryInformation = ({
  value,
  label,
  copyable = true,
}: Props) => {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <h2
          className={
            "text-base-content dark:text-gray-300 font-semibold md:text-lg"
          }
        >
          {`${label}:`}
        </h2>
      )}
      <h2 className={"text-base-content dark:text-gray-300 md:text-lg"}>
        {value}
      </h2>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
