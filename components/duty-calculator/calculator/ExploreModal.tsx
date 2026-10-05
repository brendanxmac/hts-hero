"use client";

import { Explore } from "@/components/Explore";
import * as ui from "@/components/ui/styles";
import { TariffFinder } from "../lib/useTariffFinder";

// Search the HTS by description, in a modal over the calculator. Still daisyUI's modal around
// the legacy Explore component, until there's a dialog in components/ui.
export const ExploreModal = ({ f }: { f: TariffFinder }) =>
  f.showExplore ? (
    <dialog className="modal modal-open" aria-label="Search HTS by description">
      <div className="modal-box w-11/12 max-w-6xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-base-300">
          <span className="font-semibold">Find your HTS code</span>
          <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={f.closeExplore}>
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Explore explorerSurface="duty_calculator_modal" />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={f.closeExplore}>
          close
        </button>
      </form>
    </dialog>
  ) : null;
