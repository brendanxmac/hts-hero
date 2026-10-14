"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import * as ui from "@/components/ui/styles";
import { AddMethod, AddProductsDialog } from "./AddProductsDialog";
import { itemsFromText } from "./catalog";
import { CatalogEmptyState } from "./CatalogEmptyState";
import { EXAMPLE_LIST } from "./exampleList";
import { ProductView } from "./product/ProductView";
import { TrackedProduct } from "./report";
import { useTrackerNav } from "./shell/TrackerNav";
import { TariffReport } from "./TariffReport";
import { useTracker } from "./TrackerContext";

// The Catalog tab: every product the user imports with its duty rate today. Before there are
// any, an empty state explains how to add them; after, the report has an Add products button.
// Both open the same dialog. A product opens in its own view (?product=), with the list kept
// mounted behind it so its sort, filters and scroll position are there on the way back.
export const ProductCatalog = () => {
  const t = useTracker();
  const nav = useTrackerNav();
  const [dialog, setDialog] = useState<{ open: boolean; method: AddMethod }>({
    open: false,
    method: "paste",
  });

  // The app's scroll area: a product view starts at the top; the list returns to where it was
  const anchor = useRef<HTMLDivElement>(null);
  const listScroll = useRef(0);
  const previous = useRef(nav.product);
  useLayoutEffect(() => {
    const scroller = anchor.current?.closest("main");
    if (!scroller || previous.current === nav.product) return;
    if (!previous.current) listScroll.current = scroller.scrollTop;
    scroller.scrollTop = nav.product ? 0 : listScroll.current;
    previous.current = nav.product;
  }, [nav.product]);

  const openDialog = (method: AddMethod) => setDialog({ open: true, method });

  // ?add=paste (or csv) opens the Add products dialog on arrival: links from other pages ("Track
  // your products") land on the step that matters
  const searchParams = useSearchParams();
  const addParam = searchParams.get("add");
  useEffect(() => {
    if (addParam === "paste" || addParam === "csv") openDialog(addParam);
  }, [addParam]);

  const loadExample = () => {
    t.addProducts(itemsFromText(EXAMPLE_LIST), "example");
    trackEvent(MixpanelEvent.TARIFF_TRACKER_EXAMPLE_USED);
  };

  return (
    <div ref={anchor}>
      {nav.product && (
        <ProductView key={nav.product} productKey={nav.product} />
      )}
      <div hidden={Boolean(nav.product)}>
        {t.loading ? (
          <div
            className={`${ui.card} flex flex-col gap-3 p-5`}
            aria-busy="true"
            aria-label="Loading HTS data"
          >
            <div className={`${ui.skeleton} h-7 w-48`} />
            <div className={`${ui.skeleton} h-24 w-full`} />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={`${ui.skeleton} h-14 w-full`} />
            ))}
          </div>
        ) : t.items.length === 0 ? (
          <CatalogEmptyState onAdd={openDialog} onExample={loadExample} />
        ) : (
          <TariffReport
            rows={t.products}
            onAdd={() => openDialog("paste")}
            onOpen={(row: TrackedProduct) => nav.openProduct(row.key, true)}
          />
        )}
      </div>
      <AddProductsDialog
        open={dialog.open}
        method={dialog.method}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
      />
    </div>
  );
};
