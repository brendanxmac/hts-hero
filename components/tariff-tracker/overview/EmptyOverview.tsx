"use client";

import { AddProductsPanel } from "./AddProductsPanel";
import { ExamplePreview } from "./ExamplePreview";
import { NewsTape } from "./NewsTape";
import { OverviewHeader } from "./OverviewHeader";
import { RecentLookups } from "./RecentLookups";

// The Overview before there are any products: the latest tariff news (why it matters), the ask,
// a head start from the user's recent calculator lookups, then an example of what they'll get
export const EmptyOverview = () => (
  <div className="flex flex-col gap-4">
    <NewsTape />
    <OverviewHeader title="Let's Build Your Tariff Dashboard" />
    <AddProductsPanel />
    <RecentLookups />
    <ExamplePreview />
  </div>
);
