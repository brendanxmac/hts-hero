import { useState } from "react";
import { copyToClipboard } from "../utilities/data";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

interface Props {
  value: string;
}

export const TextCopyButton = ({ value }: Props) => {
  const [recentlyCopied, setRecentlyCopied] = useState(false);
  return (
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
  );
};
