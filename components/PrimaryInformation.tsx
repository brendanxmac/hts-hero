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
          loud ? "text-[#40C969]" : "text-white",
          "font-bold text-xl md:text-2xl"
        )}
      >
        {value}
      </h2>
      {copyable && <TextCopyButton value={value} />}
    </div>
  );
};
