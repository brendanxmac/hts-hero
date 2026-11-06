"use client";

import { useImportTakeover } from "./onboarding/takeoverStore";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as ui from "@/components/ui/styles";
import { AddMethod, AddProductsDialog } from "./AddProductsDialog";
import { SetupPage } from "./onboarding/SetupPanel";
import { ProductView } from "./product/ProductView";
import { TrackedProduct } from "./report";
import { SectionHeader } from "./shell/SectionPage";
import { useTrackerNav } from "./shell/TrackerNav";
import { sectionBySlug, TRACKER_PATH } from "./sections";
import { TabBar } from "@/components/ui/TabBar";
import { Insights } from "./insights-tab/Insights";
import { ExposureMap } from "./overview/ExposureMap";
import { OriginDistribution } from "./overview/OriginDistribution";
import { TariffReport } from "./TariffReport";
import { useTracker } from "./TrackerContext";
import { ListSwitcher } from "./lists/ListSwitcher";
import { useImportLists } from "./catalogStore";
import { PlusIcon, QueueListIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";

// The Catalog tab: every product the user imports with its duty rate today. Before there are
// any, an empty state explains how to add them; after, the report has an Add products button.
// Both open the same dialog. A product opens in its own view (?product=), with the list kept
// mounted behind it so its sort, filters and scroll position are there on the way back.
export const ProductCatalog = () => {
  const t = useTracker();
  const nav = useTrackerNav();
  const lists = useImportLists();
  const listName = lists.lists.find((l) => l.id === lists.activeId)?.name ?? "This list";
  const [dialog, setDialog] = useState<{ open: boolean; method: AddMethod }>({
    open: false,
    method: "paste",
  });

  // (Scroll positions are kept per view in TrackerApp: the list returns to where it was)
  const anchor = useRef<HTMLDivElement>(null);

  const openDialog = (method: AddMethod) => setDialog({ open: true, method });

  // ?add=paste (or csv) opens the Add products dialog on arrival: links from other pages ("Track
  // your products") land on the step that matters
  const searchParams = useSearchParams();
  const addParam = searchParams.get("add");
  useEffect(() => {
    if (addParam === "paste" || addParam === "csv") openDialog(addParam);
  }, [addParam]);
  // Without imports of their own the import takeover asks instead (it reads ?add= too)
  const { open: takeoverOpen } = useImportTakeover();
  useEffect(() => {
    if (takeoverOpen) setDialog((d) => ({ ...d, open: false }));
  }, [takeoverOpen]);

  // Two views: the imports, and Insights on them (where the duty comes from, what moved it)
  const view = searchParams.get("view") === "insights" ? "insights" : "imports";
  const views = (
    <TabBar
      label="Your Imports"
      options={[
        { id: "imports", label: "Imports", count: t.items.length },
        { id: "insights", label: "Insights" },
      ]}
      value={view}
      onChange={(next) => next !== view && window.history.pushState(null, "", `${TRACKER_PATH}?tab=catalog${next === "insights" ? "&view=insights" : ""}`)}
    />
  );

  return (
    <div ref={anchor}>
      {nav.product && (
        <ProductView key={nav.product} productKey={nav.product} />
      )}
      {/* The report draws its own header, with its actions in it */}
      <div hidden={Boolean(nav.product)}>
        <div className="flex flex-col gap-5">
          {/* With none of their imports, the page is the pitch for adding them (SetupPage) */}
          {t.loading && (
            <SectionHeader section={sectionBySlug("catalog")!} />
          )}
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
          ) : t.items.length === 0 && t.allItems.length > 0 ? (
            // A list of its own with nothing in it yet (a new client's): add to it here
            <div className="tt-enter flex flex-col gap-group">
              <SectionHeader section={sectionBySlug("catalog")!} summary={`${listName} has no imports yet.`} actions={<ListSwitcher look="header" source="imports" />} />
              <div className={`${tt.panel} flex flex-col items-center gap-4 px-6 py-14 text-center`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
                  <QueueListIcon className="h-6 w-6" />
                </span>
                <div className="flex max-w-md flex-col gap-1.5">
                  <h2 className={`${tt.title} m-0`}>Add Imports to {listName}</h2>
                  <p className="m-0 text-sm leading-relaxed text-base-content/70">
                    Paste HTS codes with their countries, or upload a spreadsheet. Every tab in Duty Guard shows this list while it&apos;s selected, and alerts cover all your lists.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" className={ui.button({ variant: "primary" })} onClick={() => openDialog("paste")}>
                    <PlusIcon className="h-4 w-4" aria-hidden />
                    Paste Imports
                  </button>
                  <button type="button" className={ui.button()} onClick={() => openDialog("csv")}>
                    Upload a File
                  </button>
                </div>
              </div>
            </div>
          ) : t.items.length === 0 ? (
            <SetupPage from="imports" />
          ) : view === "insights" ? (
            <div className="tt-enter flex flex-col gap-group">
              <SectionHeader section={sectionBySlug("catalog")!} tabs={views} actions={<ListSwitcher look="header" source="imports" />} />
              {/* Free for everyone: where the duty on each import comes from, and where they come from */}
              <div className="grid gap-module xl:grid-cols-12">
                <div className="flex flex-col *:flex-1 xl:col-span-8">
                  <ExposureMap products={t.products} onOpen={(key) => nav.openProduct(key)} />
                </div>
                <div className="flex flex-col *:flex-1 xl:col-span-4">
                  <OriginDistribution products={t.products} />
                </div>
              </div>
              <Insights />
            </div>
          ) : (
            <TariffReport
              rows={t.products}
              tabs={views}
              onAdd={() => openDialog("paste")}
              onOpen={(row: TrackedProduct) => nav.openProduct(row.key, true)}
            />
          )}
        </div>
      </div>
      <AddProductsDialog
        open={dialog.open}
        method={dialog.method}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
      />
    </div>
  );
};
