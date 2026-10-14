"use client";

import * as tt from "@/components/ui/styles/tracker";
import { TRACKER_PATH } from "../sections";

// The catalog tab, with the Add products dialog open (ProductCatalog reads ?add=)
export const openAddProducts = (method: "paste" | "csv" = "paste") =>
  window.history.pushState(null, "", `${TRACKER_PATH}?tab=catalog&add=${method}`);

// The empty Overview's title. With imports in, the Overview opens on the tariff news instead.
export const OverviewHeader = ({ title }: { title: string }) => (
  <header className="px-1">
    <h1 className={`${tt.display} m-0 text-2xl font-semibold text-base-content`}>{title}</h1>
  </header>
);
