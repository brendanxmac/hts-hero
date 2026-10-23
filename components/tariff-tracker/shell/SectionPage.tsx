import { ReactNode } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { TrackerSection } from "../sections";
import { BetaChip } from "./BetaChip";

// Every page's frame (DESIGN_SYSTEM.md §15 "Page frame"): a header card, the same on every page
// and like an import's header. The title and one line on what the page is for (on Home, the day and
// the imports), the page's own actions on the right, then its views (TabBar pills) at the card's
// foot, so the tabs are plainly part of what they switch. children: a last section of the card,
// under a rule (Home's key numbers). The page's modules follow on the ground.
export const SectionHeader = ({
  section,
  summary,
  actions,
  tabs,
  children,
}: {
  section: TrackerSection;
  summary?: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
  children?: ReactNode;
}) => (
  <header className={`${tt.panel} flex flex-col`}>
    <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-5 pt-5 sm:px-6 ${tabs ? "pb-4" : "pb-5"}`}>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className={`${tt.pageTitle} flex items-center gap-3`}>
          {section.title}
          {section.beta && <BetaChip />}
        </h1>
        <p className={`${tt.subtitle} m-0`}>{summary ?? section.summary}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
    {tabs && <div className="px-5 pb-4 sm:px-6">{tabs}</div>}
    {/* Clipped to the card's rounded foot (the header itself can't clip: its actions' menus open past it) */}
    {children && <div className="overflow-hidden rounded-b-[inherit] border-t border-base-300">{children}</div>}
  </header>
);

// One section of the tracker: its header, then its content, a page tier apart. A view inside a
// section (a catalog product) brings its own heading instead, and a section with actions or a live
// summary in its header draws it itself (SectionHeader).
export const SectionPage = ({
  section,
  showHeader = true,
  children,
}: {
  section: TrackerSection;
  showHeader?: boolean;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-group px-4 py-6 sm:px-6 lg:px-2 lg:pb-8 lg:pt-1">
    {showHeader && <SectionHeader section={section} />}
    {children}
  </div>
);
