"use client";

import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

interface CopyableHtsCodeProps {
  code: string;
}

export function CopyableHtsCode({ code }: CopyableHtsCodeProps) {
  const [copied, setCopied] = useState(false);

  if (!code) {
    return (
      <p className="text-lg md:text-xl font-mono font-semibold text-base-content/70">
        —
      </p>
    );
  }

  return (

    <div className="w-full flex gap-2 items-center">
      <p
        className="text-lg md:text-xl lg:text-2xl font-mono font-semibold text-primary"
      >
        {code}
      </p>
      <button
        className="rounded-full border border-base-300 p-1.5 transition-all duration-200 cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}>
        <div className={`flex items-end justify-center px-1 gap-1 ${copied ? 'text-success' : 'text-primary'}`}>
          {copied ? <CheckIcon className="w-4 h-4" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
          <p className="text-xs font-semibold">{copied ? "Copied!" : "Copy"}</p>
        </div>

      </button>
    </div>

  );
}
