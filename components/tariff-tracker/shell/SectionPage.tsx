import { ReactNode } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { TrackerSection } from "../sections";
import { BetaChip } from "./BetaChip";

// Every page's frame (DESIGN_SYSTEM.md §15 "Page frame"): the title, one line on what the page is
// for (or, on the Overview, the day and the imports), its own actions on the right, then its
// modules with the ground between them
export const SectionHeader = ({ section, summary, actions }: { section: TrackerSection; summary?: ReactNode; actions?: ReactNode }) => (
  <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-1">
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className={`${tt.pageTitle} flex items-center gap-3`}>
        {section.title}
        {section.beta && <BetaChip />}
        {section.comingSoon && <span className={tt.chip("primary")}>Coming soon</span>}
      </h1>
      <p className={`${tt.subtitle} m-0`}>{summary ?? section.summary}</p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
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
