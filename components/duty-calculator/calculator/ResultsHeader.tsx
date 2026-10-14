import { ReactNode } from "react";
import { HtsElement } from "@/interfaces/hts";
import { mono } from "@/components/ui/font";
import { isVerifiedDate } from "@/tariffs/engine-v2/revisions";
import { formatDate, formatMoney } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { ShareButtons } from "./ShareButtons";
import { ViewSwitch } from "./ViewSwitch";

// The results' heading: the code and origin as the title, the rest of the entry (date, value,
// transport) under it, with the view switch (or the host's own), sharing and any actions the host
// adds (the Tariff Tracker's "Add to catalog")
export const ResultsHeader = ({
  f,
  result,
  selectedElement,
  country,
  allowCompare = true,
  actions,
  viewSwitch,
  explain,
}: {
  // Before Share: the way to show and hide the plain-English explanation
  explain?: ReactNode;
  f: TariffFinder;
  allowCompare?: boolean;
  // After Share: the host's main action (Track this import, Add to catalog)
  actions?: ReactNode;
  // In place of the Simple / Detailed / Compare switch (the Tariff Tracker's calculator tabs)
  viewSwitch?: ReactNode;
  result: NonNullable<TariffFinder["result"]>;
  selectedElement: HtsElement;
  country: NonNullable<TariffFinder["country"]>;
}) => (
  <div
    id="duty-results"
    className="flex flex-wrap items-end justify-between gap-4 scroll-mt-4"
  >
    <div className="min-w-0">
      <h2
        id="results-heading"
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-2xl font-semibold tracking-tight text-base-content"
      >
        <span className={mono.className}>{selectedElement.htsno}</span>
        <span className="text-base-content/30" aria-hidden>
          ·
        </span>
        <span>
          {f.comparing
            ? f.compareEntries
              .map((e) => `${e.country.flag} ${e.country.name}`)
              .join(" vs ")
            : `${country.flag} ${country.name}`}
        </span>
      </h2>
      <p className="mt-1 text-sm text-base-content/60">
        {formatDate(result.asOf)}
        {" · "}
        {formatMoney(f.customsValue)} customs value
        {" · "}
        {f.transportLabel}
      </p>
    </div>
    <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto items-center gap-2">
      {viewSwitch ?? <ViewSwitch f={f} className="basis-full sm:basis-auto" allowCompare={allowCompare} />}
      {explain}
      <ShareButtons f={f} />
      {actions}
    </div>
  </div>
);
