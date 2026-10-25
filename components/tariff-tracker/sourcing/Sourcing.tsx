"use client";

import { Suspense, useState } from "react";
import { GlobeAltIcon } from "@heroicons/react/20/solid";
import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { ExploreModal } from "@/components/duty-calculator/calculator/ExploreModal";
import { useTariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import * as ui from "@/components/ui/styles";
import { sectionBySlug, TRACKER_PATH } from "../sections";
import { SectionHeader } from "../shell/SectionPage";
import { FinderInputs, FinderOptions, SourcingFinder } from "./finder/SourcingFinder";

// The Sourcing section: any HTS code, and where to source it from, every country ranked. Its fields
// sit in the page's header card, like the Calculator's; while it's the open tab the address follows
// them (?tab=sourcing&code=…), so a link opens the same answer. Only the code: everything on the page
// is a share of value, for any country, so there's no origin or shipment value to enter.
const SOURCING_TAB = { tab: "sourcing" };
const SECTION = sectionBySlug("sourcing")!;
// The explorer's main button, over this page
const FIND_SOURCES = { label: "Find Sources", Icon: GlobeAltIcon };

const SourcingPage = ({ active }: { active: boolean }) => {
  const [options, setOptions] = useState<FinderOptions>({ withAgreements: true });
  // No country of origin: the page ranks them all
  const f = useTariffFinder({ path: TRACKER_PATH, extraParams: SOURCING_TAB, syncAddress: active, surface: "tracker", defaultCountry: "" });
  return (
    <div className="flex flex-col gap-group">
      <SectionHeader section={SECTION} fields>
        <FinderInputs f={f} options={options} onOptions={setOptions} />
      </SectionHeader>
      <SourcingFinder f={f} options={options} />
      <ExploreModal f={f} useCodeAction={FIND_SOURCES} />
    </div>
  );
};

export const Sourcing = ({ active }: { active: boolean }) => (
  <BreadcrumbsProvider>
    {/* useSearchParams needs a Suspense boundary */}
    <Suspense fallback={<div className={`${ui.card} h-64`} />}>
      <SourcingPage active={active} />
    </Suspense>
  </BreadcrumbsProvider>
);
