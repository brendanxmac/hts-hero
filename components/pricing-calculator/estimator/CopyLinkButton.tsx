"use client";

import { useEffect, useState } from "react";
import { CheckIcon, LinkIcon } from "@heroicons/react/20/solid";
import { estimateUrl } from "../lib/links";

const COPIED_FOR_MS = 2000;

// Copies a link to this estimate, to send as a quote or share with a teammate
export const CopyLinkButton = ({ query }: { query: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_FOR_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(estimateUrl(query, window.location.origin));
      setCopied(true);
    } catch {
      // Clipboard blocked: the address bar already holds the same link
      window.prompt("Copy this link to your estimate:", estimateUrl(query, window.location.origin));
    }
  };

  // A quiet button for the dark summary card
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-emerald-400" aria-hidden />
      ) : (
        <LinkIcon className="h-4 w-4" aria-hidden />
      )}
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
};
