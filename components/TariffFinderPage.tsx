"use client";

import { ClassicDesign } from "./duty-calculator/designs/Classic";
import { DashboardDesign } from "./duty-calculator/designs/Dashboard";
import { ReceiptDesign } from "./duty-calculator/designs/Receipt";
import { WorkbenchDesign } from "./duty-calculator/designs/Workbench";
import { DesignSwitcher, Disclaimer, ExploreModal } from "./duty-calculator/shared";
import { Design, useTariffFinder } from "./duty-calculator/useTariffFinder";
import styles from "./duty-calculator/theme.module.css";

// Page width per design; the rail layouts use the room beside their rail
const WIDTH: Record<Design, string> = {
  classic: "max-w-[1440px]",
  receipt: "max-w-[1200px]",
  workbench: "max-w-[1440px]",
  dashboard: "max-w-[1280px]",
};

export const TariffFinderPage = () => {
  const f = useTariffFinder();

  return (
    <div className={`${styles.root} w-full pb-20`}>
      <div className={`mx-auto w-full ${WIDTH[f.design]} px-4 sm:px-6 flex flex-col gap-6`}>
        <DesignSwitcher f={f} />
        {f.design === "receipt" ? (
          <ReceiptDesign f={f} />
        ) : f.design === "workbench" ? (
          <WorkbenchDesign f={f} />
        ) : f.design === "dashboard" ? (
          <DashboardDesign f={f} />
        ) : (
          <ClassicDesign f={f} />
        )}
        <Disclaimer />
      </div>
      <ExploreModal f={f} />
    </div>
  );
};
