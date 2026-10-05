"use client";

import { FormEvent, useState } from "react";
import {
  ChangelogEntryInput,
  ChangelogTypeLabels,
  ChangelogTypes,
} from "@/libs/supabase/tariff-changelog";
import * as ui from "@/components/ui/styles";
import { Field } from "../fields/Field";

// The text input's look, grown to fit several lines
// The admin's form for adding or editing a changelog entry
export const ChangelogEntryForm = ({
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
    <form onSubmit={submit} className={`${ui.card} mb-8 flex flex-col gap-4 p-5`}>
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
          className={ui.textarea}
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
