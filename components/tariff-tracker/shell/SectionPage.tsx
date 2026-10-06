import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";
import { TrackerSection } from "../sections";

// One section of the tracker: its title, then its content. A view inside a section (a catalog
// product) brings its own heading instead.
export const SectionPage = ({
  section,
  showHeader = true,
  children,
}: {
  section: TrackerSection;
  showHeader?: boolean;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    {showHeader && (
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-base-content">{section.title}</h1>
        <p className={ui.bodySm}>{section.summary}</p>
      </header>
    )}
    {children}
  </div>
);
