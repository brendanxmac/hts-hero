import { ReactNode } from "react";

// The dark band at the top of /duty-calculator and each country page, like the homepage hero:
// the page's heading and the calculator together, so the tool reads as the page's purpose and
// the light sections below as reference. Put the calculator in it with TariffFinderPage onDark.
export const DarkBand = ({ children }: { children: ReactNode }) => (
  <div className="relative w-full overflow-hidden bg-[#070d1a] text-white">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_26rem_at_80%_4rem,rgba(45,212,191,0.18),transparent),radial-gradient(44rem_28rem_at_0%_32rem,rgba(14,165,233,0.12),transparent)]"
    />
    <div className="relative">{children}</div>
  </div>
);
