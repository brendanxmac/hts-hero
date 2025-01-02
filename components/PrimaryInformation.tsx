import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { copyToClipboard } from "../utilities/data";
import { useState } from "react";

interface Props {
  value: string;
  copyable?: boolean;
}

export const PrimaryInformation = ({ value, copyable = true }: Props) => {
  const [recentlyCopied, setRecentlyCopied] = useState(false);

  return (
    <div className="flex gap-2 items-center">
      <h2 className="text-white font-bold text-xl md:text-2xl">{value}</h2>
      {copyable ? (
        <button
          onClick={() => {
            copyToClipboard(value);
            setRecentlyCopied(true);
            setTimeout(() => setRecentlyCopied(false), 1000);
          }}
          type="button"
          className={`${
            recentlyCopied
              ? "bg-[#40C969] shadow-sm"
              : "bg-neutral-700 hover:text-black hover:bg-white"
          } shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold text-neutral-400`}
        >
          {recentlyCopied ? (
            <CheckIcon className={"text-white h-4 w-4"} />
          ) : (
            <ClipboardDocumentIcon className={"h-4 w-4"} />
          )}
        </button>
      ) : undefined}
    </div>
  );
};
