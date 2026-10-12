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
// codes right here, plus the template and an example catalog
const BENEFITS = [
  { n: "1", title: "Every tariff on every product", body: "Base duty, Section 232, 301, 122 and reciprocal, line by line", tone: "primary" as const },
  { n: "2", title: "What changed, and what it cost you", body: "Every tariff change on your products over the last 12 months", tone: "error" as const },
  { n: "3", title: "Where you might pay less", body: "Potential savings from trade programs and lower-duty origins, in dollars", tone: "success" as const },
  { n: "4", title: "Alerts before the next change lands", body: "Email, Slack or Teams, the day a tariff is announced", tone: "warning" as const },
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
    setMessage(duplicates ? `Added ${added}; ${duplicates} were already in your catalog.` : null);
  };

  return (
    <section aria-label="Add your products" className={`${tt.panel} grid gap-10 p-6 lg:grid-cols-2 lg:p-10`}>
      <div className="flex min-w-0 flex-col gap-5">
        <span className={`${tt.chip("primary")} self-start`}>Step 1 · takes about a minute</span>
        <h2 className={`${tt.display} m-0 text-3xl font-semibold leading-tight tracking-tight text-base-content lg:text-4xl`}>
          Add the products you import. We&apos;ll watch every tariff on them.
        </h2>
        <p className="m-0 text-base leading-relaxed text-base-content/70">An HTS code and a country of origin is all it takes. The moment they&apos;re in, you&apos;ll see:</p>
        <ul className="flex flex-col gap-2.5">
          {BENEFITS.map((b) => (
            <li key={b.n} className={`${tt.tile} flex items-center gap-3.5 px-4 py-3`}>
              <span className={`${tt.display} ${tt.chip(b.tone)} h-9 w-9 justify-center rounded-xl text-sm`}>{b.n}</span>
              <span className="flex flex-col">
                <span className="text-[0.95rem] font-semibold text-base-content">{b.title}</span>
                <span className="text-sm text-base-content/60">{b.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <button
          type="button"
          onClick={() => openAddProducts("csv")}
          className="flex flex-col items-center gap-2.5 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-8 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowUpTrayIcon className="h-9 w-9 text-primary" aria-hidden />
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
            className={`${ui.textarea} min-h-32 rounded-2xl bg-tt-soft`}
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
            Try an example catalog
          </button>
        </div>
      </div>
    </section>
  );
};
