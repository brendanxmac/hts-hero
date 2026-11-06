"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Dialog } from "@/components/ui/Dialog";
import { trackerSans } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";
import { useImportLists } from "../catalogStore";
import { createNamedList, deleteNamedList, OPEN_LISTS_EVENT, renameNamedList, switchList } from "./actions";

// Manage Lists: every list of imports (one per client, say), renamed in place, deleted, or opened,
// and a new one made. Deleting a list removes the imports only it has; ones also in another list stay.

const n = (x: number) => x.toLocaleString("en-US");

const ListRow = ({ id, name, count, active, onOpen, only }: { id: string; name: string; count: number; active: boolean; onOpen: () => void; only: boolean }) => {
  const [draft, setDraft] = useState(name);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setDraft(name), [name]);
  const commit = () => (draft.trim() ? renameNamedList(id, draft) : setDraft(name));

  if (confirming)
    return (
      <li className="flex flex-col gap-2 rounded-xl border border-error/30 bg-error/5 p-3">
        <p className="m-0 text-sm text-base-content">
          Delete <strong>{name}</strong>
          {count > 0 ? ` and its ${n(count)} ${count === 1 ? "import" : "imports"}` : ""}?{" "}
          <span className="text-base-content/70">Imports that are also in another list stay there.</span>
        </p>
        <div className="flex gap-2">
          <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} !bg-error !text-error-content hover:!bg-error/90`} onClick={() => deleteNamedList(id)}>
            {only ? "Empty List" : "Delete List"}
          </button>
          <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      </li>
    );

  return (
    <li className={`flex items-center gap-2 rounded-xl p-1.5 ${active ? "bg-primary/8" : ""}`}>
      <input
        aria-label={`Rename ${name}`}
        value={draft}
        maxLength={80}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            e.stopPropagation();
            setDraft(name);
          }
        }}
        className={`${ui.inputSm} min-w-0 flex-1`}
      />
      <span className="w-20 shrink-0 text-right text-xs tabular-nums text-base-content/60">
        {n(count)} {count === 1 ? "import" : "imports"}
      </span>
      {active ? (
        <span className="flex h-8 w-16 shrink-0 items-center justify-center gap-1 text-xs font-semibold text-primary">
          <CheckIcon className="h-4 w-4" aria-hidden />
          Shown
        </span>
      ) : (
        <button type="button" className={`${ui.button({ variant: "secondary", size: "sm" })} w-16 shrink-0`} onClick={onOpen}>
          Open
        </button>
      )}
      <button
        type="button"
        className={ui.button({ variant: "ghost", size: "sm", icon: true })}
        onClick={() => setConfirming(true)}
        disabled={only && count === 0}
        aria-label={`Delete ${name}`}
        title={only ? "Empty this list" : "Delete this list"}
      >
        <TrashIcon className="h-4 w-4" aria-hidden />
      </button>
    </li>
  );
};

export const ListsDialog = ({ open, mode, onClose }: { open: boolean; mode: "manage" | "create"; onClose: () => void }) => {
  const { lists, activeId } = useImportLists();
  const [name, setName] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const create = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return input.current?.focus();
    createNamedList(name, mode === "create" ? "new_list" : "manage_lists");
    setName("");
    if (mode === "create") onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50" initialFocus={mode === "create" ? input : undefined}>
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[88vh] w-full max-w-lg flex-col gap-5 overflow-y-auto p-6 shadow-2xl sm:p-7`}>
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content">
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>
          <div className="flex flex-col gap-1.5 pr-8">
            <Dialog.Title className={`${tt.display} m-0 text-xl font-semibold text-base-content`}>{mode === "create" ? "New Import List" : "Import Lists"}</Dialog.Title>
            <p className="m-0 text-sm leading-relaxed text-base-content/70">
              Keep a list for each client or business. Duty Guard shows one list at a time, and alerts cover every list. An import in more than one list counts once on your plan.
            </p>
          </div>

          {mode === "manage" && (
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {lists.map((l) => (
                <ListRow
                  key={l.id}
                  id={l.id}
                  name={l.name}
                  count={l.count}
                  active={l.id === activeId}
                  only={lists.length === 1}
                  onOpen={() => {
                    switchList(l.id, "manage_lists");
                    onClose();
                  }}
                />
              ))}
            </ul>
          )}

          <form onSubmit={create} className="flex flex-col gap-2">
            <label htmlFor="tt-new-list" className={ui.fieldLabel}>
              {mode === "create" ? "List name" : "New list"}
            </label>
            <div className="flex gap-2">
              <input
                id="tt-new-list"
                ref={input}
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
                placeholder="A client's name, e.g. Acme Imports"
                className={`${ui.input} min-w-0 flex-1`}
              />
              <button type="submit" className={`${ui.button({ variant: "primary" })} h-10 shrink-0`}>
                <PlusIcon className="h-4 w-4" aria-hidden />
                Create List
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// One dialog for the whole of Duty Guard, opened by openListsDialog
export const ListsDialogHost = () => {
  const [state, setState] = useState<{ open: boolean; mode: "manage" | "create" }>({ open: false, mode: "manage" });
  useEffect(() => {
    const onOpen = (e: Event) => setState({ open: true, mode: (e as CustomEvent).detail === "create" ? "create" : "manage" });
    window.addEventListener(OPEN_LISTS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LISTS_EVENT, onOpen);
  }, []);
  return <ListsDialog open={state.open} mode={state.mode} onClose={() => setState((s) => ({ ...s, open: false }))} />;
};
