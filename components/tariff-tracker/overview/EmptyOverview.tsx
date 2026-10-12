"use client";

import { AddProductsPanel } from "./AddProductsPanel";
import { ExamplePreview } from "./ExamplePreview";
import { OverviewHeader } from "./OverviewHeader";
import { RecentLookups } from "./RecentLookups";

// The Overview before there are any products: the ask first, a head start from the user's
// recent calculator lookups, then an example of what they'll get
export const EmptyOverview = () => (
  <div className="flex flex-col gap-4">
    <OverviewHeader title="Let's build your tariff dashboard" />
    <AddProductsPanel />
    <RecentLookups />
    <ExamplePreview />
  </div>
);
