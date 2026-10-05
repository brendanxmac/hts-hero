import { IBM_Plex_Mono } from "next/font/google";

// Monospace for HTS and Chapter 99 codes, so digits and dots line up
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
