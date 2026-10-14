"use client";

import { TrackedProduct } from "../../report";
import { ProductTab } from "../../sections";
import { AuditCard } from "./AuditCard";
import { DutyCard } from "./DutyCard";
import { HistoryCard } from "./HistoryCard";
import { SavingsCard } from "./SavingsCard";
import { SetupCard } from "./SetupCard";
import { SuppliersCard } from "./SuppliersCard";

// A catalog product's Summary, where its view opens: what it pays and how that's moved, where its
// savings and audit stand, how it's set up, and who supplies the US. Each card leads to its tab.
export const ProductSummary = ({
  product,
  onTab,
  onReset,
  adjusted,
}: {
  product: TrackedProduct;
  onTab: (tab: ProductTab) => void;
  onReset: () => void;
  adjusted: boolean;
}) => (
  <div className="grid items-start gap-4 xl:grid-cols-3">
    <div className="flex flex-col gap-4 xl:col-span-2">
      <DutyCard product={product} onOpen={() => onTab("duty")} />
      <HistoryCard product={product} onOpen={() => onTab("duty")} />
      <SuppliersCard product={product} onSourcing={() => onTab("savings")} />
    </div>
    <div className="flex flex-col gap-4">
      <SavingsCard product={product} onOpen={() => onTab("savings")} />
      <AuditCard product={product} onOpen={() => onTab("audit")} />
      <SetupCard product={product} onEdit={() => onTab("duty")} onReset={onReset} adjusted={adjusted} />
    </div>
  </div>
);
