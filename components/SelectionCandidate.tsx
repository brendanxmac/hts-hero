// import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { CheckIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { classNames } from "../utilities/style";

interface Props {
  code: string;
  description: string;
  selected: boolean;
}

export const SelectionCandidate = ({ code, description, selected }: Props) => {
  return (
    <div
      className={classNames(
        "flex gap-2 items-center bg-opacity-20 p-2 rounded-md",
        selected ? "bg-[#40C969]" : "bg-neutral-500"
      )}
    >
      {selected ? (
        <CheckIcon className="shink-0 h-6 w-6 text-[#319c51] font-bold" />
      ) : (
        <XMarkIcon className="shrink-0 h-5 6-6 text-neutral-600" />
      )}
      {/* <div
        className={classNames(
          "shrink-0 rounded-full h-7 w-7 flex items-center justify-center",
          selected ? `bg-[#319c51] bg-opacity-50` : `bg-neutral-900`
        )}
      ></div> */}
      <div>
        <h3
          className={classNames(
            "font-bold",
            selected ? "text-white" : "text-neutral-500"
          )}
        >
          {code}
        </h3>
        <h3
          className={classNames(
            "text-sm",
            selected ? "text-white" : "text-neutral-500"
          )}
        >
          {description}
        </h3>
      </div>
    </div>
  );
};
