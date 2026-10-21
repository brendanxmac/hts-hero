"use client";

import { Explore } from "@/components/hts-explorer/Explore";
import { ExplorerDialog } from "@/components/hts-explorer/ExplorerDialog";
import { TariffFinder } from "../lib/useTariffFinder";

// Search or browse the HTS over the calculator; "Use this code" puts the code in its input bar
export const ExploreModal = ({ f }: { f: TariffFinder }) => (
  <ExplorerDialog open={f.showExplore} onClose={f.closeExplore} label="Find your HTS code">
    <Explore
      explorerSurface="duty_calculator_modal"
      dialog={{ title: "Find your HTS code", onClose: f.closeExplore }}
      startAt={f.selectedElement}
      onUseCode={(element) => {
        f.selectElement(element, "explorer_modal");
        f.closeExplore();
      }}
    />
  </ExplorerDialog>
);
