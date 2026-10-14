"use client";

import { useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { itemsFromText } from "../catalog";
import { downloadCsvTemplate } from "../csv";
import { EXAMPLE_LIST } from "../exampleList";
import { useTracker } from "../TrackerContext";
import { openAddProducts } from "./OverviewHeader";

// The empty overview's ask: upload a list (in the catalog's Add products dialog) or paste
// codes right here, plus the template and an example catalog. Bold and inverted from the page like
// every call to action (.hts-tracker-inverse: dark in light mode), with the form following the
// page again inside it.
const BENEFITS = [
  { title: "Every tariff on every product", body: "Base duty, Section 232, 301, 122 and reciprocal", dot: "bg-primary" },
  { title: "What changed, and what it cost you", body: "Every change on your products, last 12 months", dot: "bg-error" },
  { title: "Where you might pay less", body: "Trade programs and lower-duty origins, in dollars", dot: "bg-success" },
  { title: "Your past entries, checked", body: "Duty you may have overpaid, and could recover", dot: "bg-warning" },
];

export const AddProductsPanel = () => {
  const { addProducts } = useTracker();
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const add = () => {
    const items = itemsFromText(text);
    if (!items.length) {
      setMessage("Add one product per line: an HTS code, then a country, like 6110.20.20, China.");
      return;
    }
    const { added, duplicates } = addProducts(items, "overview_paste");
    setMessage(duplicates ? `Added ${added}; ${duplicates} were already in your imports.` : null);
  };

  return (
    <section
      aria-labelledby="tt-add-products"
      className="hts-tracker-inverse relative grid gap-10 overflow-hidden rounded-3xl bg-base-100 p-6 text-base-content sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:p-12"
    >
      <div className="flex min-w-0 flex-col gap-6">
        <span className={`${tt.chip("primary")} self-start`}>Step 1 · takes about a minute</span>
        <div className="flex flex-col gap-4">
          <h2 id="tt-add-products" className={`${tt.display} m-0 text-3xl font-semibold leading-[1.1] tracking-tight text-base-content lg:text-5xl`}>
            Add the products you import, and <span className="text-primary">we&apos;ll work our magic.</span>
          </h2>
          <p className="m-0 max-w-xl text-lg leading-relaxed text-base-content/70">
            An HTS code and a country of origin is all it takes. The moment they&apos;re in, you&apos;ll see:
          </p>
        </div>
        <ul className="m-0 grid list-none gap-x-6 gap-y-4 p-0 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex gap-3">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${b.dot}`} aria-hidden />
              <span className="flex flex-col gap-0.5">
                <span className="text-[0.95rem] font-semibold text-base-content">{b.title}</span>
                <span className="text-sm text-base-content/60">{b.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hts-theme hts-tracker flex min-w-0 flex-col gap-4 rounded-3xl bg-base-100 p-5 text-base-content shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={() => openAddProducts("csv")}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-7 text-center transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowUpTrayIcon className="h-8 w-8 text-primary transition-transform group-hover:-translate-y-0.5" aria-hidden />
          <span className={`${tt.display} text-lg font-semibold text-base-content`}>Upload your product list</span>
          <span className="text-sm text-base-content/60">A CSV export from your ERP or broker. Values and quantities are optional.</span>
          <span className={`${tt.button("next")} mt-1`}>Choose a file</span>
        </button>
        <div className="flex items-center gap-3 text-sm text-base-content/60">
          <span className="h-px flex-1 bg-base-300" />
          or paste them
          <span className="h-px flex-1 bg-base-300" />
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-base-content">HTS code and country, one per line</span>
          <textarea
            className={`${ui.textarea} min-h-28 rounded-2xl bg-tt-soft`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"6110.20.20.10, China\n8413.91.90.15, Brazil\n9403.60.80, Vietnam"}
          />
        </label>
        {message && (
          <p className="m-0 text-sm font-semibold text-warning" role="status">
            {message}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={tt.button("primary")} onClick={add} disabled={!text.trim()}>
            Add products
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
            onClick={() => {
              downloadCsvTemplate();
              trackEvent(MixpanelEvent.TARIFF_TRACKER_CSV_TEMPLATE_DOWNLOADED, { from: "overview" });
            }}
          >
            Download the template
          </button>
          <span className="text-base-content/40" aria-hidden>
            ·
          </span>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
            onClick={() => {
              addProducts(itemsFromText(EXAMPLE_LIST), "example");
              trackEvent(MixpanelEvent.TARIFF_TRACKER_EXAMPLE_USED, { from: "overview" });
            }}
          >
            Try example imports
          </button>
        </div>
      </div>
    </section>
  );
};
