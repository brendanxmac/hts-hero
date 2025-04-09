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
            "text-base-content dark:text-gray-300 font-bold sm:text-lg md:text-xl"
          }
        >
          {`${label}`}
        </h2>
      )}
      <h2
        className={"text-base-content dark:text-gray-300 sm:text-lg md:text-xl"}
      >
        {value}
      </h2>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
