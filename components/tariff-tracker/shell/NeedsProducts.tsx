"use client";

import { PlusIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useTrackerNav } from "./TrackerNav";

// A section that works from the catalog, before there's anything in it
export const NeedsProducts = ({ title, body }: { title: string; body: string }) => {
  const { openTab } = useTrackerNav();
  return (
    <section className={`${ui.card} flex max-w-2xl flex-col items-start gap-3 p-6`}>
      <h2 className={ui.cardTitle}>{title}</h2>
      <p className={ui.bodySm}>{body}</p>
      <button type="button" className={ui.button({ variant: "primary" })} onClick={() => openTab("catalog")}>
        <PlusIcon className="h-4 w-4" aria-hidden />
        Add imports
      </button>
    </section>
  );
};
