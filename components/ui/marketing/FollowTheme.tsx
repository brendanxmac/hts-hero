"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { trackerDisplay, trackerSans } from "@/components/ui/font";

// Puts the marketing frame (header, page, footer) in the Tariff Tracker's look on the given
// paths: the Tracker's theme tokens and fonts, following the site's light/dark setting
// (.follow-theme turns on the skin: variants, DESIGN_SYSTEM.md §14). Everywhere else it stays the
// light marketing look. Without `paths`, every page under it. A plain block, not display:
// contents: Next skips a box with no size when it scrolls a new page into view, and lands on its
// route announcer at the bottom of <body> instead (clicking Home from /signin opened the
// homepage scrolled to the footer).
export const FollowTheme = ({ paths, children }: { paths?: string[]; children: ReactNode }) => {
  const pathname = usePathname();
  const on = !paths || paths.includes(pathname);
  return (
    <div className={`${on ? `follow-theme hts-theme hts-tracker ${trackerSans.className} ${trackerDisplay.variable}` : ""}`}>{children}</div>
  );
};
