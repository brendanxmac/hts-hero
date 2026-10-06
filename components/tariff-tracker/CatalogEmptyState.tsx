"use client";

import { ReactNode } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BellAlertIcon,
  ClipboardDocumentListIcon,
  FunnelIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { AddMethod } from "./AddProductsDialog";
import { CSV_COLUMNS, downloadCsvTemplate } from "./csv";
import { EXAMPLE_LIST } from "./exampleList";

// The catalog before it has products: what the tracker does with them, and the two ways to add
// them, each opening the Add products dialog. Or an example catalog to look around with.

const POINTS: { Icon: typeof Squares2X2Icon; text: string }[] = [
  { Icon: Squares2X2Icon, text: "Today's duty rate on every product, and the tariffs behind it" },
  { Icon: AdjustmentsHorizontalIcon, text: "Adjust each one to match your shipments and exemptions" },
  { Icon: FunnelIcon, text: "Filter by country of origin and HTS chapter, and export it all" },
  { Icon: BellAlertIcon, text: "Coming soon: alerts when a tariff change hits one of your products" },
];

const Option = ({
  Icon,
  title,
  description,
  example,
  action,
  onClick,
}: {
  Icon: typeof Squares2X2Icon;
  title: string;
  description: string;
  example: ReactNode;
  action?: ReactNode;
  onClick: () => void;
}) => (
  <div className={`${ui.card} flex flex-col`}>
    <div className="flex flex-1 flex-col gap-3 p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className={ui.cardTitle}>{title}</h3>
        <p className={`${ui.bodySm} mt-1`}>{description}</p>
      </div>
      <div className="rounded-md border border-base-300 bg-base-200 px-3 py-2.5">{example}</div>
    </div>
    <div className={`${ui.cardFooter} flex flex-wrap items-center justify-between gap-3`}>
      <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={onClick}>
        {title}
      </button>
      {action}
    </div>
  </div>
);

export const CatalogEmptyState = ({
  onAdd,
  onExample,
}: {
  onAdd: (method: AddMethod) => void;
  onExample: () => void;
}) => (
  <section className="flex max-w-5xl flex-col gap-6" aria-labelledby="tt-empty-heading">
    <div className="flex flex-col gap-3">
      <h2 id="tt-empty-heading" className="text-2xl font-semibold tracking-tight text-base-content">
        Add the products you import
      </h2>
      <p className={`${ui.body} max-w-2xl`}>
        A product is an HTS code and a country of origin. Add yours to see what you pay on all of them in one place.
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {POINTS.map(({ Icon, text }) => (
          <li key={text} className={`${ui.bodySm} flex items-start gap-2`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Option
        Icon={ClipboardDocumentListIcon}
        title="Paste a list"
        description="One product per line: the HTS code, then the country. Copy two columns straight from a spreadsheet."
        example={<pre className={`${mono.className} text-xs leading-relaxed text-base-content`}>{EXAMPLE_LIST}</pre>}
        onClick={() => onAdd("paste")}
      />
      <Option
        Icon={ArrowUpTrayIcon}
        title="Upload a CSV"
        description="A file with hts_code and country_of_origin columns. Add customs_value, quantity or transport to set each product's shipment."
        example={
          <div className="flex flex-wrap gap-1.5">
            {CSV_COLUMNS.map((c) => (
              <span key={c.name} className={`${ui.badge(c.required ? "primary" : "neutral")} ${mono.className}`}>
                {c.name}
              </span>
            ))}
          </div>
        }
        action={
          <button
            type="button"
            className={`${ui.link} inline-flex items-center gap-1 text-sm`}
            onClick={() => {
              downloadCsvTemplate();
              trackEvent(MixpanelEvent.TARIFF_TRACKER_CSV_TEMPLATE_DOWNLOADED, { from: "empty_state" });
            }}
          >
            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden />
            Template
          </button>
        }
        onClick={() => onAdd("csv")}
      />
    </div>

    <p className={ui.bodySm}>
      Just looking?{" "}
      <button type="button" className={ui.link} onClick={onExample}>
        Try an example catalog
      </button>
    </p>
  </section>
);
