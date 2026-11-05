"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import { crossSearchUrl } from "../../libs/cross-rulings";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import * as ui from "../ui/styles";

interface Props {
  term: string;
  /** Where the link is, for tracking: hts / explore / classification / classify_step */
  surface: string;
  /** The button text; "Search CROSS for <term>" when left out */
  label?: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary";
}

// Opens CBP's CROSS search for `term` on rulings.cbp.gov in a new tab. CBP runs the search in the
// user's own browser; we don't search CROSS ourselves.
export function CrossSearchLink({ term, surface, label, size = "sm", variant = "secondary" }: Props) {
  return (
    <a
      href={crossSearchUrl(term)}
      target="_blank"
      rel="noopener noreferrer"
      className={ui.button({ variant, size })}
      onClick={() => trackEvent(MixpanelEvent.CROSS_SEARCH_OPENED, { surface, term })}
    >
      {label ?? (
        <span>
          Search CROSS for <span className="font-mono">{term}</span>
        </span>
      )}
      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="sr-only">(opens rulings.cbp.gov in a new tab)</span>
    </a>
  );
}
