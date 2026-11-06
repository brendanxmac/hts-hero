"use client";

import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as store from "../catalogStore";

// The list changes the UI makes, with their analytics. Duty Guard shows one list at a time; the
// plan counts each import once across them all.

export const switchList = (id: string, source: string) => {
  if (store.getImportLists().activeId === id) return;
  store.setActiveList(id);
  trackEvent(MixpanelEvent.DUTY_GUARD_LIST_SWITCHED, { source, lists: store.getImportLists().lists.length });
};

export const createNamedList = (name: string, source: string) => {
  const id = store.createList(name);
  trackEvent(MixpanelEvent.DUTY_GUARD_LIST_CREATED, { source, lists: store.getImportLists().lists.length });
  return id;
};

export const renameNamedList = (id: string, name: string) => {
  const was = store.getImportLists().lists.find((l) => l.id === id)?.name;
  if (!name.trim() || name.trim() === was) return;
  store.renameList(id, name);
  trackEvent(MixpanelEvent.DUTY_GUARD_LIST_RENAMED);
};

export const deleteNamedList = (id: string) => {
  const list = store.getImportLists().lists.find((l) => l.id === id);
  store.deleteList(id);
  trackEvent(MixpanelEvent.DUTY_GUARD_LIST_DELETED, { imports: list?.count ?? 0, lists: store.getImportLists().lists.length });
};

// Opens the Manage Lists dialog from anywhere in Duty Guard (ListsDialogHost listens)
export const OPEN_LISTS_EVENT = "hts-hero-open-import-lists";
export const openListsDialog = (mode: "manage" | "create" = "manage") =>
  window.dispatchEvent(new CustomEvent(OPEN_LISTS_EVENT, { detail: mode }));
