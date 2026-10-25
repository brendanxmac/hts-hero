"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useHts } from "../../contexts/HtsContext";
import { HtsElement } from "../../interfaces/hts";
import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { mono, trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import * as ui from "@/components/ui/styles";
import { RowHeader, Table, TBody, Td, Tr } from "@/components/ui/table";
import { adjustmentTags } from "./adjustments";
import { itemKey, NewProduct } from "./catalog";
import { CSV_COLUMNS, downloadCsvTemplate, ImportedEntry, parseCsv } from "./csv";
import { EXAMPLE_LIST } from "./exampleList";
import { generateProducts, OriginPool } from "./generate";
import { parseCatalog } from "./parse";
import { SkippedLines } from "./SkippedLines";
import { AddSource, useTracker } from "./TrackerContext";

// Adds products to the catalog: pasted as "HTS code, country" lines, or uploaded as a CSV (whose
// optional columns become adjustments). What will be added is previewed first, with the lines
// that can't be read and the products already in the catalog. In development, a third tab makes
// random catalogs of real products.

export type AddMethod = "paste" | "csv" | "generate";

const SHOW_GENERATOR = process.env.NODE_ENV === "development";

const METHODS: { id: AddMethod; label: string }[] = [
  { id: "paste", label: "Paste a list" },
  { id: "csv", label: "Upload a CSV" },
  ...(SHOW_GENERATOR ? [{ id: "generate" as const, label: "Generate (dev)" }] : []),
];

const PREVIEW_ROWS = 6;

const PasteInput = ({ text, onChange }: { text: string; onChange: (text: string) => void }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor="tt-add-paste" className={ui.fieldLabel}>
      One import per line: HTS code, country of origin
    </label>
    <textarea
      id="tt-add-paste"
      className={`${ui.textarea} ${mono.className} min-h-56 resize-y py-3 leading-relaxed`}
      spellCheck={false}
      autoComplete="off"
      placeholder={EXAMPLE_LIST}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
    <p className={ui.caption}>
      Copy two columns straight from a spreadsheet. Codes can have 8 or 10 digits, with or without dots; the
      country is its two-letter code or its name.
    </p>
  </div>
);

const CsvInput = ({
  file,
  onFile,
}: {
  file: { name: string } | null;
  onFile: (file: { name: string; text: string }) => void;
}) => {
  const [dragging, setDragging] = useState(false);
  const read = async (f: File | undefined) => {
    if (f) onFile({ name: f.name, text: await f.text() });
  };
  return (
    <div className="flex flex-col gap-4">
      <label
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          read(e.dataTransfer.files[0]);
        }}
      >
        <ArrowUpTrayIcon className="h-6 w-6 text-primary" aria-hidden />
        <span className="text-sm font-semibold text-base-content">
          {file ? file.name : "Drop a CSV here, or choose a file"}
        </span>
        <span className={ui.caption}>{file ? "Choose another file to replace it" : ".csv or .txt"}</span>
        <input
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="sr-only"
          onChange={(e) => {
            read(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      <div className={ui.card}>
        <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-2.5">
          <span className={ui.label}>Columns</span>
          <button
            type="button"
            className={`${ui.link} inline-flex items-center gap-1 text-xs`}
            onClick={() => {
              downloadCsvTemplate();
              trackEvent(MixpanelEvent.TARIFF_TRACKER_CSV_TEMPLATE_DOWNLOADED, { from: "dialog" });
            }}
          >
            <ArrowDownTrayIcon className="h-3.5 w-3.5" aria-hidden />
            Download template
          </button>
        </div>
        {/* On the card's px-4, like its header and note, and no rule over the first row (the header draws it) */}
        <Table framed={false} dense>
          <TBody>
            {CSV_COLUMNS.map((c) => (
              <Tr key={c.name} className="[&:first-child>*]:border-t-0">
                <RowHeader className="pl-4!">
                  <span className={`${mono.className} font-semibold text-base-content`}>{c.name}</span>
                </RowHeader>
                <Td muted>{c.description}</Td>
                <Td align="right" className="pr-4!">
                  <span className={ui.badge(c.required ? "primary" : "neutral")}>{c.required ? "Required" : "Optional"}</span>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        <p className={`${ui.caption} border-t border-base-300 px-4 py-2`}>
          Columns can be in any order and other columns are ignored. Optional values become the product&apos;s
          adjustments.
        </p>
      </div>
    </div>
  );
};

const Generator = ({ onGenerate }: { onGenerate: (text: string) => void }) => {
  const { htsElements } = useHts();
  const [count, setCount] = useState(50);
  const [origins, setOrigins] = useState<OriginPool>("common");
  return (
    <div className="flex flex-col gap-4">
      <p className={`${ui.notice("primary")} ${ui.bodySm}`}>
        Development only. Makes random products from real 10-digit HTS codes and countries, then puts them in the
        paste list to review before adding.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="tt-generate-count" className={ui.fieldLabel}>
            How many products
          </label>
          <input
            id="tt-generate-count"
            type="number"
            min={1}
            className={`${ui.input} tabular-nums`}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className={ui.fieldLabel}>Countries of origin</span>
          <SegmentedControl<OriginPool>
            label="Countries of origin"
            options={[
              { id: "common", label: "Top partners" },
              { id: "all", label: "Any country" },
            ]}
            value={origins}
            onChange={setOrigins}
            fullWidth
          />
        </div>
      </div>
      <button
        type="button"
        className={`${ui.button({ variant: "primary" })} self-start`}
        disabled={!htsElements.length}
        onClick={() => onGenerate(generateProducts(htsElements, count, origins))}
      >
        <SparklesIcon className="h-4 w-4" aria-hidden />
        Generate {count.toLocaleString("en-US")} products
      </button>
    </div>
  );
};

const Preview = ({ entries, duplicates }: { entries: ImportedEntry<HtsElement>[]; duplicates: Set<string> }) => {
  const fresh = entries.filter((e) => !duplicates.has(itemKey(toProduct(e))));
  if (!fresh.length) return null;
  return (
    <div className={ui.card}>
      <ul className="divide-y divide-base-300 text-sm">
        {fresh.slice(0, PREVIEW_ROWS).map((e) => (
          <li key={e.line} className="flex items-center gap-3 px-4 py-2">
            <span className={`${mono.className} w-32 shrink-0 font-semibold`}>{e.element.htsno}</span>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
              <span aria-hidden>{e.country.flag}</span>
              {e.country.name}
            </span>
            {e.adjustments && (
              <span className="flex shrink-0 gap-1">
                {adjustmentTags(e.adjustments).map((t) => (
                  <span key={t.id} className={ui.badge("primary")}>
                    {t.label}
                  </span>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
      {fresh.length > PREVIEW_ROWS && (
        <p className={`${ui.caption} border-t border-base-300 px-4 py-2`}>
          and {(fresh.length - PREVIEW_ROWS).toLocaleString("en-US")} more
        </p>
      )}
    </div>
  );
};

const toProduct = (e: ImportedEntry<HtsElement>): NewProduct => ({
  code: htsCodeDigitsOnly(e.element.htsno),
  country: e.country.code,
  adjustments: e.adjustments,
});

export const AddProductsDialog = ({
  open,
  method: initialMethod,
  onClose,
}: {
  open: boolean;
  method: AddMethod;
  onClose: () => void;
}) => {
  const { findElement, items, addProducts } = useTracker();
  const [method, setMethod] = useState<AddMethod>(initialMethod);
  const [pasteText, setPasteText] = useState("");
  const [csv, setCsv] = useState<{ name: string; text: string } | null>(null);
  const [source, setSource] = useState<AddSource>("paste");

  // Opening again starts on the method asked for
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setMethod(initialMethod);
  }

  const parsed = useMemo(() => {
    if (method === "csv") return csv ? parseCsv(csv.text, findElement) : { entries: [], errors: [] };
    if (method === "paste") return parseCatalog(pasteText, findElement);
    return { entries: [], errors: [] };
  }, [method, csv, pasteText, findElement]);

  // Products already in the catalog, or repeated in what's being added
  const duplicates = useMemo(() => {
    const seen = new Set(items.map(itemKey));
    const dupes = new Set<string>();
    parsed.entries.forEach((e) => {
      const key = itemKey(toProduct(e));
      if (seen.has(key)) dupes.add(key);
      seen.add(key);
    });
    return dupes;
  }, [parsed, items]);
  const repeated = parsed.entries.filter((e) => duplicates.has(itemKey(toProduct(e)))).length;
  const ready = parsed.entries.length - repeated;

  const close = () => {
    onClose();
    setPasteText("");
    setCsv(null);
    setSource("paste");
  };

  const add = () => {
    addProducts(parsed.entries.map(toProduct), method === "csv" ? "csv" : source);
    close();
  };

  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* It portals out of the Tracker, so it carries the Tracker's look itself (DESIGN_SYSTEM §15) */}
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl`}>
          <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
            <div className="flex flex-col gap-1">
              <span className={tt.eyebrow("primary")}>Your Imports</span>
              <Dialog.Title className={`${tt.display} m-0 text-xl font-semibold text-base-content`}>Add Imports</Dialog.Title>
              <p className={`${tt.subtitle} m-0`}>Each import is an HTS code and a country of origin</p>
            </div>
            <button
              type="button"
              className="rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content"
              onClick={close}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-5">
            <SegmentedControl<AddMethod> label="How to add imports" options={METHODS} value={method} onChange={setMethod} fullWidth />

            {method === "paste" && (
              <PasteInput
                text={pasteText}
                onChange={(text) => {
                  setPasteText(text);
                  setSource("paste");
                }}
              />
            )}
            {method === "csv" && <CsvInput file={csv} onFile={setCsv} />}
            {method === "generate" && (
              <Generator
                onGenerate={(text) => {
                  setPasteText(text);
                  setSource("generated");
                  setMethod("paste");
                }}
              />
            )}

            {method !== "generate" && (
              <>
                {parsed.errors.length > 0 && <SkippedLines errors={parsed.errors} />}
                <Preview entries={parsed.entries} duplicates={duplicates} />
              </>
            )}
          </div>

          <div className={`${ui.cardFooter} flex flex-wrap items-center justify-between gap-3`}>
            <p className={ui.bodySm} aria-live="polite">
              {method === "generate"
                ? "Generated products go to the paste list first"
                : parsed.entries.length + parsed.errors.length === 0
                  ? "Nothing to add yet"
                  : [
                      `${ready.toLocaleString("en-US")} ${ready === 1 ? "import" : "imports"} ready`,
                      repeated ? `${repeated.toLocaleString("en-US")} already in your imports` : "",
                      parsed.errors.length ? `${parsed.errors.length.toLocaleString("en-US")} skipped` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
            </p>
            <div className="flex gap-2">
              <button type="button" className={ui.button()} onClick={close}>
                Cancel
              </button>
              <button
                type="button"
                className={ui.button({ variant: "primary" })}
                disabled={method === "generate" || ready === 0}
                onClick={add}
              >
                Add {ready > 0 ? `${ready.toLocaleString("en-US")} ` : ""}
                {ready === 1 ? "import" : "imports"}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
