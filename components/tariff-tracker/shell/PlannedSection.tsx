"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TrackerSection } from "../sections";
import { useTrackerNav } from "./TrackerNav";

// A section that isn't built yet: what it will do
export const PlannedSection = ({ section }: { section: TrackerSection }) => {
  const { openTab } = useTrackerNav();
  const { Icon } = section;
  const headingId = `tt-planned-${section.slug}`;
  return (
    <section className={`${ui.card} max-w-3xl`} aria-labelledby={headingId}>
      <div className={ui.cardHeader}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
          <h2 id={headingId} className={ui.cardTitle}>
            What&apos;s coming
          </h2>
        </div>
        <span className={ui.badge("primary")}>In development</span>
      </div>
      <ul className="flex flex-col gap-3 px-5 py-4">
        {section.planned.map((item) => (
          <li key={item} className={`${ui.bodySm} flex gap-2.5`}>
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <div className={`${ui.cardFooter} ${ui.bodySm}`}>
        It will work from your{" "}
        <button type="button" className={ui.link} onClick={() => openTab("catalog")}>
          catalog
        </button>
        , so the products you add there now carry over.
      </div>
    </section>
  );
};
