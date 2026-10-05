"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChangelogEntry,
  ChangelogEntryInput,
  ChangelogTypeLabels,
  ChangelogTypes,
  formatChangelogDate,
} from "@/libs/supabase/tariff-changelog";
import { ChangelogTypeBadge } from "./Changelog";
import { Field } from "./controls";
import * as ui from "../ui/styles";

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

const emptyDraft = (): ChangelogEntryInput => ({
  entry_date: today(),
  type: "fix",
  title: "",
  summary: "",
  revision: null,
  status: "published",
});

const sortEntries = (entries: ChangelogEntry[]) =>
  [...entries].sort(
    (a, b) => b.entry_date.localeCompare(a.entry_date) || b.created_at.localeCompare(a.created_at),
  );

const request = async (method: "POST" | "PATCH" | "DELETE", body?: object, id?: string) => {
  const res = await fetch(`/api/tariff-changelog${id ? `?id=${encodeURIComponent(id)}` : ""}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  return json as { entry?: ChangelogEntry };
};

// The full changelog. The admin can add, edit, publish and delete entries.
export const ChangelogList = ({
  initialEntries,
  isAdmin,
}: {
  initialEntries: ChangelogEntry[];
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const replace = (entry: ChangelogEntry) =>
    setEntries((current) => sortEntries([...current.filter((e) => e.id !== entry.id), entry]));

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const save = (input: ChangelogEntryInput, id?: string) =>
    run(async () => {
      const { entry } = id ? await request("PATCH", { ...input, id }) : await request("POST", input);
      replace(entry);
      setEditing(null);
    });

  const setStatus = (entry: ChangelogEntry, status: ChangelogEntry["status"]) =>
    run(async () => replace((await request("PATCH", { id: entry.id, status })).entry));

  const remove = (entry: ChangelogEntry) => {
    if (!window.confirm(`Delete "${entry.title}"? This can't be undone.`)) return;
    run(async () => {
      await request("DELETE", undefined, entry.id);
      setEntries((current) => current.filter((e) => e.id !== entry.id));
    });
  };

  return (
    <div className="mt-10">
      {isAdmin && (
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-base-content/60">
            Admin: drafts are only visible to you.
          </p>
          {editing !== "new" && (
            <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => setEditing("new")}>
              Add entry
            </button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className={`${ui.notice("error")} mb-4 text-sm text-base-content`}>
          {error}
        </p>
      )}
      {editing === "new" && (
        <EntryForm initial={emptyDraft()} onCancel={() => setEditing(null)} onSave={(input) => save(input)} />
      )}

      {entries.length === 0 ? (
        <p className="rounded-lg border border-base-300 bg-base-100 px-5 py-8 text-center text-sm text-base-content/60 shadow-sm">
          No updates yet.
        </p>
      ) : (
        <ol className="relative border-l border-base-300 ml-1.5">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-6 pb-8 last:pb-0">
              <span
                className="absolute -left-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-base-200 bg-primary"
                aria-hidden
              />
              {editing === entry.id ? (
                <EntryForm
                  initial={entry}
                  onCancel={() => setEditing(null)}
                  onSave={(input) => save(input, entry.id)}
                />
              ) : (
                <article>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/60">
                    <time dateTime={entry.entry_date}>{formatChangelogDate(entry.entry_date)}</time>
                    <ChangelogTypeBadge type={entry.type} />
                    {entry.status === "draft" && (
                      <span className={ui.badge("warning")}>
                        Draft
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold leading-snug text-base-content">{entry.title}</h2>
                  <p className={`${ui.body} mt-1.5`}>{entry.summary}</p>
                  {isAdmin && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className={ui.button({ size: "sm" })} onClick={() => setEditing(entry.id)}>
                        Edit
                      </button>
                      {entry.status === "draft" ? (
                        <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => setStatus(entry, "published")}>
                          Publish
                        </button>
                      ) : (
                        <button type="button" className={ui.button({ size: "sm" })} onClick={() => setStatus(entry, "draft")}>
                          Unpublish
                        </button>
                      )}
                      <button type="button" className={ui.button({ size: "sm" })} onClick={() => remove(entry)}>
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const EntryForm = ({
  initial,
  onSave,
  onCancel,
}: {
  initial: ChangelogEntryInput;
  onSave: (input: ChangelogEntryInput) => Promise<void>;
  onCancel: () => void;
}) => {
  const [draft, setDraft] = useState<ChangelogEntryInput>({
    entry_date: initial.entry_date,
    type: initial.type,
    title: initial.title,
    summary: initial.summary,
    revision: initial.revision,
    status: initial.status,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ChangelogEntryInput>(key: K, value: ChangelogEntryInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  return (
    <form
      onSubmit={submit}
      className="mb-8 flex flex-col gap-4 rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date" htmlFor="cl-date">
          <input
            id="cl-date"
            type="date"
            required
            className={ui.input}
            value={draft.entry_date}
            onChange={(e) => set("entry_date", e.target.value)}
          />
        </Field>
        <Field label="Type" htmlFor="cl-type">
          <select
            id="cl-type"
            className={ui.select}
            value={draft.type}
            onChange={(e) => set("type", e.target.value as ChangelogEntryInput["type"])}
          >
            {ChangelogTypes.map((type) => (
              <option key={type} value={type}>
                {ChangelogTypeLabels[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="cl-status">
          <select
            id="cl-status"
            className={ui.select}
            value={draft.status}
            onChange={(e) => set("status", e.target.value as ChangelogEntryInput["status"])}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </Field>
      </div>
      {draft.type === "revision" && (
        <Field label="HTS revision" htmlFor="cl-revision" hint="e.g. 2026HTSRev7">
          <input
            id="cl-revision"
            className={ui.input}
            value={draft.revision ?? ""}
            onChange={(e) => set("revision", e.target.value || null)}
          />
        </Field>
      )}
      <Field label="Title" htmlFor="cl-title" hint="One line: what changed.">
        <input
          id="cl-title"
          required
          maxLength={120}
          className={ui.input}
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Summary" htmlFor="cl-summary" hint="One to three sentences: what it means for an estimate.">
        <textarea
          id="cl-summary"
          required
          rows={3}
          className="textarea textarea-bordered w-full text-base leading-relaxed"
          value={draft.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </Field>
      <div className="flex justify-end gap-2">
        <button type="button" className={ui.button({ size: "sm" })} onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className={ui.button({ variant: "primary", size: "sm" })} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
};
