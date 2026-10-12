import { Figtree, IBM_Plex_Mono, Sora } from "next/font/google";

// Monospace for HTS and Chapter 99 codes, so digits and dots line up
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// The Tariff Tracker (DESIGN_SYSTEM.md §15): Figtree for everything, Sora for headlines and big numbers
export const trackerSans = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const trackerDisplay = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  // For the marketing headings on pages in the Tracker's look (skin:, components/ui/marketing)
  variable: "--font-tracker-display",
});
