"use client";

import { useEffect, useState } from "react";
import { CheckIcon, LinkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
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

  return (
    <button type="button" onClick={copy} className={ui.button({ variant: "ghost", size: "sm" })}>
      {copied ? (
        <CheckIcon className="h-4 w-4 text-success" aria-hidden />
      ) : (
        <LinkIcon className="h-4 w-4" aria-hidden />
      )}
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
};
