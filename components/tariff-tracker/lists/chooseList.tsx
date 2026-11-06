"use client";

import { FormEvent, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRightIcon, QueueListIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Dialog } from "@/components/ui/Dialog";
import { trackerSans } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { getImportLists, ListTarget, useImportLists } from "../catalogStore";

// "Add to Duty Guard" from outside it (the calculator, HTS pages): which list the import goes to.
// With one list (everyone signed out, and most importers) it goes straight in, so the button is
// still one click; with several (a brokerage's clients), a small dialog asks: one of the lists, or
// a new one by name. Resolves null when closed without choosing.

const n = (x: number) => x.toLocaleString("en-US");

const ChooseListDialog = ({ what, onDone }: { what: string; onDone: (t: ListTarget | null) => void }) => {
  const { lists, activeId } = useImportLists();
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");
  const finish = (t: ListTarget | null) => {
    setOpen(false);
    onDone(t);
  };
  const create = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) finish({ newListName: name.trim() });
  };
  return (
    <Dialog open={open} onClose={() => finish(null)} className="relative z-[80]">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[88vh] w-full max-w-md flex-col gap-4 overflow-y-auto p-6 shadow-2xl`}>
          <button type="button" onClick={() => finish(null)} className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content">
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>
          <div className="flex flex-col gap-1 pr-8">
            <Dialog.Title className={`${tt.display} m-0 text-xl font-semibold text-base-content`}>Add to Which List?</Dialog.Title>
            <p className="m-0 text-sm text-base-content/70">Pick the list {what} goes to, or start a new one.</p>
          </div>
          <ul className="m-0 flex max-h-72 list-none flex-col gap-1 overflow-y-auto p-0">
            {lists.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => finish({ listId: l.id })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 ${l.id === activeId ? "border-primary/40" : "border-base-300"}`}
                >
                  <QueueListIcon className="h-4 w-4 shrink-0 text-base-content/60" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-base-content">{l.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-base-content/60">
                    {n(l.count)} {l.count === 1 ? "import" : "imports"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={create} className="flex gap-2">
            <input
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder="New list name, e.g. Acme Imports"
              aria-label="New list name"
              className={`${ui.input} min-w-0 flex-1`}
            />
            <button type="submit" className={`${ui.button({ variant: "primary" })} h-10 shrink-0`} disabled={!name.trim()}>
              Create
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// what: the thing being added, for the dialog's line ("this import", "these 3 imports")
export const chooseList = (what = "this import"): Promise<ListTarget | null> => {
  const { lists, activeId } = getImportLists();
  if (lists.length <= 1) return Promise.resolve({ listId: activeId });
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    root.render(
      <ChooseListDialog
        what={what}
        onDone={(t) => {
          resolve(t);
          // After the dialog's close has run
          setTimeout(() => {
            root.unmount();
            host.remove();
          }, 300);
        }}
      />
    );
  });
};
