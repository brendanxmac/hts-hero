"use client";

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
    <span className="relative inline-block">
      <span
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-lg md:text-xl font-mono font-semibold text-primary cursor-pointer hover:underline"
      >
        {code}
      </span>
      <span
        className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-primary text-white text-[10px] font-semibold whitespace-nowrap pointer-events-none transition-all duration-200 ${copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
      >
        Copied!
      </span>
    </span>
  );
}
