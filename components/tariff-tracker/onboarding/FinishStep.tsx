"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { NewProduct } from "../catalog";
import { DetectedColumns } from "../spreadsheet";
import { useTracker } from "../TrackerContext";
import { SheetReview } from "./SheetReview";
import { toFinishSheet, useToFinish } from "./toFinish";

// The rows left to fix from an earlier sheet (toFinish.ts), back in the same grid and fix panel.
// The list is read once as the step opens, so the grid keeps its edits until they're tracked.

const COLUMNS: DetectedColumns = { headerIndex: 0, columns: { code: 0, country: 1 } };

export const FinishStep = ({ onAdd, onClose }: { onAdd: (products: NewProduct[]) => void; onClose: () => void }) => {
  const { user } = useUser();
  const { findElement } = useTracker();
  const waiting = useToFinish(user?.id);
  const [sheets] = useState(() => [{ name: "Imports to finish", rows: toFinishSheet(waiting) }]);

  return (
    <SheetReview
      finishing
      file="Imports to finish"
      sheets={sheets}
      sheet={0}
      onSheet={() => undefined}
      columns={COLUMNS}
      onColumns={() => undefined}
      picking={false}
      onPicking={() => undefined}
      onReplace={onClose}
      onBack={onClose}
      onAdd={onAdd}
      findElement={findElement}
    />
  );
};
