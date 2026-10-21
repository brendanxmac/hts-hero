"use client";

import { CheckIcon, LinkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TariffFinder } from "../lib/useTariffFinder";

// Copy a link to the estimate (secondary; only Track this import stands out)
export const ShareButtons = ({ f }: { f: TariffFinder }) => (
  <button
    type="button"
    className={ui.button({ variant: "secondary", size: "sm" })}
    onClick={f.copyLink}
    aria-label="Copy share link"
  >
    {f.copied ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
    <span className="hidden sm:inline">{f.copied ? "Link copied" : "Share"}</span>
    <span className="sm:hidden">{f.copied ? "Copied" : "Share"}</span>
  </button>
);
