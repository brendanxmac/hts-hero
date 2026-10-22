"use client";

import { CheckIcon, LinkIcon, ListBulletIcon } from "@heroicons/react/20/solid";
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

// The code in the HTS itself: the Explorer opens on its line (secondary, beside Share)
export const ViewInHtsButton = ({ f }: { f: TariffFinder }) =>
  f.selectedElement && (
    <button
      type="button"
      className={ui.button({ variant: "secondary", size: "sm" })}
      onClick={() => f.selectedElement && f.openExplorerAt(f.selectedElement, "results_heading_path")}
    >
      <ListBulletIcon className="w-4 h-4" />
      View in HTS
    </button>
  );
