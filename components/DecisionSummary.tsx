import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { copyToClipboard } from "../utilities/data";
import { Dispatch, SetStateAction, useState } from "react";

interface Props {
  code: string;
  description: string;
  showDetails: boolean;
  setShowDetails: Dispatch<SetStateAction<boolean>>;
}

export const DecisionSummary = ({
  code,
  description,
  showDetails,
  setShowDetails,
}: Props) => {
  const [recentlyCopied, setRecentlyCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        {/* <PrimaryLabel value={level} /> */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          type="button"
          className="shrink-0 p-2 bg-neutral-700 h-6 rounded-md flex items-center justify-center text-sm text-neutral-400 hover:text-black hover:bg-neutral-200"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {code && (
          <div className="flex gap-2 items-center">
            <h2 className="text-white font-bold md:text-xl">{code}</h2>
            <button
              onClick={() => {
                copyToClipboard(code);
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
          </div>
        )}
        <h3 className="text-white text-sm md:text-base">{description}</h3>
      </div>
    </div>
  );
};
