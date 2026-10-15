import { ReactNode } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { TrackerSection } from "../sections";
import { BetaChip } from "./BetaChip";

// A section's title and summary, with its own actions on the right (Your imports: the date,
// export, adding products)
export const SectionHeader = ({ section, actions }: { section: TrackerSection; actions?: ReactNode }) => (
  <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-1">
    <div className="flex flex-col gap-1">
      <h1 className={`${tt.display} m-0 flex items-center gap-3 text-2xl font-semibold tracking-tight text-base-content`}>
        {section.title}
        {section.beta && <BetaChip />}
        {section.comingSoon && <span className={tt.chip("primary")}>Coming soon</span>}
      </h1>
      <p className={tt.subtitle}>{section.summary}</p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

// One section of the tracker: its title, then its content. A view inside a section (a catalog
// product) brings its own heading instead, and a section with actions in its header draws it
// itself (SectionHeader).
export const SectionPage = ({
  section,
  showHeader = true,
  children,
}: {
  section: TrackerSection;
  showHeader?: boolean;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-5 px-4 py-6 sm:px-6 lg:px-2 lg:pb-8 lg:pt-1">
    {showHeader && <SectionHeader section={section} />}
    {children}
  </div>
);
