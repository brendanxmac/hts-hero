"use client";

import { Menu } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, Cog6ToothIcon, PlusIcon, QueueListIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useImportLists } from "../catalogStore";
import { openListsDialog, switchList } from "./actions";

// The list Duty Guard shows, and switching to another: in the sidebar (under Duty Guard's name, or
// its icon when folded) and in Your Imports' header. Every tab shows the list picked here; alerts
// cover all of them. New List and Manage Lists open the lists dialog (ListsDialogHost).

const n = (x: number) => x.toLocaleString("en-US");

const itemClass = (active: boolean) => `flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-base-content ${active ? "bg-base-200" : ""}`;

type Look = "sidebar" | "collapsed" | "header";

export const ListSwitcher = ({ look, source }: { look: Look; source: string }) => {
  const { lists, activeId } = useImportLists();
  const active = lists.find((l) => l.id === activeId) ?? lists[0];
  if (!active) return null;
  // One list: nothing to switch between, so the sidebar leaves it out (Your Imports' header keeps
  // it, for making a second list)
  if (look !== "header" && lists.length <= 1) return null;

  const button =
    look === "collapsed" ? (
      <Menu.Button
        title={`Import List: ${active.name}`}
        aria-label={`Import list: ${active.name}. Switch list`}
        className="flex h-10 w-10 items-center justify-center self-center rounded-xl text-base-content/70 transition-colors hover:bg-tt-side-active hover:text-base-content focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <QueueListIcon className="h-5 w-5" aria-hidden />
      </Menu.Button>
    ) : look === "sidebar" ? (
      <Menu.Button
        aria-label={`Import list: ${active.name}. Switch list`}
        className="flex w-full items-center gap-2.5 rounded-xl bg-tt-side-card px-3 py-2 text-left transition-colors hover:bg-tt-side-active focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <QueueListIcon className="h-[18px] w-[18px] shrink-0 text-base-content/60" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-base-content/55">Import List</span>
          <span className="truncate text-sm font-semibold text-base-content">{active.name}</span>
        </span>
        <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-base-content/60" aria-hidden />
      </Menu.Button>
    ) : (
      <Menu.Button
        aria-label={`Import list: ${active.name}. Switch list`}
        className="flex h-9 max-w-[18rem] items-center gap-2 rounded-full border border-base-300 bg-base-100 pl-3 pr-2.5 text-sm transition-colors hover:border-base-content/30 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <QueueListIcon className="h-4 w-4 shrink-0 text-base-content/60" aria-hidden />
        <span className="truncate font-semibold text-base-content">{active.name}</span>
        <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-base-content/60" aria-hidden />
      </Menu.Button>
    );

  const place =
    look === "header" ? "right-0 top-full mt-2" : look === "collapsed" ? "left-full top-0 ml-2" : "left-0 right-0 top-full mt-2";

  return (
    <Menu as="div" className={`relative ${look === "collapsed" ? "self-center" : ""}`}>
      {button}
      <Menu.Items className={`${ui.popover} absolute z-40 ${place} w-72 max-w-[calc(100vw-2rem)] focus:outline-hidden`}>
        <p className="m-0 px-2.5 pb-1 pt-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-base-content/55">Import Lists</p>
        <div className="flex max-h-72 flex-col overflow-y-auto">
          {lists.map((l) => (
            <Menu.Item key={l.id}>
              {({ active: hover }) => (
                <button type="button" className={itemClass(hover)} onClick={() => switchList(l.id, source)}>
                  <CheckIcon className={`h-4 w-4 shrink-0 ${l.id === active.id ? "text-primary" : "invisible"}`} aria-hidden />
                  <span className={`min-w-0 flex-1 truncate ${l.id === active.id ? "font-semibold" : ""}`}>{l.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-base-content/60">{n(l.count)}</span>
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
        <div className="my-1 h-px bg-base-300" aria-hidden />
        <Menu.Item>
          {({ active: hover }) => (
            <button type="button" className={itemClass(hover)} onClick={() => openListsDialog("create")}>
              <PlusIcon className="h-4 w-4 shrink-0 text-base-content/70" aria-hidden />
              New List
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active: hover }) => (
            <button type="button" className={itemClass(hover)} onClick={() => openListsDialog("manage")}>
              <Cog6ToothIcon className="h-4 w-4 shrink-0 text-base-content/70" aria-hidden />
              Manage Lists
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};
