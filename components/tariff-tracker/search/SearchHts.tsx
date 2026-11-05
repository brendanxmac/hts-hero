"use client";

import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { Explore } from "@/components/hts-explorer/Explore";

// Duty Guard's Search HTS Codes tab: the HTS explorer from /explore, as it is there, so accounts
// that came from the /hts pages can look codes up without leaving Duty Guard. Its own trail, apart
// from the calculator's explorer.
export const SearchHts = () => (
  <BreadcrumbsProvider>
    <Explore explorerSurface="duty_guard" />
  </BreadcrumbsProvider>
);
