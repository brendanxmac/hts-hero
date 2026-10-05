"use client";

import { CheckIcon, ClipboardDocumentIcon, LinkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TariffFinder } from "../lib/useTariffFinder";

// Copy the estimate as text, or a link to it
export const ShareButtons = ({ f }: { f: TariffFinder }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      className={ui.button({ size: "sm" })}
      onClick={() => f.copy("summary")}
      aria-label="Copy summary"
    >
      {f.copied === "summary" ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
      <span className="hidden sm:inline">{f.copied === "summary" ? "Copied" : "Copy"}</span>
    </button>
    <button
      type="button"
      className={ui.button({ variant: "primary", size: "sm" })}
      onClick={() => f.copy("link")}
      aria-label="Copy share link"
    >
      {f.copied === "link" ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      <span className="hidden sm:inline">{f.copied === "link" ? "Link copied" : "Share"}</span>
      <span className="sm:hidden">{f.copied === "link" ? "Copied" : "Share"}</span>
    </button>
  </div>
);
