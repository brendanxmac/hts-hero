"use client";

import { Explore } from "@/components/hts-explorer/Explore";
import { ExplorerDialog } from "@/components/hts-explorer/ExplorerDialog";
import type { UseCodeAction } from "@/components/hts-explorer/useExplorer";
import { TariffFinder } from "../lib/useTariffFinder";

// Search or browse the HTS over the calculator; its main button ("Calculate duty", or the host's
// useCodeAction: Sourcing's "Find Sources") puts the code in its input bar
export const ExploreModal = ({ f, useCodeAction }: { f: TariffFinder; useCodeAction?: UseCodeAction }) => (
  <ExplorerDialog open={f.showExplore} onClose={f.closeExplore} label="Find your HTS code">
    <Explore
      explorerSurface="duty_calculator_modal"
      dialog={{ title: "Find your HTS code", onClose: f.closeExplore }}
      startAt={f.selectedElement}
      useCodeAction={useCodeAction}
      onUseCode={(element) => {
        f.selectElement(element, "explorer_modal");
        f.closeExplore();
      }}
    />
  </ExplorerDialog>
);
